import json
from pathlib import Path
p=Path(r'D:\易迅数据\反倾销税深度分析报告\_分析中间数据')
for f in p.glob('*.json'):
    d=json.loads(f.read_text(encoding='utf-8'))
    print('\n###',f.stem)
    for sec in ['direct_taxed_to_china','third_origin_to_china','taxed_origin_to_third']:
        x=d[sec]; print(sec,'rows',x['rows'],'weight',x['weight_kg'],'qty',x['quantity_raw'])
        for key in ['origins','destinations','suppliers','buyers']:
            if key in x: print(key, json.dumps(x[key][:6],ensure_ascii=False))
    print('DIRECT',json.dumps(d['direct_taxed_to_china']['records'][:6],ensure_ascii=False))
    print('THIRD',json.dumps(d['third_origin_to_china']['records'][:8],ensure_ascii=False))
