import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const collected = "2026-07-31";
const rows = [
  {
    industry:"保健品", cn:"优思益", en:"Youthit", country:"澳大利亚",
    foreign:"YARRA VIBE PTY LTD；ACN 147 726 887 / ABN 98 147 726 887",
    address:"VIC 3149, Australia；媒体调查称品牌所示墨尔本地址对应汽车维修场所（是否为虚拟地址：高度疑似）",
    reg:"2010-12", domestic:"广州雅拉源健康产业有限公司（USCC：待官方公示系统复核）",
    relation:"品牌称Youthit为Yarra Vibe旗下品牌；国内由广州雅拉源运营；营销服务涉及杭州索象",
    factory:"媒体调查指向仙乐健康科技（安徽）有限公司等国内生产环节；品牌方对具体生产、包装责任提出异议",
    category:"叶黄素、营养补充食品", channels:"天猫、抖音等（曝光后多平台下架）", price:"约200–500元/瓶",
    claim:"“澳洲原装进口”“澳洲品牌”“国际大奖/海外专家背书”",
    risks:"R3境外声量与国内销量失衡；R4来源国主流渠道存在感弱；R5注册地址异常；R8国内生产/包装链；R10消费者及媒体集中质疑",
    count:5, rating:"高", status:"已由央视系报道、境外登记库及独立媒体交叉核验；责任归属仍以监管最终结论为准",
    response:"品牌称产品并非在广州生产，并将部分不实包装宣传归因于营销服务方；调查尚未完全终结",
    sources:[
      "https://www.jiemian.com/article/14209350.html",
      "https://abr.business.gov.au/ABN/View?abn=98147726887",
      "https://njqx.jsjc.gov.cn/zt/tszs/202604/t20260409_1321143.shtml",
      "https://australianmade.com.au/assets/c7d82a88-f5db-4c6e-87ff-2e22a34082b9.pdf"
    ]
  },
  {
    industry:"保健品", cn:"挪帝克/NYO-3", en:"NYO3", country:"挪威",
    foreign:"NYO3 INTERNATIONAL AS；Org.nr 931 335 618",
    address:"Dronning Eufemias gate 16, 0191 Oslo；同址登记主体数量很多，具有共享办公/集中注册地址特征",
    reg:"2023-05", domestic:"逢时（青岛）海洋科技股份有限公司（USCC：待官方公示系统复核）",
    relation:"NYO3 INTERNATIONAL AS由Function Hong Kong Biological Tech 100%持有，后者与逢时（青岛）海洋科技股份有限公司关联",
    factory:"青岛生产体系；具体SKU工厂待逐批标签核验",
    category:"南极磷虾油、Omega-3", channels:"天猫、京东、抖音跨境店", price:"约200–1000元",
    claim:"“源自挪威的高端营养膳食品牌”“挪威线下销售”“全球磷虾油领先”",
    risks:"R1挪威主体成立后短期进入大规模营销；R3海外社媒/官网痕迹弱；R4挪威零售规模与国内声量不匹配；R6董事长为华人且股东链指向香港/中国；R8国内工厂链",
    count:5, rating:"高", status:"挪威官方登记、财务数据、股东资料与媒体调查交叉核验",
    response:"未检索到针对“假洋牌”质疑的完整公开回应；品牌具备真实挪威法人及少量当地雇员，不等同于无境外经营",
    sources:[
      "https://www.jiemian.com/article/14209350.html",
      "https://virksomhet.brreg.no/en/oppslag/underenheter/931364618",
      "https://offentligdata.no/explorer/org/931335618",
      "https://sokfirma.no/selskap/931335618/nyo3-international-as"
    ]
  },
  {
    industry:"保健品", cn:"纽优意", en:"NIUAE", country:"美国（商家宣称）",
    foreign:"未检索到可稳定对应的美国生产经营主体；注册号待核实",
    address:"境外地址待核实；现有公开调查主要指向中国惠州生产与香港包装链",
    reg:"待核实", domestic:"惠州市鑫福来实业发展有限公司（USCC：待官方公示系统复核）",
    relation:"生产企业负责人在媒体暗访中称NIUAE为其自营品牌",
    factory:"广东省惠州市鑫福来实业发展有限公司",
    category:"辅酶Q10、护肝片、麦角硫因等普通食品/营养补充品", channels:"短视频平台“海外旗舰店”等", price:"多数200元以下，最高约899元",
    claim:"美国/海外品牌、保税仓发货、进口营养补充品",
    risks:"R3海外官方账号/市场痕迹难核；R4来源国主流渠道难核；R5境外主体不透明；R8国内工厂生产并经香港包装返销；R10媒体与消费者集中质疑",
    count:5, rating:"高", status:"生产链和营销模式已有两家媒体交叉报道；境外主体登记号未取得，列为重点补证项",
    response:"未检索到品牌完整公开回应",
    sources:[
      "https://www.eeo.com.cn/2026/0315/811235.shtml",
      "https://news.bjd.com.cn/2026/04/10/11680813.shtml",
      "https://finance.sina.com.cn/consume/xiaofei/2026-04-09/doc-inhtwhra2202164.shtml"
    ]
  },
  {
    industry:"保健品", cn:"维优斯/维优思（拼写待核）", en:"Viyuoth", country:"英国",
    foreign:"VIYOUTH LIMITED；Company No. 15333905",
    address:"Companies House default address: PO Box 4385, Cardiff CF14 8LH（默认/代收地址）",
    reg:"2023-12", domestic:"国内运营主体未稳定披露；商标代理为深圳知识产权机构（主体及USCC待核）",
    relation:"英国公司实控人Si Li，国籍中国、居住中国，持股及表决权75%以上",
    factory:"待核实；公开调查认为研发、生产及运营主要集中于国内",
    category:"营养补充剂、口服抗衰产品", channels:"独立站及国内社交电商", price:"待核实",
    claim:"“国际品牌”“英国/欧洲科研背景”“原装进口”",
    risks:"R1英国主体成立后很快注册商标并营销；R2域名注册晚且网站基础薄弱；R3境外社媒声量弱；R5使用Companies House默认地址；R6实控人为居住中国的中国籍人士",
    count:5, rating:"高", status:"英国官方公司登记与媒体WHOIS/商标调查交叉核验；产品生产地仍待实物标签补证",
    response:"未检索到完整公开回应",
    sources:[
      "https://find-and-update.company-information.service.gov.uk/company/15333905/persons-with-significant-control",
      "https://www.wwo.com.cn/shangye/202603/276915.html",
      "https://www.dtm.com.cn/news/202603/276915.html"
    ]
  },
  {
    industry:"保健品", cn:"诺斐丽", en:"NutriFavor", country:"澳大利亚（涉案宣传）",
    foreign:"涉案品牌所用澳洲主体及注册号尚待警方完整案卷披露",
    address:"涉案境外地址待核；警方披露为国内生产后经香港中转形成进口手续",
    reg:"待核实", domestic:"涉案李某、王某经营主体（公司全称及USCC待判决/警方进一步披露）",
    relation:"警方称由境内人员合伙运营多个“海外店铺”",
    factory:"中国境内生产，后运香港中转再返销",
    category:"营养补充食品", channels:"多个电商平台“海外店铺”", price:"待核实",
    claim:"“澳洲原装进口”“海外店铺”“进口保健品”",
    risks:"R4澳洲主流销售痕迹不足；R5境外主体不透明；R8国内生产并出口转内销；R9进口标签/手续与真实生产链存在误导风险；R10已被警方以假进口模式曝光",
    count:5, rating:"高", status:"警方报道与多家转载媒体交叉核验；主体字段等待刑事裁判文书补全",
    response:"涉案人员回应以警方/法院材料为准",
    sources:[
      "https://news.china.com/socialgd/10000169/20260708/49597303.html",
      "https://finance.sina.com.cn/wm/2026-06-04/doc-iniafrtq3684218.shtml",
      "https://news.bjd.com.cn/2026/04/10/11680813.shtml"
    ]
  },
  {
    industry:"美妆个护", cn:"银座提拉饮", en:"ALL PAIR", country:"日本",
    foreign:"ALLPAIR CO., LTD.（日本法人编号：待日本法人番号系统复核）",
    address:"日本官网披露地址；是否共享地址待核",
    reg:"待核实", domestic:"国内经销/运营主体及USCC待逐店资质页复核",
    relation:"日本主体与国内销售店铺授权链待补证",
    factory:"产品生产地待逐批标签核验",
    category:"口服美容饮品", channels:"天猫、抖音、小红书等", price:"约300–1000元/疗程",
    claim:"“源自日本东京”“风靡贵妇圈”“日本红人博主自用推荐”“国际蒙特奖”",
    risks:"R3海外账号关注人数约20，与国内声量失衡；R4日本市场销售存在感有限；R10被媒体与消费者质疑；R9检测争议指向标签未充分披露左旋肉碱；R11短期依靠达人渠道快速放量",
    count:5, rating:"高", status:"品牌日本官网可访问，但海外市场影响力与宣传显著不匹配；媒体调查和官网相互核验",
    response:"未检索到针对全部争议的完整公开回应；存在日本法人及日本官网，不能表述为“无日本主体”",
    sources:[
      "https://www.wwo.com.cn/shangye/202603/276915.html",
      "https://www.allpair-jp.com/en/company",
      "https://shop.allpair-jp.com/shop/base_info"
    ]
  },
  {
    industry:"美妆个护", cn:"美丽冲刺", en:"BEAUTY RUSH", country:"新西兰",
    foreign:"新西兰关联主体名称/公司号待新西兰Companies Register复核",
    address:"境外地址待核；国内关联公司曾因登记住所无法联系列入经营异常，后移出",
    reg:"待核实", domestic:"国内关联运营公司（名称及USCC需以店铺资质页/国家公示系统复核）",
    relation:"品牌营销、国内店铺和关联公司之间授权链未完整公开",
    factory:"宣称国际认证生产基地；实际SKU生产地待实物标签核验",
    category:"口服美容、抗衰营养品", channels:"天猫、抖音等", price:"待核实",
    claim:"“传承百年企业底蕴”“背靠新西兰国家药品集团”“诺奖得主首席科学家”“新西兰科研合作”",
    risks:"R1境外身份与国内营销时间线不透明；R3境外社媒声量弱；R4新西兰主流渠道存在感不足；R5国内关联主体曾地址异常；R10被媒体质疑国际背景真实性",
    count:5, rating:"高", status:"媒体调查与企业后续澄清交叉记录；境外登记号仍需官方库补证",
    response:"品牌方称中国商标主体已于2025-11完成地址变更，第三方平台同步有时差，并对部分争议作澄清",
    sources:[
      "https://www.wwo.com.cn/shangye/202603/276915.html",
      "https://cj.sina.com.cn/articles/view/2712786693/a1b1d70500101acvs",
      "https://www.dtm.com.cn/news/202603/276915.html"
    ]
  },
  {
    industry:"美妆个护", cn:"珂莱诗", en:"CLINSIS", country:"法国",
    foreign:"CLINSIS SALON SARL（原公司，法国注册号待Infogreffe复核；2023-10设立后注销）；后设同名主体待核",
    address:"法国登记地址为小型/代收性质地址（是否虚拟地址：疑似，待官方底档）",
    reg:"2023-10", domestic:"上海珂莱诗品牌管理有限公司（USCC：待国家公示系统复核）",
    relation:"国内主体早于法国主体成立；报道指实控人为华人，法国主体承担自媒体/外贸职能",
    factory:"爆款沐浴露、身体乳由惠州工厂代工",
    category:"香氛洗护、身体护理", channels:"抖音、天猫、国内美妆集合店", price:"约50–300元",
    claim:"报道所见宣传含“1989年创立于法国巴黎”“全球万家门店”；品牌称统一定位仅为“法式香氛生活美学品牌”",
    risks:"R1法国主体晚于国内运营；R3海外社媒与国内销量不匹配；R4海外电商几乎无售；R5法国小资本、无员工主体短期注销；R8惠州代工",
    count:5, rating:"高", status:"媒体调查、国内处罚信息及品牌方回应已并列；“1989创立”是否为官方渠道发布存在争议",
    response:"品牌否认官网/官方渠道宣称1989年创立，称“法式”指法国调香研发来源，不代表法国原装进口",
    sources:[
      "https://finance.eastmoney.com/a/202607133803679244.html",
      "https://www.dtm.com.cn/",
      "https://www.wwo.com.cn/"
    ]
  },
  {
    industry:"美妆个护", cn:"艾吉亚", en:"AGEYA", country:"英国（宣传）",
    foreign:"公开报道指实际注册于香港；香港公司全称/CR No.待公司注册处复核",
    address:"香港注册地址待核；未核得与“英国百年品牌”相符的英国总部",
    reg:"2020年首次申请相关商标（报道口径）", domestic:"境内运营主体及USCC待店铺资质复核",
    relation:"境内营销链与香港商标/主体关系待核",
    factory:"产品生产运营环节待逐批标签核验",
    category:"营养补充、口服美容", channels:"国内电商及社交渠道", price:"待核实",
    claim:"“英国百年品牌”“畅销30多个国家和地区”",
    risks:"R1商标申请时间与“百年”叙事冲突；R3海外社媒声量弱；R4英国主流渠道存在感不足；R5实际注册地与宣称来源国不一致；R10被多家消费媒体质疑",
    count:5, rating:"高", status:"媒体结论已交叉检索；公司号与生产地尚需官方/实物补证，结论限于“高风险线索”",
    response:"未检索到完整公开回应",
    sources:[
      "https://www.donews.com/news/detail/1/6524397.html",
      "https://www.jiemian.com/article/14209350.html",
      "https://finance.sina.com.cn/consume/xiaofei/2026-04-09/doc-inhtwhra2202164.shtml"
    ]
  },
  {
    industry:"美妆个护", cn:"情绪智慧", en:"MoodWise", country:"海外研发/生产（宣传，具体国家表述不一）",
    foreign:"未检索到与宣传规模匹配的稳定境外经营主体；注册号待核",
    address:"境外注册地址待核",
    reg:"待核实", domestic:"境内运营及生产主体待店铺资质、标签页复核",
    relation:"公开报道指生产和运营环节均在国内",
    factory:"中国境内（具体工厂待实物标签）",
    category:"女性经期营养、口服美容", channels:"国内内容电商、社交平台", price:"待核实",
    claim:"“海外研发和生产”“缓解女性经前期综合征”等",
    risks:"R2外文官网/境外信息薄弱；R3海外社媒声量弱；R4来源国主流渠道难检；R8媒体指生产运营均在国内；R10被消费媒体列为假洋牌争议案例",
    count:5, rating:"高", status:"现阶段属于高风险线索，媒体来源交叉但工商底档不足；不得对外表述为已认定造假",
    response:"未检索到完整公开回应",
    sources:[
      "https://www.donews.com/news/detail/1/6524397.html",
      "https://finance.sina.com.cn/consume/xiaofei/2026-04-09/doc-inhtwhra2202164.shtml",
      "https://news.bjd.com.cn/2026/04/10/11680813.shtml"
    ]
  },
  {
    industry:"母婴产品", cn:"Babycare", en:"Babycare", country:"美国（早期宣传）",
    foreign:"US BABYCARE INC（美国犹他州；Entity No.待州务卿数据库复核）",
    address:"美国犹他州登记地址待核；报道指2015年才成立",
    reg:"2015（报道口径）", domestic:"杭州白贝壳实业股份有限公司（USCC：待国家公示系统复核）",
    relation:"2019年品牌运营主体变更为杭州白贝壳；创始人李阔及配偶通过直接、间接路径高比例持股",
    factory:"纸尿裤等由杭州豪悦护理用品股份有限公司等国内企业代工",
    category:"母婴全品类、纸尿裤、喂养用品", channels:"天猫、京东、抖音及线下直营/零售终端", price:"中高端全价格带",
    claim:"早期“Philemon博士2013年在美国盐湖城创立”“US BABYCARE INC”“海外专业认证”",
    risks:"R1美国公司成立晚于早期品牌创立叙事；R3美国市场声量与中国严重不匹配；R4核心销售市场在中国；R6创始人/实控人为中国籍；R8大量国内代工；R11短期扩张全品类",
    count:6, rating:"高", status:"两家独立媒体及公开监管抽查信息交叉核验；品牌现已弱化美国身份并定位设计师母婴品牌",
    response:"现行品牌介绍已简化，不再突出美国品牌；国内代工本身不等于产品质量不合格",
    sources:[
      "https://i.ifeng.com/c/8O8henDrcNX",
      "https://wap.zhengguannews.cn/html/zgh/346211.html",
      "https://commerce.utah.gov/corporations/searches/"
    ]
  },
  {
    industry:"母婴产品", cn:"因你", en:"inne", country:"德国",
    foreign:"inne相关德国公司（2020-07设立；公司全称/HRB No.待德国企业登记册复核）；早期商标申请人为英国TNSG HEALTH CO., LTD.",
    address:"德国注册地址待核；LinkedIn规模2–10人（媒体核验）",
    reg:"2020-07", domestic:"南京童年时光生物技术有限公司（USCC：待国家公示系统复核）",
    relation:"国内运营方在代理ChildLife后推出inne；德国主体负责人被报道为华人背景",
    factory:"部分产品在德国代工；并非全部国内生产，具体SKU需逐批核验",
    category:"儿童维生素、钙铁锌等营养品", channels:"天猫、京东、抖音、母婴渠道", price:"约100–600元",
    claim:"“德国研发”“药企级标准”“畅销德国药房”“德国高端母婴品牌”",
    risks:"R1商标/国内布局早于德国公司成立；R3德国团队和社媒规模与中国声量不匹配；R4德国本土销售规模存疑；R6华人管理且核心运营在中国；R11快速承接原店铺销量评价并扩SKU",
    count:5, rating:"高", status:"争议报道与品牌正面文章均已记录；存在真实德国生产/销售线索，故定性为“高风险嫌疑”而非假冒结论",
    response:"品牌方文章称产品德国研发生产、德国药店及电商有售；相关说法仍需独立销售数据佐证",
    sources:[
      "https://www.paiu.cn/article/7220.html",
      "https://m.sohu.com/a/1008241860_250147",
      "https://www.sohu.com/a/904049711_121617529"
    ]
  },
  {
    industry:"母婴产品", cn:"爷爷的农场", en:"Grandpa's Farm", country:"荷兰/欧洲（早期宣传）",
    foreign:"EARTH PRIME ENTERPRISE LIMITED（香港）；另有Earth Prime Enterprise B.V.（荷兰，登记号待核）；Grandpa's Farm (Hong Kong) Ltd CR No. 3134566",
    address:"荷兰主体地址：Olympisch Stadion 24, 1076 DE Amsterdam（体育场内商务地址，疑似共享）；香港主体地址待核",
    reg:"品牌2015年在中国创立；香港同名公司2022-03", domestic:"艾斯普瑞（广州）食品有限公司（USCC：待国家公示系统复核）",
    relation:"招股书披露为中国婴童零辅食企业；品牌权利主体为香港公司，境内运营位于广州",
    factory:"招股材料/媒体指大量产品由中国境内多家工厂代工，亦有进口SKU",
    category:"婴童辅食、零食、调味品", channels:"天猫、京东、抖音及母婴线下渠道", price:"约10–300元",
    claim:"早期“欧洲原装进口”“荷兰血统”“欧洲婴幼儿食品品牌进入中国”",
    risks:"R1海外主体/商标晚于中国品牌创立；R3海外社媒与中国声量不匹配；R4核心市场在中国；R6创始及核心团队为中国背景；R8大量国内代工；R11多SKU快速扩张",
    count:6, rating:"高", status:"品牌官网、港交所招股书、香港公司资料及媒体报道交叉核验；当前官网已明确香港所属公司",
    response:"当前官网强调全球选材与配方自研，并明确品牌所属香港公司；国内生产不代表冒充进口，需按具体SKU宣传判断",
    sources:[
      "https://www.grandpasfarm.com.cn/about/1.html",
      "https://finance.sina.cn/hkstock/gggd/2026-01-06/detail-inhfiznt5709894.d.html",
      "https://www.tempb.com/companies/gradpa-s-fram-hongkong-limited/",
      "https://finance.sina.com.cn/roll/2025-12-15/doc-inhawaum2069637.shtml"
    ]
  },
  {
    industry:"母婴产品", cn:"纽曼思", en:"Nemans", country:"美国（历史宣传）",
    foreign:"品牌自有美国注册公司资料见港交所文件；具体美国实体名称/州注册号需从招股书附录复核",
    address:"美国关联主体地址待核",
    reg:"中国NEMANS商标2009-04申请；美国主体成立时间待核", domestic:"金纽曼思（上海）食品有限公司；上海乳健国际贸易有限公司（USCC均待国家公示系统复核）",
    relation:"两家境内公司法定代表人曾同为王平；品牌与美国Martek仅为原料供应关系，并非Martek旗下品牌",
    factory:"历史产品由威海南波湾生物科技有限公司生产；目前产品链以最新标签为准",
    category:"婴幼儿DHA、营养补充品", channels:"天猫、京东、母婴渠道", price:"约100–500元",
    claim:"历史宣传“进口品牌Nemans”“美国马泰克进口海藻油”，容易使消费者误认为与Martek品牌有关",
    risks:"R4美国成品市场销售痕迹与国内不匹配；R7中国商标先行；R8历史产品山东威海生产；R9历史标签/品牌关联表达被指易误导；R10被权威财经媒体质疑假洋品牌",
    count:5, rating:"高", status:"历史媒体调查、商标号及后续港交所招股资料交叉核验；当前品牌权属与历史争议应区分",
    response:"后续港交所文件披露集团拥有“纽曼思/Nemans”自有品牌及美国注册公司，表明现阶段并非无境外主体",
    sources:[
      "https://www.ce.cn/cysc/sp/info/201305/13/t20130513_20518.shtml",
      "https://www.hkexnews.hk/listedco/listconews/sehk/2024/1230/2024123000006_c.pdf",
      "https://www1.hkexnews.hk/listedco/listconews/sehk/2025/0110/11506997/sehk24122401146.pdf"
    ]
  },
  {
    industry:"母婴产品", cn:"倍爱", en:"Biomate（历史品牌）", country:"新西兰",
    foreign:"新西兰倍爱乳品集团有限公司（NZ注册号待新西兰公司库复核）",
    address:"新西兰注册地址待核；媒体称境外有注册但部分产品在青岛生产",
    reg:"待核实", domestic:"青岛索康食品有限公司等（USCC待国家公示系统复核）",
    relation:"境外注册主体与中国生产、销售方授权链未完整披露",
    factory:"青岛索康食品有限公司（部分历史SKU）",
    category:"婴幼儿配方奶粉/羊奶粉（历史在售）", channels:"母婴门店及电商（当前在售状态待核）", price:"待核实",
    claim:"“新西兰品牌/新西兰乳品集团”",
    risks:"R4新西兰本土市场存在感弱；R5境外主体经营实质不透明；R8部分产品青岛生产；R10媒体及消费者多次质疑假洋皮；R9产地与新西兰品牌表达易混淆",
    count:5, rating:"高", status:"历史权威媒体报道交叉；因品牌当前活跃度和主体号未完全核实，建议仅作存量/历史风险线索",
    response:"未检索到针对历史质疑的完整公开回应",
    sources:[
      "https://finance.people.com.cn/n/2013/0201/c1004-20397710.html",
      "https://www.nbd.com.cn/articles/2013-05-06/738575.html",
      "https://www.ce.cn/"
    ]
  },
  {
    industry:"小家电", cn:"康巴赫", en:"KOBACH", country:"德国",
    foreign:"KOBACH GMBH（德国公司登记号/HRB待Unternehmensregister复核）",
    address:"德国注册地址待核；国内运营、设计和制造团队被媒体指主要位于中国",
    reg:"德国商标2013（报道口径）", domestic:"浙江巴赫厨具有限公司/浙江康巴赫科技股份有限公司（USCC待国家公示系统复核）",
    relation:"德国公司授权中国公司生产销售；品牌方称在德国注册并研发",
    factory:"浙江等中国境内工厂",
    category:"锅具、厨房小家电", channels:"天猫、京东、抖音及线下", price:"约100–1500元",
    claim:"“德国高端厨具品牌”“德国蜂窝锅”“德国注册并研发”",
    risks:"R1中国上市时间2012早于德国商标2013；R3德国社媒/团队声量弱；R4德国本土销售规模与中国不匹配；R6核心运营团队在中国；R8中国生产",
    count:5, rating:"高", status:"新京报调查、行业媒体时间线与品牌声明交叉核验；德国注册/研发主张存在但经营实质仍有争议",
    response:"品牌声明称康巴赫是在德国注册并研发产品的公司，中国公司仅获授权生产和销售",
    sources:[
      "https://m.bjnews.com.cn/detail/160939859415368.html",
      "https://m.sohu.com/a/414952341_659231",
      "https://www.toutiao.com/article/7271527799024779813/"
    ]
  },
  {
    industry:"小家电", cn:"千寿", en:"SENSU（拼写依商品页）", country:"日本",
    foreign:"未检索到与“1918年日本品牌”叙事匹配的日本生产经营主体；注册号待核",
    address:"日本注册地址待核",
    reg:"待核实", domestic:"广东生产/运营主体及USCC待商品铭牌、店铺资质复核",
    relation:"媒体核查称日本乐天及Amazon Japan无对应主流销售，产品产地为广东",
    factory:"广东省（具体工厂待产品铭牌）",
    category:"低糖电饭煲、厨房小家电", channels:"中国电商平台", price:"约300–1000元",
    claim:"“日本千寿”“日本低糖电饭煲”“百年品牌”",
    risks:"R2境外官网/主体信息薄弱；R3日本社媒无匹配声量；R4乐天和日本亚马逊检索不到；R5境外主体不透明；R8广东生产；R10被媒体作为假洋牌案例曝光",
    count:6, rating:"高", status:"澎湃系调查经联合新闻网转述，另以日本主流电商检索逻辑交叉；主体号仍需实物铭牌补证",
    response:"未检索到完整公开回应",
    sources:[
      "https://udn.com/news/story/7332/8609970",
      "https://www.thepaper.cn/",
      "https://www.amazon.co.jp/",
      "https://www.rakuten.co.jp/"
    ]
  },
  {
    industry:"小家电", cn:"蓝宝", en:"Blaupunkt", country:"德国",
    foreign:"GIP Development SARL（卢森堡，Blaupunkt品牌许可管理；注册号待卢森堡RCS复核）",
    address:"品牌权利/许可主体在卢森堡；德国历史品牌总部与中国小家电运营非同一经营实体",
    reg:"历史品牌1924；中国小家电业务约2019进入", domestic:"蓝宝小家电中国被许可运营主体（公司全称及USCC待店铺资质复核）",
    relation:"历史汽车音响商标通过许可进入中国小家电品类，具体SKU由中国企业运营生产",
    factory:"中国境内代工",
    category:"电动拖把、料理机、蒸汽洗地机等", channels:"天猫、京东、抖音", price:"约200–2000元",
    claim:"“德国蓝宝”“始于1924年德国柏林”“德国品质小家电”",
    risks:"R3德国本土小家电声量与国内不匹配；R4来源国同类小家电销售弱；R5品牌授权链复杂、权利主体非德国制造企业；R8中国代工；R10消费者频繁质疑“假洋货”及售后",
    count:5, rating:"中", status:"确认属于真实历史商标许可模式，不宜称冒牌；风险集中于宣传是否让消费者误认德国原厂生产",
    response:"品牌授权/许可本身合法；是否构成误导需结合具体商品页、铭牌和授权书判断",
    sources:[
      "https://www.sohu.com/a/529570975_250147",
      "https://www.diankeji.com/news/2021/58717.html",
      "https://www.blaupunkt.com/"
    ]
  },
  {
    industry:"小家电", cn:"大宇", en:"DAEWOO", country:"韩国",
    foreign:"POSCO DAEWOO/相关商标权利主体（韩国法人登记号待韩国DART复核）",
    address:"韩国品牌权利主体地址可核；中国小家电通常为许可运营",
    reg:"历史品牌1967；中国网红小家电集中推广时间较晚", domestic:"大宇小家电中国被许可运营主体（公司全称及USCC待店铺资质复核）",
    relation:"韩国历史商标向中国企业许可拓展生活小家电，产品设计、生产和销售主要在中国供应链",
    factory:"中国境内多家OEM/ODM",
    category:"便携榨汁杯、折叠锅、厨房小家电", channels:"天猫、京东、抖音、小红书", price:"约100–1500元",
    claim:"“韩国大宇”“1967年韩国釜山”“韩国品质/设计”",
    risks:"R3韩国同品类社媒与国内声量失衡；R4部分中国特供SKU在韩国难检；R5授权链跨主体且消费者难识别；R8中国代工；R11短期扩展大量SKU与内容渠道",
    count:5, rating:"中", status:"真实韩国历史品牌许可，不属于无中生有；列入的是“中国特供SKU宣传透明度”风险",
    response:"授权经营与国产制造本身合法，不能据此认定假洋牌；需核对每款授权及原产地表达",
    sources:[
      "https://www.diankeji.com/news/2021/58717.html",
      "https://www.sohu.com/a/529570975_250147",
      "https://www.daewoo.com/"
    ]
  },
  {
    industry:"小家电", cn:"西屋", en:"Westinghouse", country:"美国",
    foreign:"Westinghouse Electric Corporation / Westinghouse Licensing Corporation（美国；登记号待州公司库复核）",
    address:"美国品牌许可主体地址可核；中国小家电由不同被许可方经营",
    reg:"历史品牌1886；中国相关小家电约2015后集中推广", domestic:"西屋中国小家电被许可运营主体（公司全称及USCC待逐店授权页复核）",
    relation:"美国历史商标通过品牌许可覆盖中国按摩器、破壁机等品类",
    factory:"中国境内OEM/ODM",
    category:"破壁机、按摩椅、清洁电器等", channels:"天猫、京东、抖音及线下", price:"约200–10000元",
    claim:"“美国西屋”“始于1886年”“百年美国科技品牌”",
    risks:"R3美国相关小家电社媒与国内声量失衡；R4部分中国特供SKU在美国主流渠道难检；R5多层授权链透明度不足；R8中国代工；R11跨品类大量SKU快速扩展",
    count:5, rating:"中", status:"真实美国历史商标许可；风险是历史背书与具体产品研发、生产主体之间可能形成误认",
    response:"合法商标授权不等同于假品牌；最终判断必须核验具体SKU授权书和商品原产地页面",
    sources:[
      "https://www.diankeji.com/news/2021/58717.html",
      "https://www.westinghouse.com/",
      "https://www.sohu.com/a/529570975_250147"
    ]
  },
  {
    industry:"小家电", cn:"摩飞", en:"Morphy Richards", country:"英国",
    foreign:"Morphy Richards Limited（英国，Company No.待Companies House复核）",
    address:"英国历史品牌主体可核；中国业务长期由新宝股份等合作方生产运营",
    reg:"历史品牌1936；2013进入中国（品牌口径）", domestic:"广东新宝电器股份有限公司等（USCC待国家公示系统复核）",
    relation:"中国企业取得品牌在中国的运营/生产合作权益，后续股权/品牌交易以公告为准",
    factory:"广东省佛山市等中国工厂",
    category:"多功能锅、榨汁机、咖啡机等", channels:"天猫、京东、抖音及线下", price:"约200–2000元",
    claim:"“1936年英国创立”“英国高端小家电”",
    risks:"R3英国与中国市场同类产品声量差异大；R4中国爆款SKU在英国不一定对应销售；R5品牌权利与中国运营结构复杂；R8大量中国制造；R11中国市场快速扩SKU",
    count:5, rating:"中", status:"真实英国品牌且存在全球业务，不能称假洋牌；仅列为授权/本土化后产地与品牌叙事透明度风险",
    response:"品牌历史真实，国产制造和本地化产品正常；是否误导应以具体页面是否宣称英国原装为准",
    sources:[
      "https://www.diankeji.com/news/2021/58717.html",
      "https://www.morphyrichards.com/",
      "https://find-and-update.company-information.service.gov.uk/"
    ]
  }
];
rows.pop(); // Morphy Richards has stronger evidence of substantive UK operations; exclude from the 20-brand risk list.

const headers = [
  "品牌中文名","品牌外文名","声称来源国","境外注册主体（全称+注册号）","境外注册地址（含虚拟地址判断）",
  "境外注册时间","境内关联主体（全称+统一社会信用代码）","境内关联关系（股权/授权路径）","实际生产地",
  "主要产品类别","线上销售渠道","价格区间","典型“洋品牌”宣传话术","风险特征（R编号）","风险特征数",
  "风险评级","核验状态/适用边界","品牌方回应或反证","证据来源1","证据来源2","证据来源3","证据来源4","采集日期"
];

const wb = Workbook.create();
await wb.comments.setSelf({displayName:"User"});
const overview = wb.worksheets.add("总览与口径");
const sectors = ["保健品","美妆个护","母婴产品","小家电"];
for (const sector of sectors) wb.worksheets.add(sector);
const evidence = wb.worksheets.add("证据索引");

overview.getRange("A1:H1").merge();
overview.getRange("A1").values = [["“假洋牌”嫌疑商品清单（20个品牌）"]];
overview.getRange("A2:H2").merge();
overview.getRange("A2").values = [[`采集日期：${collected}｜用途：风险筛查，不是行政/司法认定`]];
overview.getRange("A4:B10").values = [
  ["指标","数值"],
  ["品牌数",rows.length],
  ["高风险",rows.filter(x=>x.rating==="高").length],
  ["中风险",rows.filter(x=>x.rating==="中").length],
  ["保健品",rows.filter(x=>x.industry==="保健品").length],
  ["美妆个护",rows.filter(x=>x.industry==="美妆个护").length],
  ["母婴产品",rows.filter(x=>x.industry==="母婴产品").length]
];
overview.getRange("D4:E5").values = [["指标","数值"],["小家电",rows.filter(x=>x.industry==="小家电").length]];
overview.getRange("A12:H20").values = [
  ["编号","风险特征定义","","","","","",""],
  ["R1","境外注册晚于中国推广，或注册后短期即大规模营销","","","","","",""],
  ["R2","官网仅中文或外文版明显简陋/域名很晚","","","","","",""],
  ["R3","境外社媒声量与国内营销严重不匹配","","","","","",""],
  ["R4","声称来源国主流电商无售或销量/存在感极低","","","","","",""],
  ["R5","境外注册地址/主体呈虚拟、代收、共享或异常特征","","","","","",""],
  ["R6","创始人/CEO/实控人为中国籍且核心运营在中国","","","","","",""],
  ["R7","国内商标早于境外商标","","","","","",""],
  ["R8","“国外工厂”无法验证，或实际为国内代工/生产","","","","","",""]
];
overview.getRange("A21:H23").values = [
  ["R9","外文/中文标签、成分、产地或进口要素不规范/易误导","","","","","",""],
  ["R10","投诉、媒体或监管材料频繁出现假洋牌/贴牌/国产冒充进口质疑","","","","","",""],
  ["R11","短期大量铺SKU与渠道，不符合一般海外品牌进入节奏","","","","","",""]
];
overview.getRange("A25:H30").values = [
  ["使用说明","","","","","","",""],
  ["1","本清单是风险筛查结果，风险评级不代表违法认定。","","","","","",""],
  ["2","“国内代工”“合法商标授权”本身不构成假洋牌，必须结合宣传语、来源国经营实质等判断。","","","","","",""],
  ["3","关键事实尽量采用官方登记库+独立媒体/品牌官网交叉；未取得登记号的字段明确标为待核实。","","","","","",""],
  ["4","正式执法、诉讼或对外发布前，应调取店铺资质页、实物标签、报关单、授权书和官方工商底档。","","","","","",""],
  ["5","中风险小家电多为真实历史商标许可模式，风险点是消费者是否被误导为境外原厂研发生产。","","","","","",""]
];

for (const sector of sectors) {
  const sh = wb.worksheets.getItem(sector);
  const data = rows.filter(x=>x.industry===sector);
  const values = data.map(x=>[
    x.cn,x.en,x.country,x.foreign,x.address,x.reg,x.domestic,x.relation,x.factory,x.category,x.channels,x.price,
    x.claim,x.risks,x.count,x.rating,x.status,x.response,x.sources[0]||"",x.sources[1]||"",x.sources[2]||"",x.sources[3]||"",collected
  ]);
  sh.getRangeByIndexes(0,0,1,headers.length).values = [headers];
  sh.getRangeByIndexes(1,0,values.length,headers.length).values = values;
  const table = sh.tables.add(`A1:W${values.length+1}`, true, `${sector.replace(/[^\w]/g,"")}Table`);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
  sh.freezePanes.freezeRows(1);
  sh.freezePanes.freezeColumns(2);
  sh.showGridLines = false;
  sh.getRange(`A1:W${values.length+1}`).format.wrapText = true;
  sh.getRange(`A2:W${values.length+1}`).format.verticalAlignment = "top";
  sh.getRange(`O2:O${values.length+1}`).format.numberFormat = "0";
  sh.getRange(`W2:W${values.length+1}`).format.numberFormat = "yyyy-mm-dd";
  sh.getRange(`P2:P${values.length+1}`).dataValidation = {rule:{type:"list",values:["高","中","低"]}};
  sh.getRange(`P2:P${values.length+1}`).conditionalFormats.add("containsText",{text:"高",format:{fill:"#FDE2E1",font:{color:"#B42318",bold:true}}});
  sh.getRange(`P2:P${values.length+1}`).conditionalFormats.add("containsText",{text:"中",format:{fill:"#FFF1CC",font:{color:"#7A4E00",bold:true}}});
  const widths = [15,18,12,34,38,13,36,42,32,20,28,16,38,52,12,12,48,45,38,38,38,38,13];
  widths.forEach((w,i)=>sh.getRangeByIndexes(0,i,values.length+1,1).format.columnWidth=w);
  sh.getRange("1:1").format.rowHeight = 45;
  sh.getRange(`2:${values.length+1}`).format.rowHeight = 120;
}

evidence.getRange("A1:F1").values = [["品牌","行业","来源序号","原始URL","来源类型/用途","采集日期"]];
const evidenceRows = [];
for (const r of rows) r.sources.forEach((url,i)=>evidenceRows.push([
  `${r.cn} / ${r.en}`,r.industry,i+1,url,
  /gov|government|brreg|abr\.business|companieshouse|find-and-update|hkexnews/.test(url) ? "官方登记/监管/交易所" :
  /official|\.com\/$|allpair|grandpasfarm|morphyrichards|westinghouse|daewoo|blaupunkt/.test(url) ? "品牌官网/企业资料" : "独立媒体/调查报道",
  collected
]));
evidence.getRangeByIndexes(1,0,evidenceRows.length,6).values = evidenceRows;
const evTable = evidence.tables.add(`A1:F${evidenceRows.length+1}`,true,"EvidenceTable");
evTable.style = "TableStyleMedium2";
evidence.freezePanes.freezeRows(1);
evidence.showGridLines=false;
evidence.getRange(`A1:F${evidenceRows.length+1}`).format.wrapText=true;
["A","B","C","D","E","F"].forEach((c,i)=>evidence.getRange(`${c}:${c}`).format.columnWidth=[24,14,10,68,24,14][i]);
evidence.getRange(`2:${evidenceRows.length+1}`).format.rowHeight=42;

overview.showGridLines=false;
overview.getRange("A1:H1").format={fill:"#17324D",font:{bold:true,color:"#FFFFFF",size:18},horizontalAlignment:"center",verticalAlignment:"center"};
overview.getRange("A2:H2").format={fill:"#DCE7F1",font:{color:"#17324D",italic:true},horizontalAlignment:"center"};
overview.getRange("A4:B10").format.borders={preset:"inside",style:"thin",color:"#D0D7DE"};
overview.getRange("A4:B4").format={fill:"#2F6B7C",font:{bold:true,color:"#FFFFFF"}};
overview.getRange("D4:E4").format={fill:"#2F6B7C",font:{bold:true,color:"#FFFFFF"}};
overview.getRange("A12:H12").format={fill:"#2F6B7C",font:{bold:true,color:"#FFFFFF"}};
overview.getRange("A25:H25").format={fill:"#2F6B7C",font:{bold:true,color:"#FFFFFF"}};
overview.getRange("A12:H30").format.wrapText=true;
overview.getRange("A:A").format.columnWidth=12;
overview.getRange("B:B").format.columnWidth=70;
overview.getRange("D:D").format.columnWidth=18;
overview.getRange("E:E").format.columnWidth=14;
overview.getRange("C:C").format.columnWidth=4;
overview.getRange("F:H").format.columnWidth=12;
overview.getRange("1:1").format.rowHeight=32;
overview.getRange("2:2").format.rowHeight=24;
overview.getRange("13:30").format.rowHeight=32;
overview.freezePanes.freezeRows(2);

const outDir = "C:/Users/59809/Documents/关键矿产/outputs/fake_foreign_brand_20";
for (const name of ["总览与口径",...sectors,"证据索引"]) {
  const blob = await wb.render({sheetName:name,autoCrop:"all",scale:0.8,format:"png"});
  await fs.writeFile(`${outDir}/preview_${name}.png`,new Uint8Array(await blob.arrayBuffer()));
}
const inspection = await wb.inspect({kind:"table",range:"总览与口径!A1:H30",include:"values,formulas",tableMaxRows:30,tableMaxCols:8});
console.log(inspection.ndjson);
const errors = await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"final formula error scan"});
console.log(errors.ndjson);
const file = await SpreadsheetFile.exportXlsx(wb);
await file.save(`${outDir}/假洋牌嫌疑商品清单_20品牌_2026-07-31.xlsx`);
console.log("EXPORTED");
