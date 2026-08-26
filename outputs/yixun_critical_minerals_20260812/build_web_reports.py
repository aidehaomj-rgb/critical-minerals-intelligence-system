import json, html, re
from pathlib import Path
from collections import Counter

BASE=Path(__file__).parent
WEB=Path(r'C:\Users\59809\Documents\关键矿产\mineral-control-atlas\reports\yixun-risk')
WEB.mkdir(parents=True,exist_ok=True)
rows=json.loads((BASE/'analysis_rows.json').read_text(encoding='utf-8'))
sums=json.loads((BASE/'analysis_summary.json').read_text(encoding='utf-8'))

def esc(x): return html.escape(str(x or ''))
def trim(x,n=110):
    x=re.sub(r'\s+',' ',str(x or '')).strip()
    return x if len(x)<=n else x[:n-1]+'…'

CSS='''
:root{color-scheme:dark;--bg:#061322;--panel:#0d2036;--line:#24425f;--text:#e6f1fa;--muted:#90a7ba;--blue:#4fb8d6;--green:#50d18d;--amber:#f4b95f;--red:#f46f62}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 85% 0,rgba(79,184,214,.14),transparent 32%),var(--bg);color:var(--text);font-family:"Microsoft YaHei",sans-serif}main{width:min(1160px,calc(100% - 36px));margin:auto;padding:44px 0 70px}.hero{padding:30px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,rgba(18,43,73,.94),rgba(8,25,45,.96));box-shadow:0 20px 46px rgba(0,0,0,.24)}.k{color:var(--blue);font-size:11px;letter-spacing:.14em}.hero h1{margin:8px 0 10px;font-size:32px}.hero p{margin:0;color:var(--muted);line-height:1.8}.metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:18px 0}.metrics article{padding:17px;border:1px solid var(--line);border-radius:14px;background:var(--panel)}.metrics b{display:block;font:28px Georgia;color:var(--blue)}.metrics span{color:var(--muted);font-size:12px}.section{margin-top:18px;padding:22px;border:1px solid var(--line);border-radius:16px;background:rgba(13,32,54,.86)}h2{margin:0 0 14px;font-size:20px}ul{color:var(--muted);line-height:1.8}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:11px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{color:#cce4f3;background:rgba(4,18,32,.55);position:sticky;top:0}.table-wrap{overflow:auto;max-height:680px}.tag{display:inline-block;padding:3px 7px;border-radius:12px;background:rgba(79,184,214,.1);color:var(--blue)}.high{color:var(--red)}.medium{color:var(--amber)}.low{color:var(--green)}.actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.btn{padding:9px 14px;border:1px solid var(--line);border-radius:8px;color:var(--text);text-decoration:none;background:rgba(255,255,255,.03)}.btn.primary{background:#2d6fe5;border-color:#2d6fe5}.note{padding:14px;border-left:3px solid var(--amber);background:rgba(244,185,95,.07);color:var(--muted);line-height:1.7}@media(max-width:800px){.metrics{grid-template-columns:1fr 1fr}.hero h1{font-size:24px}main{width:min(100% - 20px,1160px);padding-top:18px}}
'''

def shell(title,body):
    return f'<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title><style>{CSS}</style></head><body><main>{body}</main></body></html>'

def mineral_page(s):
    mine=s['矿种']; rs=[r for r in rows if r['矿种']==mine]
    candidates=[r for r in rs if r['风险等级'] in ('高','中','监测')]
    candidates=sorted(candidates,key=lambda r:({'高':0,'中':1,'监测':2}.get(r['风险等级'],3),r['日期']))[:200]
    dest=Counter(r['目的国/地区'] for r in rs if r['目的国/地区']).most_common(10)
    trs=''.join('<tr><td class="%s">%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'%(('high' if r['风险等级']=='高' else 'medium'),esc(r['风险等级']),esc(r['日期']),esc(trim(r['商品描述'],95)),esc(trim(r['采购商'],45)),esc(r['目的国/地区']),esc(trim(r['主要依据'],70))) for r in candidates)
    if not trs: trs='<tr><td colspan="6">本轮无高、中优先或暂停期监测记录。</td></tr>'
    dest_rows=''.join(f'<tr><td>{esc(k)}</td><td>{v}</td></tr>' for k,v in dest) or '<tr><td colspan="2">无记录</td></tr>'
    judgment='发现需要优先调证的第一程候选，但尚未形成第三国再出口闭环。' if s['高'] else ('存在中等核验线索，应进一步核对许可证、最终用户和后续流向。' if s['中'] else ('当前为暂停期供应链监测样本，不按现行未许可违规判断。' if s['监测'] else '当前记录未形成明确绕道指向。'))
    body=f'''<section class="hero"><div class="k">YIXUN TRADE RISK RESEARCH · {esc(s['检索词'])}</div><h1>{esc(mine)}贸易数据第三国绕道风险专项分析</h1><p>基于易迅数据页面逐条查看结果。页面报告用于线索排序，不替代原始单证、许可证系统、执法调查和法律定性。</p><div class="actions"><a class="btn" href="./documents/{esc(mine)}_易迅数据第三国绕道风险专项分析.docx">打开Word报告</a><a class="btn" href="./index.html">返回综合报告</a></div></section>
    <section class="metrics"><article><b>{s['总命中数']}</b><span>页面命中</span></article><article><b>{s['逐条审阅数']}</b><span>逐条审阅</span></article><article><b class="high">{s['高']}</b><span>高优先</span></article><article><b class="medium">{s['中']}</b><span>中优先</span></article><article><b>{s['监测']}</b><span>暂停期监测</span></article></section>
    <section class="section"><h2>核心判断</h2><div class="note">{esc(judgment)} 覆盖范围：{esc(s['覆盖范围'])}；政策状态：{esc(s['政策状态'])}。</div></section>
    <section class="section"><h2>主要目的地</h2><table><thead><tr><th>国家或地区</th><th>记录数</th></tr></thead><tbody>{dest_rows}</tbody></table></section>
    <section class="section"><h2>优先核查记录</h2><div class="table-wrap"><table><thead><tr><th>等级</th><th>日期</th><th>商品描述</th><th>采购商</th><th>目的地</th><th>核查依据</th></tr></thead><tbody>{trs}</tbody></table></div></section>
    <section class="section"><h2>建议动作</h2><ul><li>核对许可证、报关单、合同、发票、装箱单、技术参数及最终用户声明。</li><li>核验第三国进口商的真实产能、经营范围、仓储条件与关联关系。</li><li>匹配第三国再出口日期、数量、价格、港口、提运单和集装箱号。</li><li>对重复或镜像记录先去重，再计算独立票数和风险规模。</li></ul></section>'''
    (WEB/f'{mine}.html').write_text(shell(f'{mine}专项分析',body),encoding='utf-8')

for s in sums: mineral_page(s)
high=sum(s['高'] for s in sums); med=sum(s['中'] for s in sums); mon=sum(s['监测'] for s in sums); reviewed=sum(s['逐条审阅数'] for s in sums)
cards=''.join(f'''<article class="section"><div class="k">{esc(s['检索词'])}</div><h2>{esc(s['矿种'])}专项分析</h2><p style="color:var(--muted)">{esc(s['初步结论'])} · 审阅 {s['逐条审阅数']} 条 · 高 {s['高']} · 中 {s['中']} · 监测 {s['监测']}</p><div class="actions"><a class="btn primary" href="./{esc(s['矿种'])}.html">在线阅读全文</a><a class="btn" href="./documents/{esc(s['矿种'])}_易迅数据第三国绕道风险专项分析.docx">打开Word</a></div></article>''' for s in sums)
body=f'''<section class="hero"><div class="k">AI STRATEGIC REPORT · YIXUN TRADE DATA</div><h1>关键矿产贸易数据第三国绕道风险综合分析</h1><p>覆盖26类关键矿产及相关物项。基于Chrome页面逐页查看，不使用站点下载功能。高、中优先级仅表示核查顺序，不代表已经构成违法或已证实绕道。</p><div class="actions"><a class="btn primary" href="./documents/关键矿产易迅数据第三国绕道风险综合分析报告.docx">打开综合Word报告</a><a class="btn" href="./documents/关键矿产易迅数据第三国绕道风险逐条分析.xlsx">查看逐条分析Excel</a></div></section>
<section class="metrics"><article><b>26</b><span>矿种/物项</span></article><article><b>{reviewed}</b><span>逐条审阅</span></article><article><b class="high">{high}</b><span>高优先</span></article><article><b class="medium">{med}</b><span>中优先</span></article><article><b>{mon}</b><span>暂停期监测</span></article></section>
<section class="section"><h2>总体研判</h2><ul><li>钨类记录量最大，重点从牌号、HS、主体与第三国节点叠加特征中筛选许可核验链。</li><li>石墨、锑出现少量高优先第一程候选；镓、锗及部分稀土形成中等核验线索。</li><li>只有中国至第三国的进口记录时，不能认定为绕道；仍需第三国再出口和物流、主体或原产地证据闭环。</li><li>暂停期物项作为政策恢复后的历史供应链基线，不按现行未许可违规判断。</li></ul></section><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:0 16px">{cards}</div>'''
(WEB/'index.html').write_text(shell('关键矿产贸易数据第三国绕道风险综合分析',body),encoding='utf-8')
print(json.dumps({'pages':len(sums)+1,'output':str(WEB)},ensure_ascii=False))
