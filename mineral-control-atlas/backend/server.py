"""Standalone public-intelligence collector for the critical-minerals dashboard.

It deliberately stores only public RSS results and does not use GatherInfo,
browser sessions, or any third-party account credentials.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import os
import sqlite3
import subprocess
import xml.etree.ElementTree as ET
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "critical_minerals_intelligence.sqlite3"
GOOGLE_NEWS_RSS = "https://news.google.com/rss/search"
MAX_ITEMS_PER_MINERAL = 8
COLLECT_CONCURRENCY = 5
AUTO_REFRESH_SECONDS = 6 * 60 * 60

MINERALS: dict[str, dict[str, str]] = {
    "tungsten": {"name": "钨", "english": "tungsten tungsten carbide"},
    "gallium": {"name": "镓", "english": "gallium"}, "germanium": {"name": "锗", "english": "germanium"},
    "graphite": {"name": "石墨", "english": "graphite"}, "antimony": {"name": "锑", "english": "antimony"},
    "diamond": {"name": "金刚石", "english": "diamond"}, "tellurium": {"name": "碲", "english": "tellurium"},
    "bismuth": {"name": "铋", "english": "bismuth"}, "molybdenum": {"name": "钼", "english": "molybdenum"},
    "indium": {"name": "铟", "english": "indium"}, "samarium": {"name": "钐", "english": "samarium"},
    "gadolinium": {"name": "钆", "english": "gadolinium"}, "terbium": {"name": "铽", "english": "terbium"},
    "dysprosium": {"name": "镝", "english": "dysprosium"}, "lutetium": {"name": "镥", "english": "lutetium"},
    "scandium": {"name": "钪", "english": "scandium"}, "yttrium": {"name": "钇", "english": "yttrium"},
    "holmium": {"name": "钬", "english": "holmium"}, "erbium": {"name": "铒", "english": "erbium"},
    "thulium": {"name": "铥", "english": "thulium"}, "europium": {"name": "铕", "english": "europium"},
    "ytterbium": {"name": "镱", "english": "ytterbium"}, "lithium": {"name": "锂", "english": "lithium"},
    "nickel": {"name": "镍", "english": "nickel"}, "cobalt": {"name": "钴", "english": "cobalt"}, "manganese": {"name": "锰", "english": "manganese"},
}

JOBS: dict[str, dict] = {}
ACTIVE_JOB: str | None = None
LOCK = asyncio.Lock()


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
        CREATE INDEX IF NOT EXISTS idx_items_job ON collected_items(job_id, collected_at DESC);
        CREATE INDEX IF NOT EXISTS idx_items_mineral ON collected_items(mineral_id, published_at DESC);
        """)


def category_for(text: str) -> str:
    value = text.lower()
    if any(word in value for word in ("customs", "seizure", "smuggling", "执法", "走私", "查获", "海关")):
        return "执法监管"
    if any(word in value for word in ("export control", "export ban", "sanction", "管制", "许可", "禁运")):
        return "政策管制"
    if any(word in value for word in ("mine", "refinery", "plant", "investment", "supply chain", "project", "建厂", "投资", "供应链")):
        return "供应链与替代"
    return "市场动态"


def clean_text(value: str | None) -> str:
    return " ".join((value or "").replace("\n", " ").split())


def parse_rss(payload: str, mineral_id: str) -> list[dict]:
    try:
        root = ET.fromstring(payload)
    except ET.ParseError:
        return []
    output: list[dict] = []
    for element in root.findall("./channel/item")[:MAX_ITEMS_PER_MINERAL]:
        title = clean_text(element.findtext("title"))
        url = clean_text(element.findtext("link"))
        description = clean_text(element.findtext("description"))
        published = clean_text(element.findtext("pubDate"))
        source = element.find("source")
        source_name = clean_text(source.text if source is not None else None) or "Google News RSS"
        if not title or not url:
            continue
        output.append({
            "id": hashlib.sha256(f"{mineral_id}|{url}".encode("utf-8")).hexdigest()[:24],
            "mineral_id": mineral_id, "title": title, "summary": description[:1000], "url": url,
            "source_name": source_name, "published_at": published or None,
            "category": category_for(f"{title} {description}"), "language": "unknown",
        })
    return output


def fetch_public_rss(url: str) -> str:
    """Use the Windows system network stack, which follows local proxy policy."""
    command = (
        "[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new();"
        f"(Invoke-WebRequest -UseBasicParsing -TimeoutSec 30 '{url}').Content"
    )
    result = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", command],
        capture_output=True, text=True, encoding="utf-8", timeout=40,
    )
    if result.returncode != 0:
        raise RuntimeError((result.stderr or "RSS 请求失败").strip())
    return result.stdout


async def collect_one(mineral_id: str, semaphore: asyncio.Semaphore) -> tuple[list[dict], str | None]:
    mineral = MINERALS[mineral_id]
    query = f'{mineral["name"]} {mineral["english"]} export control customs supply chain'
    async with semaphore:
        try:
            url = f"{GOOGLE_NEWS_RSS}?{urlencode({'q': query, 'hl': 'zh-CN', 'gl': 'CN', 'ceid': 'CN:zh-Hans'})}"
            return parse_rss(await asyncio.to_thread(fetch_public_rss, url), mineral_id), None
        except Exception as exc:
            return [], f"{mineral_id}: {type(exc).__name__}: {exc}"


def persist_job(job: dict) -> None:
    with db() as connection:
        connection.execute("""INSERT OR REPLACE INTO collection_jobs
        (id,status,requested_minerals,created_at,started_at,completed_at,items_found,items_new,error)
        VALUES (?,?,?,?,?,?,?,?,?)""", (job["job_id"], job["status"], json.dumps(job["minerals"], ensure_ascii=False), job["created_at"], job.get("started_at"), job.get("completed_at"), job["items_found"], job["items_new"], job.get("error")))


def persist_items(job_id: str, items: list[dict]) -> int:
    new_count = 0
    with db() as connection:
        for item in items:
            item["job_id"] = job_id
            item["collected_at"] = now()
            cursor = connection.execute("""INSERT OR IGNORE INTO collected_items
            (id,job_id,mineral_id,title,summary,url,source_name,published_at,collected_at,category,language,raw_json)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""", (item["id"], job_id, item["mineral_id"], item["title"], item["summary"], item["url"], item["source_name"], item["published_at"], item["collected_at"], item["category"], item["language"], json.dumps(item, ensure_ascii=False)))
            new_count += cursor.rowcount
    return new_count


async def run_job(job_id: str) -> None:
    global ACTIVE_JOB
    job = JOBS[job_id]
    job.update(status="running", started_at=now())
    persist_job(job)
    semaphore = asyncio.Semaphore(COLLECT_CONCURRENCY)
    results = await asyncio.gather(*(collect_one(mineral_id, semaphore) for mineral_id in job["minerals"]))
    items = [item for records, _ in results for item in records]
    errors = [error for _, error in results if error]
    job["items_found"] = len(items)
    job["items_new"] = persist_items(job_id, items)
    job.update(status="completed", completed_at=now(), error="; ".join(errors) if errors else None)
    persist_job(job)
    async with LOCK:
        ACTIVE_JOB = None


class CollectRequest(BaseModel):
    minerals: list[str] = Field(default_factory=lambda: ["all"])


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    async def automatic_collection_loop() -> None:
        # 仅采集公开网页候选，不自动把未经核验的结果计入正式情报快照或执法案例。
        await asyncio.sleep(8)
        while True:
            try:
                await start_collection(CollectRequest(minerals=["all"]))
            except Exception:
                pass
            await asyncio.sleep(AUTO_REFRESH_SECONDS)

    task = asyncio.create_task(automatic_collection_loop(), name="critical-minerals-auto-collector")
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="关键矿产信息情报采集后端", version="1.0.0", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "service": "critical-minerals-collector", "minerals": len(MINERALS)}


@app.post("/api/collect", status_code=202)
async def start_collection(request: CollectRequest):
    global ACTIVE_JOB
    requested = list(MINERALS) if "all" in request.minerals else list(dict.fromkeys(request.minerals))
    unknown = [mineral for mineral in requested if mineral not in MINERALS]
    if unknown:
        raise HTTPException(422, f"未知矿种：{', '.join(unknown)}")
    async with LOCK:
        if ACTIVE_JOB and JOBS.get(ACTIVE_JOB, {}).get("status") in {"queued", "running"}:
            return JOBS[ACTIVE_JOB]
        job_id = f"cm-{uuid4().hex[:12]}"
        job = {"job_id": job_id, "status": "queued", "minerals": requested, "created_at": now(), "started_at": None, "completed_at": None, "items_found": 0, "items_new": 0, "error": None}
        JOBS[job_id] = job
        ACTIVE_JOB = job_id
        persist_job(job)
        asyncio.create_task(run_job(job_id), name=job_id)
        return job


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str):
    if job_id in JOBS:
        return JOBS[job_id]
    with db() as connection:
        row = connection.execute("SELECT * FROM collection_jobs WHERE id=?", (job_id,)).fetchone()
    if not row:
        raise HTTPException(404, "采集任务不存在")
    return {"job_id": row["id"], "status": row["status"], "minerals": json.loads(row["requested_minerals"]), "created_at": row["created_at"], "started_at": row["started_at"], "completed_at": row["completed_at"], "items_found": row["items_found"], "items_new": row["items_new"], "error": row["error"]}


@app.get("/api/items")
def list_items(job_id: str | None = None, mineral: str | None = None, page: int = 1, page_size: int = 100):
    page = max(1, page)
    page_size = min(max(1, page_size), 200)
    clauses, params = [], []
    if job_id:
        clauses.append("job_id=?"); params.append(job_id)
    if mineral:
        clauses.append("mineral_id=?"); params.append(mineral)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    with db() as connection:
        total = connection.execute(f"SELECT COUNT(*) FROM collected_items {where}", params).fetchone()[0]
        rows = connection.execute(f"SELECT * FROM collected_items {where} ORDER BY collected_at DESC LIMIT ? OFFSET ?", [*params, page_size, (page - 1) * page_size]).fetchall()
    return {"items": [dict(row) for row in rows], "total": total, "page": page, "page_size": page_size}


@app.get("/api/summary")
def collection_summary():
    """Small read-only status payload for dashboard refresh indicators."""
    with db() as connection:
        total = connection.execute("SELECT COUNT(*) FROM collected_items").fetchone()[0]
        latest = connection.execute("SELECT MAX(collected_at) FROM collected_items").fetchone()[0]
        jobs = connection.execute("SELECT COUNT(*) FROM collection_jobs WHERE status='completed'").fetchone()[0]
    return {
        "total_candidates": total,
        "last_collected_at": latest,
        "completed_jobs": jobs,
        "auto_refresh_seconds": AUTO_REFRESH_SECONDS,
        "promotion_rule": "候选信息经人工核验后才计入正式情报快照和执法案例",
    }
