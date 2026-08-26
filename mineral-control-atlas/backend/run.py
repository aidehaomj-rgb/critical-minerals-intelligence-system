"""Dependency-free local collector for the critical-minerals dashboard.

This runner intentionally uses only the Python standard library so the
dashboard's auto-refresh works after a normal double-click launch.
"""
from __future__ import annotations

import hashlib
import json
import sqlite3
import subprocess
import threading
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote_plus, urlparse
from uuid import uuid4

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "critical_minerals_intelligence.sqlite3"
AUTO_REFRESH_SECONDS = 6 * 60 * 60
MAX_ITEMS_PER_MINERAL = 8
MINERALS = {
    "tungsten": "钨 tungsten tungsten carbide", "gallium": "镓 gallium", "germanium": "锗 germanium",
    "graphite": "石墨 graphite", "antimony": "锑 antimony", "diamond": "金刚石 diamond",
    "tellurium": "碲 tellurium", "bismuth": "铋 bismuth", "molybdenum": "钼 molybdenum", "indium": "铟 indium",
    "samarium": "钐 samarium", "gadolinium": "钆 gadolinium", "terbium": "铽 terbium", "dysprosium": "镝 dysprosium",
    "lutetium": "镥 lutetium", "scandium": "钪 scandium", "yttrium": "钇 yttrium", "holmium": "钬 holmium",
    "erbium": "铒 erbium", "thulium": "铥 thulium", "europium": "铕 europium", "ytterbium": "镱 ytterbium",
    "lithium": "锂 lithium", "nickel": "镍 nickel", "cobalt": "钴 cobalt", "manganese": "锰 manganese",
}
JOBS: dict[str, dict] = {}
ACTIVE_JOB: str | None = None
LOCK = threading.Lock()

def now() -> str:
    return datetime.now(timezone.utc).isoformat()

def db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def init_db() -> None:
    with db() as connection:
        connection.executescript("""
        CREATE TABLE IF NOT EXISTS collection_jobs (
          id TEXT PRIMARY KEY, status TEXT NOT NULL, requested_minerals TEXT NOT NULL,
          created_at TEXT NOT NULL, started_at TEXT, completed_at TEXT,
          items_found INTEGER NOT NULL DEFAULT 0, items_new INTEGER NOT NULL DEFAULT 0, error TEXT
        );
        CREATE TABLE IF NOT EXISTS collected_items (
          id TEXT PRIMARY KEY, job_id TEXT NOT NULL, mineral_id TEXT NOT NULL,
          title TEXT NOT NULL, summary TEXT, url TEXT, source_name TEXT NOT NULL,
          published_at TEXT, collected_at TEXT NOT NULL, category TEXT NOT NULL,
          language TEXT, raw_json TEXT, UNIQUE(mineral_id, url)
        );
        """)

def category_for(value: str) -> str:
    value = value.lower()
    if any(word in value for word in ("customs", "seizure", "smuggling", "执法", "走私", "查获", "海关")): return "执法监管"
    if any(word in value for word in ("export control", "export ban", "sanction", "管制", "许可", "禁运")): return "政策管制"
    if any(word in value for word in ("mine", "refinery", "plant", "investment", "supply chain", "project", "建厂", "投资", "供应链")): return "供应链与替代"
    return "市场动态"

def clean(value: str | None) -> str:
    return " ".join((value or "").replace("\n", " ").split())

def collect_one(mineral_id: str) -> list[dict]:
    # 先按矿种本身宽检索，后续由分类和人工核验筛掉市场噪声；过度叠加
    # "管制/海关/供应链" 会让很多矿种 RSS 无结果，反而漏掉新增执法信息。
    query = quote_plus(f'{MINERALS[mineral_id]} 关键矿产')
    url = f"https://news.google.com/rss/search?q={query}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
    # 通过 Windows 网络栈请求，以继承本机代理、证书和内网网络策略。
    command = "[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new();(Invoke-WebRequest -UseBasicParsing -TimeoutSec 20 -Uri '" + url + "').Content"
    response = subprocess.run(["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", command], capture_output=True, text=True, encoding="utf-8", timeout=28)
    if response.returncode != 0:
        raise RuntimeError((response.stderr or "公开源请求失败").strip())
    root = ET.fromstring(response.stdout)
    records = []
    for element in root.findall("./channel/item")[:MAX_ITEMS_PER_MINERAL]:
        title, url, summary = clean(element.findtext("title")), clean(element.findtext("link")), clean(element.findtext("description"))
        source = element.find("source")
        if title and url:
            records.append({"id": hashlib.sha256(f"{mineral_id}|{url}".encode()).hexdigest()[:24], "mineral_id": mineral_id, "title": title, "summary": summary[:1000], "url": url, "source_name": clean(source.text if source is not None else None) or "Google News RSS", "published_at": clean(element.findtext("pubDate")) or None, "category": category_for(title + " " + summary), "language": "unknown"})
    return records

def persist_job(job: dict) -> None:
    with db() as connection:
        connection.execute("INSERT OR REPLACE INTO collection_jobs (id,status,requested_minerals,created_at,started_at,completed_at,items_found,items_new,error) VALUES (?,?,?,?,?,?,?,?,?)", (job["job_id"],job["status"],json.dumps(job["minerals"],ensure_ascii=False),job["created_at"],job.get("started_at"),job.get("completed_at"),job["items_found"],job["items_new"],job.get("error")))

def run_job(job_id: str) -> None:
    global ACTIVE_JOB
    job = JOBS[job_id]; job.update(status="running", started_at=now()); persist_job(job)
    records, errors = [], []
    # 并行限制为 6，避免 26 个矿种串行等待造成页面“更新采集”长时间无响应。
    with ThreadPoolExecutor(max_workers=6, thread_name_prefix="mineral-rss") as executor:
        futures = {executor.submit(collect_one, mineral_id): mineral_id for mineral_id in job["minerals"]}
        for future in as_completed(futures):
            mineral_id = futures[future]
            try: records.extend(future.result())
            except Exception as exc: errors.append(f"{mineral_id}: {type(exc).__name__}: {exc}")
    new_count = 0
    with db() as connection:
        for item in records:
            item["job_id"], item["collected_at"] = job_id, now()
            cursor = connection.execute("INSERT OR IGNORE INTO collected_items (id,job_id,mineral_id,title,summary,url,source_name,published_at,collected_at,category,language,raw_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", (item["id"],item["job_id"],item["mineral_id"],item["title"],item["summary"],item["url"],item["source_name"],item["published_at"],item["collected_at"],item["category"],item["language"],json.dumps(item,ensure_ascii=False)))
            new_count += cursor.rowcount
    job.update(status="completed", completed_at=now(), items_found=len(records), items_new=new_count, error="; ".join(errors) if errors else None); persist_job(job)
    with LOCK: ACTIVE_JOB = None

def start_collection(minerals: list[str]) -> dict:
    global ACTIVE_JOB
    requested = list(MINERALS) if "all" in minerals else list(dict.fromkeys(minerals))
    invalid = [item for item in requested if item not in MINERALS]
    if invalid: raise ValueError("未知矿种：" + ", ".join(invalid))
    with LOCK:
        if ACTIVE_JOB and JOBS.get(ACTIVE_JOB, {}).get("status") in {"queued", "running"}: return JOBS[ACTIVE_JOB]
        job_id = f"cm-{uuid4().hex[:12]}"; job = {"job_id":job_id,"status":"queued","minerals":requested,"created_at":now(),"started_at":None,"completed_at":None,"items_found":0,"items_new":0,"error":None}
        JOBS[job_id] = job; ACTIVE_JOB = job_id; persist_job(job); threading.Thread(target=run_job,args=(job_id,),daemon=True).start(); return job

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_): pass
    def send_json(self, value: dict, status: int = 200):
        raw = json.dumps(value, ensure_ascii=False).encode("utf-8"); self.send_response(status); self.send_header("Content-Type","application/json; charset=utf-8"); self.send_header("Content-Length",str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        parsed, query = urlparse(self.path), parse_qs(urlparse(self.path).query)
        if parsed.path == "/health": return self.send_json({"status":"ok","service":"critical-minerals-collector","minerals":len(MINERALS)})
        if parsed.path == "/api/summary":
            with db() as connection:
                total = connection.execute("SELECT COUNT(*) FROM collected_items").fetchone()[0]; latest = connection.execute("SELECT MAX(collected_at) FROM collected_items").fetchone()[0]; jobs = connection.execute("SELECT COUNT(*) FROM collection_jobs WHERE status='completed'").fetchone()[0]
            return self.send_json({"total_candidates":total,"last_collected_at":latest,"completed_jobs":jobs,"auto_refresh_seconds":AUTO_REFRESH_SECONDS,"promotion_rule":"候选信息经人工核验后才计入正式情报快照和执法案例"})
        if parsed.path.startswith("/api/jobs/"):
            job_id = parsed.path.rsplit("/",1)[-1]; job = JOBS.get(job_id)
            if not job:
                with db() as connection: row = connection.execute("SELECT * FROM collection_jobs WHERE id=?",(job_id,)).fetchone()
                job = {"job_id":row["id"],"status":row["status"],"minerals":json.loads(row["requested_minerals"]),"created_at":row["created_at"],"started_at":row["started_at"],"completed_at":row["completed_at"],"items_found":row["items_found"],"items_new":row["items_new"],"error":row["error"]} if row else None
            return self.send_json(job or {"detail":"采集任务不存在"}, 200 if job else 404)
        if parsed.path == "/api/items":
            page, page_size = max(1,int(query.get("page",["1"])[0])), min(200,max(1,int(query.get("page_size",["100"])[0]))); clauses=[]; params=[]
            for key,column in (("job_id","job_id"),("mineral","mineral_id")):
                if query.get(key): clauses.append(column+"=?"); params.append(query[key][0])
            where = "WHERE " + " AND ".join(clauses) if clauses else ""
            with db() as connection:
                total=connection.execute(f"SELECT COUNT(*) FROM collected_items {where}",params).fetchone()[0]; rows=connection.execute(f"SELECT * FROM collected_items {where} ORDER BY collected_at DESC LIMIT ? OFFSET ?",params+[page_size,(page-1)*page_size]).fetchall()
            return self.send_json({"items":[dict(row) for row in rows],"total":total,"page":page,"page_size":page_size})
        self.send_json({"detail":"not found"},404)
    def do_POST(self):
        if urlparse(self.path).path != "/api/collect": return self.send_json({"detail":"not found"},404)
        try:
            body=json.loads(self.rfile.read(int(self.headers.get("Content-Length","0"))).decode("utf-8") or "{}"); return self.send_json(start_collection(body.get("minerals",["all"])),202)
        except ValueError as exc: return self.send_json({"detail":str(exc)},422)
        except Exception as exc: return self.send_json({"detail":str(exc)},500)

def auto_loop() -> None:
    time.sleep(8)
    while True:
        try: start_collection(["all"])
        except Exception: pass
        time.sleep(AUTO_REFRESH_SECONDS)

if __name__ == "__main__":
    init_db(); threading.Thread(target=auto_loop,daemon=True).start(); ThreadingHTTPServer(("127.0.0.1",8110),Handler).serve_forever()
