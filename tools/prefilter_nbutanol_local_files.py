#!/usr/bin/env python3
from __future__ import annotations
import csv, json, re, zipfile, sys
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone, timedelta

ROOT = Path(r"D:\易迅数据")
OUT = ROOT / "反倾销税深度分析报告" / "18_正丁醇"; OUT.mkdir(parents=True, exist_ok=True)
CSV = OUT / "正丁醇_本地预筛文件台账.csv"; JSON = OUT / "正丁醇_本地预筛文件台账.json"
EXT = {".xlsx", ".xls", ".csv", ".json"}
HS = re.compile(r"(?<!\d)290513(?:00)?(?:\.0)?(?!\d)", re.I)
CAS_UN = re.compile(r"(?<!\d)71[\s-]*36[\s-]*3(?!\d)|\bUN[\s-]*1120\b", re.I)
NAME = re.compile(r"\bN[\s-]*BUTANOL\b|\b1[\s-]*BUTANOL\b|\bBUTAN[\s-]*1[\s-]*OL\b|\bN[\s-]*BUTYL[\s-]*ALCOHOL\b|正丁醇|1[—－-]丁醇|丙原醇|酪醇", re.I)
EXCL = re.compile(r"TERT[\s-]*BUTANOL|T[\s-]*BUTANOL|ISOBUTANOL|ISO[\s-]*BUTYL|2[\s-]*METHYL[\s-]*1[\s-]*PROPANOL|SEC[\s-]*BUTANOL|2[\s-]*BUTANOL|BUTYL[\s-]*(?:ACETATE|ACRYLATE|ETHER)|BUTANEDIOL|BUTANONE|叔丁醇|异丁醇|仲丁醇|醋酸丁酯|丙烯酸丁酯|丁二醇|丁酮", re.I)

def dec(b):
    for e in ("utf-8", "utf-8-sig", "utf-16", "gb18030", "latin-1"):
        try: return b.decode(e)
        except UnicodeDecodeError: pass
    return b.decode("utf-8", errors="replace")

def scan(s):
    return {"hs": sorted(set(m.group(0) for m in HS.finditer(s)))[:30],
            "cas_un": sorted(set(m.group(0) for m in CAS_UN.finditer(s)))[:30],
            "name": sorted(set(m.group(0) for m in NAME.finditer(s)))[:50],
            "exclude": sorted(set(m.group(0) for m in EXCL.finditer(s)))[:50]}

def merge(a, b):
    for k in a: a[k].update(b[k])

def source(p):
    s = str(p)
    return "project_output_or_qa" if "反倾销税深度分析报告" in s else ("easyxun_page_capture" if "_易迅页面采集" in s else "root_download_or_user_file")

def inspect(p):
    a = {k: set() for k in ("hs", "cas_un", "name", "exclude")}; err=[]; members=0
    try:
        if p.suffix.lower() == ".xlsx":
            with zipfile.ZipFile(p) as z:
                names=[n for n in z.namelist() if n=="xl/sharedStrings.xml" or (n.startswith("xl/worksheets/") and n.endswith(".xml"))]
                for n in names: members += 1; merge(a, scan(dec(z.read(n))))
        else: members=1; merge(a, scan(dec(p.read_bytes())))
    except Exception as e: err=[f"{type(e).__name__}: {e}"]
    hs, cu, name, excl = map(lambda k: sorted(a[k]), ("hs", "cas_un", "name", "exclude"))
    if hs and (cu or name): cl="strong_hs_product"
    elif cu or name: cl="product_identifier"
    elif hs: cl="hs_only"
    else: cl="no_hit"
    return {"file":str(p),"name":p.name,"extension":p.suffix.lower(),"size_bytes":p.stat().st_size,"source_class":source(p),"scanned_members":members,"prefilter_class":cl,"hs_hits":hs,"cas_un_hits":cu,"name_hits":name,"exclusion_hits":excl,"errors":err}

def main():
    files=sorted(p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in EXT and OUT not in p.parents and not p.name.startswith("~$")); rows=[]
    for i,p in enumerate(files,1):
        rows.append(inspect(p))
        if i%25==0 or i==len(files):
            sm={"updated_at":datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds"),"files_total":len(files),"files_processed":i,"class_counts":dict(Counter(r["prefilter_class"] for r in rows)),"error_files":sum(bool(r["errors"]) for r in rows),"candidate_files":sum(r["prefilter_class"]!="no_hit" for r in rows),"checkpoint_complete":i==len(files)}
            with CSV.open("w",encoding="utf-8-sig",newline="") as f:
                w=csv.DictWriter(f,fieldnames=list(rows[0])); w.writeheader()
                for r in rows:
                    x=dict(r)
                    for k in ("hs_hits","cas_un_hits","name_hits","exclusion_hits","errors"): x[k]=json.dumps(x[k],ensure_ascii=False,separators=(",",":"))
                    w.writerow(x)
            JSON.write_text(json.dumps({"summary":sm,"files":rows},ensure_ascii=False,indent=2),encoding="utf-8")
            print(json.dumps(sm,ensure_ascii=True),flush=True)
    return 0

if __name__ == "__main__": sys.exit(main())
