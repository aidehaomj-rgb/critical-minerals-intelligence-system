import json, os, re, statistics
from collections import Counter, defaultdict
from datetime import datetime

BASE = r"C:\Users\59809\Documents\关键矿产\outputs\yixun_critical_minerals_20260812"
ORDER = ['镓','锗','石墨','锑','金刚石','钨','碲','铋','钼','铟','钐','钆','铽','镝','镥','钪','钇','钬','铒','铥','铕','镱','锂','镍','钴','锰']
HUBS = {'Vietnam','Indonesia','Singapore','Malaysia','Thailand','United Arab Emirates','Hong Kong','Korea','South Korea','Mexico','Turkey'}
ACTIVE = {'镓','锗','石墨','锑','钨','碲','铋','钼','铟','钐','钆','铽','镝','镥','钪','钇'}
SUSPENDED = set(ORDER) - ACTIVE
KEYWORDS = {
 '镓':['GALLIUM METAL','PURE GALLIUM','GALLIUM OXIDE','GALLIUM NITRIDE','GA2O3','CAS 7440-55-3'],
 '锗':['GERMANIUM','GE OPTICAL','GERMANIUM DIOXIDE','GERMANIUM TETRA'],
 '石墨':['FLAKE GRAPHITE','NATURAL GRAPHITE','HSCD_DESCRIPTION'],
 '锑':['ANTIMONY TRIOXIDE','ANTIMONY OXIDE','TRIOXIDE OF ANTIMONY'],
 '金刚石':['SYNTHETIC INDUSTRIAL DIAMOND','SYNTHETIC DIAMOND POWDER','DIAMOND POWDER'],
 '钨':['TUNGSTEN CARBIDE','WOLFRAM CARBIDE','CARBIDE POWDER','WC POWDER'],
 '碲':['TELLURIUM METAL','TELLURIUM METAL INGOT'],
 '铋':['BISMUTH METAL','BISMUTH OXIDE'],
 '钼':['MOLYBDENUM POWDER'], '铟':['INDIUM PHOSPHIDE'],
 '钐':['SAMARIUM'], '钆':['GADOLINIUM'], '铽':['TERBIUM'], '镝':['DYSPROSIUM'], '镥':['LUTETIUM'],
 '钪':['SCANDIUM'], '钇':['YTTRIUM'], '钬':['HOLMIUM'], '铒':['ERBIUM'], '铥':['THULIUM'],
 '铕':['EUROPIUM'], '镱':['YTTERBIUM'], '锂':['LITHIUM IRON PHOSPHATE'],
 '镍':['NICKEL COBALT MANGANESE HYDROXIDE'], '钴':['NICKEL COBALT ALUMINUM HYDROXIDE'],
 '锰':['LITHIUM RICH MANGANESE']}

def load_files():
    out={}
    for fn in os.listdir(BASE):
        if not fn.endswith('_refined.json'): continue
        p=os.path.join(BASE,fn)
        try:
            with open(p,encoding='utf-8') as f: j=json.load(f)
            out[j['mineral']]=j
        except Exception as e: print('skip',fn,e)
    return out

def nnum(x):
    try: return float(str(x).replace(',','').strip()) if str(x).strip() else None
    except: return None

def analyze_row(mineral,row,i,dup_count=1):
    vals=list(row)+['']*13
    source,direction,date,hs,desc,buyer,supplier,weight,qty,amount,dest,origin,op=vals[:13]
    u=desc.upper(); rel=any(k in u for k in KEYWORDS.get(mineral,[]))
    false_terms=['LAMP','CHAIR','RIVETING HAMMER','VALVE','ADAPTER','CHARGER','CABLE','UV LAMP','PLASTIC CASE']
    false=any(x in u for x in false_terms)
    if false: relevance='明显误命中'
    elif rel: relevance='高度相关'
    else: relevance='需核实参数/形态'
    hub=dest in HUBS
    trader=bool(re.search(r'TRAD|LOGISTIC|TRANSPORT|SPEDITION|INTERNATIONAL|IMPORT|EXPORT|DISTRIBUT|GLOBAL|WORLD|RESOURCES', (buyer+' '+supplier).upper()))
    vague=not hs or len(re.sub(r'\D','',hs))<6 or len(desc)<25
    active=mineral in ACTIVE
    score=0
    reasons=[]
    if relevance=='高度相关': score+=2; reasons.append('品名与代表性管制物项高度相关')
    elif relevance=='需核实参数/形态': score+=1; reasons.append('需核实成分、纯度、粒径或制品形态')
    if hub: score+=1; reasons.append('目的地具有区域加工/转运节点特征')
    if trader: score+=1; reasons.append('交易主体含贸易、物流或分销特征')
    if vague: score+=1; reasons.append('HS或品名信息不足')
    if false: score=-2; reasons=['明显成品或名称误命中']
    if not active: level='监测' if score>=2 else '低'
    elif score>=5: level='高'
    elif score>=4: level='中'
    else: level='低'
    if false: level='排除'
    third='第一程候选—需核验后续去向' if active and hub and relevance!='明显误命中' else ('复杂供应链监测' if hub else '未见明确绕道特征')
    counter=[]
    if re.search(r'LAB|RESEARCH|REAGENT|SIGMA|MERCK',u+' '+buyer.upper()+' '+supplier.upper()): counter.append('可能为科研试剂或经销渠道')
    if not hub: counter.append('当前记录显示直接进入非典型中转目的地')
    if not active: counter.append('当前处于暂停执行窗口')
    if dup_count>1: counter.append(f'相同核心字段出现{dup_count}次，可能为镜像、拆分或重复采集')
    action='核对许可证、合同、最终用户声明、原产地与后续再出口记录' if level in ('高','中') else '保留监测；参数不足时补充材质/纯度/粒径资料'
    return {'序号':i,'矿种':mineral,'数据源':source,'进出口':direction,'日期':date,'HS编码':hs,'商品描述':desc,'采购商':buyer,'供应商':supplier,'重量':weight,'数量':qty,'金额':amount,'目的国/地区':dest,'原产国/地区':origin,'物项相关性':relevance,'政策状态':'现行' if active else '暂停/监测','中转节点': '是' if hub else '否','主体特征':'贸易/物流/分销' if trader else '生产/终端或不明','申报信息完整性':'不足' if vague else '一般','风险等级':level,'第三国绕道判断':third,'主要依据':'；'.join(reasons),'重复/镜像提示':f'同组{dup_count}条' if dup_count>1 else '未见同组重复','反向因素':'；'.join(counter),'建议动作':action}

def main():
    files=load_files(); rows=[]; summaries=[]
    for m in ORDER:
        j=files.get(m,{'term':'','total':0,'reviewedRows':0,'coverage':'未检索','rows':[]})
        raw=j.get('rows',[])
        keys=[]
        for r in raw:
            v=list(r)+['']*13
            keys.append(tuple(v[k] for k in (2,3,4,5,6,8,9,10,11,12)))
        dup=Counter(keys)
        analysed=[analyze_row(m,r,i+1,dup[keys[i]]) for i,r in enumerate(raw)]
        rows.extend(analysed)
        c=Counter(x['风险等级'] for x in analysed); dest=Counter(x['目的国/地区'] for x in analysed if x['目的国/地区'])
        total=j.get('total',0); reviewed=len(analysed)
        coverage=j.get('coverage','')
        if not coverage or '?' in coverage:
            coverage='页面结果全量' if reviewed >= total else f'页面可见前{reviewed}条（总命中{total}条）'
        summaries.append({'矿种':m,'检索词':j.get('term',''),'总命中数':total,'逐条审阅数':reviewed,'覆盖范围':coverage,'政策状态':'现行' if m in ACTIVE else '暂停/监测','高':c['高'],'中':c['中'],'低':c['低'],'监测':c['监测'],'排除':c['排除'],'主要目的地':'、'.join(f'{k}({v})' for k,v in dest.most_common(5)),'初步结论':('存在需优先调证的第一程候选' if c['高'] else ('存在中等核验线索' if c['中'] else ('仅作暂停期供应链监测' if m in SUSPENDED else '当前记录未形成明确绕道指向')))})
    with open(os.path.join(BASE,'analysis_rows.json'),'w',encoding='utf-8') as f: json.dump(rows,f,ensure_ascii=False,indent=2)
    with open(os.path.join(BASE,'analysis_summary.json'),'w',encoding='utf-8') as f: json.dump(summaries,f,ensure_ascii=False,indent=2)
    print(json.dumps({'rows':len(rows),'summaries':len(summaries),'risk':Counter(x['风险等级'] for x in rows)},ensure_ascii=False,default=dict))
if __name__=='__main__': main()
