#!/usr/bin/env python3
from __future__ import annotations
import csv,json,re,zipfile,sys
from pathlib import Path
from collections import Counter
from datetime import datetime,timezone,timedelta

ROOT=Path(r"D:\易迅数据")
OUT=ROOT/"反倾销税深度分析报告"/"17_邻二氯苯"; OUT.mkdir(parents=True,exist_ok=True)
CSV=OUT/"邻二氯苯_本地预筛文件台账.csv"; JSON=OUT/"邻二氯苯_本地预筛文件台账.json"
EXT={".xlsx",".xls",".csv",".json"}
HS=re.compile(r"(?<!\d)290391(?:10|20|00)?(?:\.0)?(?!\d)",re.I)
STRONG=re.compile(r"95[\s-]*50[\s-]*1|UN[\s-]*1591",re.I)
NAME=re.compile(r"ORTHO[\s-]*(?:DI)?CHLORO[\s-]*BENZ(?:ENE|OL)|1[,.\s-]*2[\s-]*DICHLOROBENZENE|O[\s-]*DICHLOROBENZENE|\bODCB\b|邻二氯苯|邻位二氯苯",re.I)
EXCL=re.compile(r"PARA|1[,.\s-]*4[\s-]*DICHLORO|P[\s-]*DICHLORO|META|1[,.\s-]*3[\s-]*DICHLORO|DICHLORONITRO|二氯硝基|DICHLOROPHENOL|二氯苯酚|DICHLOROANIL|二氯苯胺",re.I)

def dec(b):
 for e in ("utf-8","utf-8-sig","utf-16","gb18030","latin-1"):
  try:return b.decode(e)
  except UnicodeDecodeError:pass
 return b.decode("utf-8",errors="replace")
def scan(s):
 return {"hs":sorted(set(x.group(0) for x in HS.finditer(s)))[:30],"strong":sorted(set(x.group(0) for x in STRONG.finditer(s)))[:30],"name":sorted(set(x.group(0) for x in NAME.finditer(s)))[:50],"exclude":sorted(set(x.group(0) for x in EXCL.finditer(s)))[:50]}
def merge(a,b):
 for k in a:a[k].update(b[k])
def source(p):
 s=str(p)
 return "project_output_or_qa" if "反倾销税深度分析报告" in s else ("easyxun_page_capture" if "_易迅页面采集" in s else "root_download_or_user_file")
def inspect(p):
 a={k:set() for k in ("hs","strong","name","exclude")}; err=[]; members=0
 try:
  if p.suffix.lower()==".xlsx":
   with zipfile.ZipFile(p) as z:
    ns=[n for n in z.namelist() if n=="xl/sharedStrings.xml" or (n.startswith("xl/worksheets/") and n.endswith(".xml"))]
    for n in ns: members+=1; merge(a,scan(dec(z.read(n))))
  else: members=1; merge(a,scan(dec(p.read_bytes())))
 except Exception as e:err=[f"{type(e).__name__}: {e}"]
 hs,strong,name,excl=map(lambda k:sorted(a[k]),("hs","strong","name","exclude"))
 if hs and (strong or name):cl="strong_hs_product"
 elif strong or name:cl="product_identifier"
 elif hs:cl="hs_only"
 else:cl="no_hit"
 return {"file":str(p),"name":p.name,"extension":p.suffix.lower(),"size_bytes":p.stat().st_size,"source_class":source(p),"scanned_members":members,"prefilter_class":cl,"hs_hits":hs,"strong_hits":strong,"name_hits":name,"exclusion_hits":excl,"errors":err}
def main():
 fs=sorted(p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in EXT and OUT not in p.parents and not p.name.startswith("~$")); rows=[]
 for i,p in enumerate(fs,1):
  rows.append(inspect(p))
  if i%25==0 or i==len(fs):
   sm={"updated_at":datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds"),"files_total":len(fs),"files_processed":i,"class_counts":dict(Counter(r["prefilter_class"] for r in rows)),"error_files":sum(bool(r["errors"]) for r in rows),"candidate_files":sum(r["prefilter_class"]!="no_hit" for r in rows),"checkpoint_complete":i==len(fs)}
   fields=list(rows[0]);
   with CSV.open("w",encoding="utf-8-sig",newline="") as f:
    w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
    for r in rows:
     x=dict(r)
     for k in ("hs_hits","strong_hits","name_hits","exclusion_hits","errors"):x[k]=json.dumps(x[k],ensure_ascii=False,separators=(",",":"))
     w.writerow(x)
   JSON.write_text(json.dumps({"summary":sm,"files":rows},ensure_ascii=False,indent=2),encoding="utf-8");print(json.dumps(sm,ensure_ascii=True),flush=True)
 return 0
if __name__=="__main__":sys.exit(main())
