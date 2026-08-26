#!/usr/bin/env python3
from __future__ import annotations
import csv,json,re,zipfile,sys
from pathlib import Path
from collections import Counter
from datetime import datetime,timezone,timedelta
ROOT=Path(r'D:\易迅数据');OUT=ROOT/'反倾销税深度分析报告'/'19_丁腈橡胶';OUT.mkdir(parents=True,exist_ok=True)
CSV=OUT/'丁腈橡胶_本地预筛文件台账.csv';JSON=OUT/'丁腈橡胶_本地预筛文件台账.json';EXT={'.xlsx','.xls','.csv','.json'}
HS=re.compile(r'(?<!\d)400259(?:10|90|00)?(?:\.0)?(?!\d)',re.I)
NAME=re.compile(r'ACRYLONITRILE[\s-]*(?:BUTADIENE|BUTADIEN)[\s-]*RUBBER|NITRILE[\s-]*BUTADIENE[\s-]*RUBBER|\bNBR[\s-]*(?:RUBBER|BALE|POWDER|LATEX|COMPOUND|RESIN|\d)|丁腈橡胶|丁腈膠',re.I)
BRANDS=re.compile(r'KUMHO|KNB\s*\d|LG\s*CHEM|ZEON|NIPOL|ENEOS\s*MATERIALS|JSR\s*(?:NBR|RUBBER)|NANTEX',re.I)
EXCL=re.compile(r'HNBR|HYDROGENATED|CARBOXYLATED|XNBR|NBR[\s-]*LATEX|NITRILE[\s-]*(?:GLOVE|FOAM|SEAL|O[\s-]*RING|HOSE)|丁腈胶乳|氢化丁腈|羧基丁腈|丁腈手套|密封件|胶管|橡胶制品',re.I)
def dec(b):
 for e in ('utf-8','utf-8-sig','utf-16','gb18030','latin-1'):
  try:return b.decode(e)
  except UnicodeDecodeError:pass
 return b.decode('utf-8',errors='replace')
def scan(s):return {'hs':sorted(set(m.group(0) for m in HS.finditer(s)))[:30],'name':sorted(set(m.group(0) for m in NAME.finditer(s)))[:50],'brand':sorted(set(m.group(0) for m in BRANDS.finditer(s)))[:50],'exclude':sorted(set(m.group(0) for m in EXCL.finditer(s)))[:50]}
def merge(a,b):
 for k in a:a[k].update(b[k])
def src(p):return 'project_output_or_qa' if '反倾销税深度分析报告' in str(p) else ('easyxun_page_capture' if '_易迅页面采集' in str(p) else 'root_download_or_user_file')
def inspect(p):
 a={k:set() for k in ('hs','name','brand','exclude')};err=[];members=0
 try:
  if p.suffix.lower()=='.xlsx':
   with zipfile.ZipFile(p) as z:
    ns=[n for n in z.namelist() if n=='xl/sharedStrings.xml' or (n.startswith('xl/worksheets/') and n.endswith('.xml'))]
    for n in ns:members+=1;merge(a,scan(dec(z.read(n))))
  else:members=1;merge(a,scan(dec(p.read_bytes())))
 except Exception as e:err=[f'{type(e).__name__}: {e}']
 hs,name,brand,excl=map(lambda k:sorted(a[k]),('hs','name','brand','exclude'))
 cl='strong_hs_product' if hs and (name or brand) else ('product_identifier' if name or brand else ('hs_only' if hs else 'no_hit'))
 return {'file':str(p),'name':p.name,'extension':p.suffix.lower(),'size_bytes':p.stat().st_size,'source_class':src(p),'scanned_members':members,'prefilter_class':cl,'hs_hits':hs,'name_hits':name,'brand_hits':brand,'exclusion_hits':excl,'errors':err}
def main():
 fs=sorted(p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in EXT and OUT not in p.parents and not p.name.startswith('~$'));rows=[]
 for i,p in enumerate(fs,1):
  rows.append(inspect(p))
  if i%25==0 or i==len(fs):
   sm={'updated_at':datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds'),'files_total':len(fs),'files_processed':i,'class_counts':dict(Counter(r['prefilter_class'] for r in rows)),'error_files':sum(bool(r['errors']) for r in rows),'candidate_files':sum(r['prefilter_class']!='no_hit' for r in rows),'checkpoint_complete':i==len(fs)}
   with CSV.open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader()
    for r in rows:
     x=dict(r)
     for k in ('hs_hits','name_hits','brand_hits','exclusion_hits','errors'):x[k]=json.dumps(x[k],ensure_ascii=False,separators=(',',':'))
     w.writerow(x)
   JSON.write_text(json.dumps({'summary':sm,'files':rows},ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(sm,ensure_ascii=True),flush=True)
if __name__=='__main__':sys.exit(main() or 0)
