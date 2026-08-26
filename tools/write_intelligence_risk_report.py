"""Write the intelligence-only risk report from verified analysis outputs."""
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(r"D:\codex\XG执法\2026_案例库")
analysis = json.loads((ROOT / "情报案件风险分析.json").read_text(encoding="utf-8"))
vehicles = json.loads((ROOT / "情报车辆核查对象.json").read_text(encoding="utf-8"))


def table(rows, first_label, second_label):
    return (
        f"| {first_label} | 情报包数 | 标题披露案件数 |\n"
        "| --- | ---: | ---: |\n"
        + "\n".join(
            f"| {name} | {count} | {dict(rows[1]).get(name, 0)} |"
            for name, count in rows[0]
        )
    )


def short_title(title):
    name = title.rsplit("/", 1)[-1].removesuffix(".zip")
    name = re.sub(r"^GDRM26-\d+\s*", "", name)
    return name


commodity_table = table(
    (analysis["commodity_packages"], analysis["commodity_disclosed_incidents"]),
    "货物/风险类型",
    "标题披露案件数",
)
channel_table = table(
    (analysis["channel_packages"], analysis["channel_disclosed_incidents"]),
    "渠道",
    "标题披露案件数",
)

vehicle_rows = []
for item in vehicles:
    linked = "; ".join(
        f"{case_id}（{short_title(title)}）"
        for case_id, title in zip(item["linked_intelligence_cases"], item["linked_case_titles"])
    )
    goods = "；".join(entry["value"] for entry in item["goods_top"][:2])
    destinations = "、".join(entry["value"] for entry in item["destination_countries_top"][:3])
    vehicle_rows.append(
        f"| {item['priority']} | {item['vehicle']} | {linked} | "
        f"{item['silver_trade_record_count']} | {goods} | {destinations} |"
    )

report = f"""# 情报案件全量风险分析及海关数据核查对象

## 一、范围与结论边界

- 纳入 134 个含“情报/情報”标识且不含查询、协查回复的案件包，其中包括 131 期编号情报及 3 份风险情报成效/专题材料。
- 标题明确披露的案件合计至少 456 宗；未写明案件数量的综合情报不计入该数。
- 本报告用于风险筛查和布控验证线索设计，不把情报对象、承运人、申报人或历史贸易记录直接认定为违法主体。

## 二、总体风险结构

{commodity_table}

烟草制品和毒品/受管制药物合计占标题披露案件数的绝大多数。未列舱单货物虽只有 18 个情报包，但对应 40 宗案件，且高度集中在陆路货车、小车及河路货运，是最适合建立单证一致性模型的风险类型。

{channel_table}

空路客运、空运货物/邮包和陆路客运贡献的案件数量最高；陆路货车的案件包数较高，但单包往往包含较少案件，呈现“车辆、货主、申报单证可持续追踪”的特点。

## 三、主要风险规律

1. **烟草风险呈多渠道迁移。** 旅客携带、陆路客车/小车、陆路货车、海河运、邮包和仓储均有分布。只按单一口岸或运输方式布控容易漏检，应围绕人员、车辆、仓库、收发货主体和商品描述联动。
2. **毒品/药物形成“空运邮包 + 空路旅客 + 陆路货车”三条并行链。** 空运邮包适合用来源国、件重、申报品名和收件地址聚类；旅客渠道适合做同行人、行程频次和行李特征关联；陆路货车则适合做车牌、司机、发收货人和历史申报画像。
3. **未列舱单货物是最稳定的单证型风险。** 应重点比对进出境记录、舱单、报关单、车辆/集装箱、件数重量和实际查验结果；同车多票、同日多主体、重量突变和空车/低值申报值得单独建模。
4. **交通工具比企业名称更稳定。** 多辆车既出现在查获案件附件，又在 GDRM26-269 的历史贸易记录中高频出现；这类“查获记录 + 持续正常贸易”交叉对象适合做验证性布控，但不能据此推定其每次运输均异常。
5. **服务商误伤风险高。** 快递、航空、船公司、货代和报关代理天然跨案高频，必须与实际货主、发货人、收货人、司机和车辆分层。
6. **情报时效分两类。** 具体箱号、航次、预计抵达时间属于短周期情报；企业、车辆、地址和交易网络属于中长期情报。前者过期后应转为历史核销，后者经当前数据验证后才适合持续布控。

## 四、可优先进行布控验证的车辆

| 级别 | 车辆 | 关联情报案件 | GDRM26-269历史贸易记录数 | 历史主要货物 | 主要目的地 |
| --- | --- | --- | ---: | --- | --- |
{chr(10).join(vehicle_rows)}

### 分级解释

- **A级：XR4740。** 同一车辆分别出现在 GDRM26-047 陆路货车走私濒危物种案、GDRM26-113 陆路货车走私毒品及药物案，并在银贸易历史表中出现 9 笔。这是当前最强的跨不同查获类型车辆线索，应优先核对司机、车主/运营人、发收货人、报关单和近期通关状态。
- **B级：其余车辆。** 均至少出现在一份查获情报和 GDRM26-269 历史贸易记录中。其中 XK7817、XR5518、WM8507、WV6195、SM8681 的历史交易频次较高，可优先于低频车辆进行验证。

## 五、企业和交易网络线索

### 1. 润丰成/潤豐链路

- 深圳润丰成贸易发展有限公司：出现在 GDRM26-049（陆路货车走私香烟及汽油）、GDRM26-253（陆路货车走私未列舱单货物）、GDRM26-269（香港进出口银贸易记录）。
- 香港潤豐貿易發展有限公司：出现在 GDRM26-049、GDRM26-253，且与深圳公司在案件集合中重叠。
- 建议核验：两地注册编号、地址、电话、董事/股东、申报代理、车辆、报关单号以及是否在同票中互为发收货方。名称和案件重叠不能代替关联关系证明。

### 2. GDRM26-158 高风险企业名单

- 发货人：联宏塑胶工业（深圳）有限公司，地址为深圳市宝安区新桥街道上寮南浦路 136 号第 1-3 栋。
- 收货人：精密实业有限公司，地址为柴湾利众街 44 号四兴隆工业大厦 12 楼 B 室。
- 运输公司：FINEST INDUSTRIAL CO. LTD. / 精密实业有限公司。
- 该材料自身明确注明仅供风险管理分析参考，不能作为违法认定或法庭证供。适合先调取实际贸易、商品及申报记录验证，不宜仅凭名单实施不利认定。

### 3. 物流/申报关联线索

- CYTS-SPIRIT LOGISTICS LIMITED 同时出现在 GDRM26-210 雪茄案件附件和 GDRM26-269 银贸易记录中，分别作为收货/进口方或申报方。其名称显示物流属性，建议核验实际委托人和货主，不宜单独作为违法主体。
- FedEx 等承运平台虽然跨案出现，但更可能反映渠道覆盖，应作为关系查询节点而非直接布控对象。

## 六、可直接核销的集装箱情报

### GDRM26-182

- 路线：韩国至大连；预计抵达 2026-03-10 22:00。
- 船舶/航次：SKY FLOWER / 2603W。
- 提单：KMTCINC5280977 或 INC5280977。
- 集装箱：SNBU8142973、SEGU4789133。
- 发货人：ANE LOGISTICS KOREA CO LTD。
- 收货人：DALIAN HONGYUHE INTERNATIONAL TRADKING CO LTD。
- 申报货物：Cigarettes。

### GDRM26-305

- 路线：新加坡至宁波；预计抵达 2026-06-23 16:00。
- 船舶/航次：HMM ALGECIRAS / 019E。
- 集装箱：KKFU8049263、ONEU1742187。

上述预计抵达时间均已过去，应先做历史核销：确认是否到港、是否换箱/拆箱、实际申报、查验结果、后续转关和最终收货人；若链条主体或箱号关联仍活跃，再转为当前布控规则。

## 七、建议的海关数据库核查顺序

1. **先查车辆。** 对 18 辆车拉取近 12-24 个月进出境、司机、车主/运营人、口岸、发收货人、申报人、商品、HS、重量和查验记录；按报关单去重。
2. **再查主体网络。** 以深圳润丰成、香港潤豐、联宏塑胶、精密实业及 CYTS-SPIRIT 为种子，扩展同地址、同电话、同司机、同车辆、同报关代理和同收发货对手。
3. **核销具体箱单。** 对 GDRM26-182、305 的箱号、提单和航次查舱单及查验结果，确认情报是否命中。
4. **建立组合规则。** 车辆/主体命中不能单独触发高等级处置；与商品描述异常、重量突变、未列舱单、同日多主体、频繁变更申报人等条件组合后再升级。
5. **保留白名单和服务商标签。** 承运人、货代和报关代理经验证为正常服务后应降低权重，避免高频业务造成误报。

## 八、证据文件

- 全量统计、案件标签、主体和重复标识：`情报案件风险分析.json`
- 车辆历史贸易画像：`情报车辆核查对象.json`
- 原始附件：`raw_cases/<案件编号>/`
"""

(ROOT / "情报案件全量风险分析与布控验证清单.md").write_text(report, encoding="utf-8")
print(ROOT / "情报案件全量风险分析与布控验证清单.md")
