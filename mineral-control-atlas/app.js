const policyGroups = [
  {id:"ga-ge",symbol:"Ga·Ge",type:"稀散金属",name:"镓、锗",products:[["镓","Ga"],["锗","Ge"]],date:"2023-08-01",year:"2023",status:"active",statusText:"现行",scopeShort:"金属、化合物、晶片与衬底",scope:"镓侧包括金属镓、氮化镓、氧化镓、磷化镓、砷化镓、铟镓砷、硒化镓和锑化镓；锗侧包括金属锗、区熔锗锭、磷锗锌、锗外延生长衬底、二氧化锗和四氯化锗。",method:"满足公告特性的物项未经许可不得出口。经营者须经省级商务主管部门向商务部提交两用物项许可申请，并提供合同、技术说明、最终用户和最终用途证明。",source:"商务部、海关总署公告2023年第23号",url:"https://www.mofcom.gov.cn/zcfb/dwmygl/art/2023/art_52b9a321087f402bb3d310d18b07967e.html"},
  {id:"graphite",symbol:"C",type:"石墨",name:"石墨",date:"2023-12-01",year:"2023",status:"active",statusText:"现行",scopeShort:"高规格人造石墨、天然鳞片石墨",scope:"高纯度（>99.9%）、高强度（抗折强度>30 MPa）、高密度（>1.73 g/cm³）人造石墨材料及制品；天然鳞片石墨及球化石墨、膨胀石墨等制品。",method:"实行两用物项出口许可证管理和最终用户、最终用途审查；部分低敏感石墨物项退出旧临时管制。",source:"商务部、海关总署公告2023年第39号",url:"https://www.mofcom.gov.cn/zcfb/blgg/art/2023/art_f6b1bc49e2c8482f8eb749012bc66dec.html"},
  {id:"ree-tech",symbol:"RE",type:"技术",name:"稀土产业技术",date:"2023-12-21",year:"2023",status:"active",statusText:"现行",scopeShort:"萃取分离、金属合金、磁材技术",scope:"稀土萃取分离工艺、稀土金属及合金材料生产、钐钴/钕铁硼/铈磁体制备、稀土硼酸氧钙制备技术；另涉及离子型稀土矿山浸取工艺。",method:"稀土提炼、加工和利用技术列入禁止出口目录；离子型稀土矿山浸取工艺属于限制出口技术，出口前须取得许可。",source:"商务部、科技部公告2023年第57号及附件目录",url:"https://www.mofcom.gov.cn/cms_files/oldfile//fms/202312/20231221153855374.pdf"},
  {id:"antimony",symbol:"Sb",type:"战略金属",name:"锑",date:"2024-09-15",year:"2024",status:"active",statusText:"现行",scopeShort:"矿及原料、金属、氧化物与化合物",scope:"锑矿及原料、金属锑及制品、高纯氧化锑、有机锑化合物、锑的氢化物、高纯锑化铟，以及金锑冶炼分离技术。",method:"对符合纯度、晶体和形态要求的物项实行两用物项出口许可。重大国家安全影响事项报国务院批准。",source:"商务部、海关总署公告2024年第33号",url:"https://www.mofcom.gov.cn/zfxxgk/fdzdgknr/ztfl/dwmygl/art/2024/art_c37e7a6e7438428c951e2b1e488dc47e.html"},
  {id:"diamond",symbol:"C◆",type:"超硬材料",name:"金刚石等超硬材料",date:"2024-09-15",year:"2024",status:"active",statusText:"现行",scopeShort:"窗口材料、合成设备与工艺技术",scope:"特定金刚石窗口材料、六面顶压机及关键零部件、MPCVD设备，以及人造金刚石单晶或立方氮化硼单晶合成工艺技术。",method:"材料、设备、零部件与工艺技术同时纳入两用物项出口许可，形成制造链条管制。",source:"商务部、海关总署公告2024年第33号",url:"https://www.mofcom.gov.cn/zfxxgk/fdzdgknr/ztfl/dwmygl/art/2024/art_c37e7a6e7438428c951e2b1e488dc47e.html"},
  {id:"five-metals",symbol:"W+4",type:"战略金属",name:"钨、碲、铋、钼、铟",products:[["钨","W"],["碲","Te"],["铋","Bi"],["钼","Mo"],["铟","In"]],date:"2025-02-04",year:"2025",status:"active",statusText:"现行",scopeShort:"特定材料、化合物、粉末与技术",scope:"钨包括仲钨酸铵、氧化钨、碳化钨和特定钨合金；碲包括金属碲及碲化物；铋包括金属铋及有机铋化合物；钼为高含量细颗粒粉末；铟包括磷化铟、三甲基铟和三乙基铟。",method:"按成分、粒径、尺寸、密度和力学性能等参数列管，同时覆盖相应生产技术。出口须向商务部申请许可。",source:"商务部、海关总署公告2025年第10号",url:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_084ded0609404b2d81c746b31c9a03a6.html"},
  {id:"seven-ree",symbol:"7RE",type:"中重稀土",name:"钐、钆、铽、镝、镥、钪、钇",products:[["钐","Sm"],["钆","Gd"],["铽","Tb"],["镝","Dy"],["镥","Lu"],["钪","Sc"],["钇","Y"]],date:"2025-04-04",year:"2025",status:"active",statusText:"现行",scopeShort:"金属、合金、氧化物与永磁材料",scope:"七种稀土元素的金属、特定合金、靶材、氧化物、化合物及混合物；部分物项延伸至钐钴、含铽或含镝钕铁硼永磁材料。",method:"实行两用物项单项许可；报关须注明管制编码。海关可对参数接近、真实性存疑的货物质疑并暂停放行。",source:"商务部、海关总署公告2025年第18号",url:"https://www.mofcom.gov.cn/zcfb/zc/art/2025/art_a6ea0f03b9be475a9d06ee9d088d605d.html"},
  {id:"five-ree-paused",symbol:"5RE",type:"中重稀土",name:"钬、铒、铥、铕、镱",products:[["钬","Ho"],["铒","Er"],["铥","Tm"],["铕","Eu"],["镱","Yb"]],date:"2025-10-09",pauseDate:"2025-11-07",pauseNotice:"2025年第70号暂停公告",pauseUrl:"https://www.mofcom.gov.cn/zfxxgk/fdzdgknr/ztfl/dwmygl/art/2025/art_00667414c0524b018985abd28b8847a5.html",year:"2025",status:"paused",statusText:"暂停至 2026-11-10",scopeShort:"金属、合金、氧化物与化合物",scope:"原公告拟对五种中重稀土的金属、合金、靶材、氧化物、化合物及其混合物实施出口管制。",method:"原定采用两用物项出口许可，但2025年第70号公告已将该措施暂停实施至2026年11月10日。",source:"2025年第57号公告；第70号暂停公告",url:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_b9cf403808634a649ce8b3f921f4dcf3.html"},
  {id:"battery-paused",symbol:"Li+",type:"电池材料",name:"锂电及正负极材料",date:"2025-10-09",pauseDate:"2025-11-07",pauseNotice:"2025年第70号暂停公告",pauseUrl:"https://www.mofcom.gov.cn/zfxxgk/fdzdgknr/ztfl/dwmygl/art/2025/art_00667414c0524b018985abd28b8847a5.html",year:"2025",status:"paused",statusText:"暂停至 2026-11-10",scopeShort:"锂、镍、钴、锰、磷与石墨下游",scope:"原公告涉及高能量密度锂离子电池、磷酸铁锂正极、镍钴锰/镍钴铝前驱体、富锂锰基材料、人造石墨负极及相关设备和技术。",method:"针对特定下游材料、设备和技术实行许可，并非对锂矿、镍矿、钴矿等原矿全面管制。现暂停至2026年11月10日。",source:"2025年第58号公告；第70号暂停公告",url:"https://interview.mofcom.gov.cn/mofcom_interview/front/opdata/downlodePdfNew?id=ea1c3c25d9094e40a70c9c2d887953f8"},
  {id:"diamond-paused",symbol:"C◇",type:"超硬材料",name:"人造金刚石扩围",date:"2025-10-09",pauseDate:"2025-11-07",pauseNotice:"2025年第70号暂停公告",pauseUrl:"https://www.mofcom.gov.cn/zfxxgk/fdzdgknr/ztfl/dwmygl/art/2025/art_00667414c0524b018985abd28b8847a5.html",year:"2025",status:"paused",statusText:"暂停至 2026-11-10",scopeShort:"微粉、单晶、线锯、砂轮与设备",scope:"原公告新增特定粒径人造金刚石微粉和单晶、人造金刚石线锯、砂轮，以及DCPCVD设备和工艺技术。",method:"新增扩围措施暂停至2026年11月10日；2024年第33号公告中的既有超硬材料管制仍有效。",source:"2025年第55号公告；第70号暂停公告",url:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_628491c002b940ad906efc445b1ee260.html"},
  {id:"ree-chain-paused",symbol:"RE∞",type:"全产业链",name:"稀土设备与境外规则",date:"2025-10-09",pauseDate:"2025-11-07",pauseNotice:"2025年第70号暂停公告",pauseUrl:"https://www.mofcom.gov.cn/zfxxgk/fdzdgknr/ztfl/dwmygl/art/2025/art_00667414c0524b018985abd28b8847a5.html",year:"2025",status:"paused",statusText:"暂停至 2026-11-10",scopeShort:"生产设备、原辅料、境外产品与技术",scope:"原措施包括稀土生产加工设备与原辅料、含中国稀土的境外制造产品，以及境外稀土开采、分离、冶炼、磁材和回收相关技术与实质性支持。",method:"拟建立设备—技术—境外含量规则的全链条管制。第56、61、62号公告目前均暂停至2026年11月10日。",source:"2025年第56、61、62号公告；第70号暂停公告",url:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_fb0315cc86bb4b6992f3194f419d8eb7.html"}
];

const policies = policyGroups.flatMap(group =>
  group.products
    ? group.products.map(([name, symbol]) => ({
        ...group,
        id: `${group.id}-${symbol.toLowerCase()}`,
        name,
        symbol,
        policyGroup: group.name,
        products: undefined
      }))
    : [{...group, policyGroup: group.name}]
);

const mineralMarketData = [
  {name:"镓",symbol:"Ga",type:"稀散金属",product:"金属镓 99.99%",exports:[100,118,94],price:"575",unit:"美元/千克",change:-2.4},
  {name:"锗",symbol:"Ge",type:"稀散金属",product:"金属锗 99.99%",exports:[100,109,87],price:"3,950",unit:"美元/千克",change:4.8},
  {name:"石墨",symbol:"C",type:"非金属矿产",product:"天然鳞片石墨 94%C",exports:[100,82,89],price:"650",unit:"美元/吨",change:-1.6},
  {name:"锑",symbol:"Sb",type:"战略金属",product:"锑锭 99.65%",exports:[100,91,76],price:"19,800",unit:"美元/吨",change:6.3},
  {name:"金刚石",symbol:"C◆",type:"超硬材料",product:"工业金刚石微粉",exports:[100,106,98],price:"0.35",unit:"美元/克拉",change:1.2},
  {name:"钨",symbol:"W",type:"战略金属",product:"仲钨酸铵 APT",exports:[100,104,111],price:"520",unit:"美元/吨度",change:3.5},
  {name:"碲",symbol:"Te",type:"稀散金属",product:"金属碲 99.99%",exports:[100,96,102],price:"105",unit:"美元/千克",change:2.1},
  {name:"铋",symbol:"Bi",type:"战略金属",product:"金属铋 99.99%",exports:[100,108,116],price:"13.2",unit:"美元/千克",change:5.7},
  {name:"钼",symbol:"Mo",type:"战略金属",product:"氧化钼 57%",exports:[100,103,107],price:"28.5",unit:"美元/磅",change:-0.8},
  {name:"铟",symbol:"In",type:"稀散金属",product:"金属铟 99.995%",exports:[100,113,121],price:"390",unit:"美元/千克",change:2.9},
  {name:"钐",symbol:"Sm",type:"中重稀土",product:"氧化钐 99.9%",exports:[100,97,105],price:"2.3",unit:"美元/千克",change:0.6},
  {name:"钆",symbol:"Gd",type:"中重稀土",product:"氧化钆 99.9%",exports:[100,102,110],price:"28",unit:"美元/千克",change:3.1},
  {name:"铽",symbol:"Tb",type:"中重稀土",product:"氧化铽 99.99%",exports:[100,89,73],price:"1,050",unit:"美元/千克",change:8.4},
  {name:"镝",symbol:"Dy",type:"中重稀土",product:"氧化镝 99.5%",exports:[100,92,78],price:"260",unit:"美元/千克",change:7.2},
  {name:"镥",symbol:"Lu",type:"中重稀土",product:"氧化镥 99.99%",exports:[100,105,96],price:"760",unit:"美元/千克",change:1.9},
  {name:"钪",symbol:"Sc",type:"中重稀土",product:"氧化钪 99.99%",exports:[100,101,108],price:"950",unit:"美元/千克",change:-1.1},
  {name:"钇",symbol:"Y",type:"中重稀土",product:"氧化钇 99.999%",exports:[100,98,103],price:"5.8",unit:"美元/千克",change:0.9},
  {name:"钬",symbol:"Ho",type:"中重稀土",product:"氧化钬 99.9%",exports:[100,104,99],price:"65",unit:"美元/千克",change:2.6},
  {name:"铒",symbol:"Er",type:"中重稀土",product:"氧化铒 99.9%",exports:[100,107,112],price:"32",unit:"美元/千克",change:1.4},
  {name:"铥",symbol:"Tm",type:"中重稀土",product:"氧化铥 99.99%",exports:[100,95,84],price:"720",unit:"美元/千克",change:4.2},
  {name:"铕",symbol:"Eu",type:"中重稀土",product:"氧化铕 99.99%",exports:[100,93,88],price:"29",unit:"美元/千克",change:-0.5},
  {name:"镱",symbol:"Yb",type:"中重稀土",product:"氧化镱 99.9%",exports:[100,106,109],price:"14",unit:"美元/千克",change:1.8}
];

const criticalPolicySituation = [
  {
    code:"CN",name:"中国",tone:"green",status:"许可体系持续运行",headline:"7组现行 · 4组暂停",
    summary:"现行范围覆盖镓锗、石墨、锑及超硬材料、钨等五类物项和七种中重稀土，并对特定目的地实施差异化审查。",
    facts:["扩围措施中的第55、56、57、58、61、62号公告暂停至2026年11月10日","物项识别从税号进一步下沉至成分、纯度、粒度、形态、性能和用途"],
    watch:"暂停到期后的恢复、延期或调整"
  },
  {
    code:"US",name:"美国",tone:"blue",status:"政府深度介入市场",headline:"关键矿产清单扩大至60种",
    summary:"政策重点已由支持采矿转向覆盖加工、精炼、磁材和战略储备的全链条安全能力。",
    facts:["国防资本、政策贷款、价格保护和采购承诺共同稳定项目收益","国家安全调查、供应链韧性融资和战略储备并行推进"],
    watch:"许可周期、财政成本和项目商业竞争力"
  },
  {
    code:"EU",name:"欧盟",tone:"cyan",status:"法规目标转入项目实施",headline:"10% · 40% · 25% · 65%",
    summary:"围绕2030年开采、加工、回收和单一第三国依赖目标，推进战略项目、许可提速、联合采购和库存协调。",
    facts:["首批战略项目覆盖开采、加工、回收和替代环节","需求聚合与联合采购开始为长期承购和项目融资提供支撑"],
    watch:"成员国执行差异、能源成本与私人资本缺口"
  },
  {
    code:"JP",name:"日本",tone:"violet",status:"长期承购持续加码",headline:"投资+承购+储备",
    summary:"通过JOGMEC投资、资源外交和长期合同锁定海外可获得份额，重点关注重稀土和磁体供应。",
    facts:["持续深化与Lynas的矿山—分离合作","支持Caremag等重稀土项目并推动回收原料与海外加工结合"],
    watch:"海外项目爬坡、价格风险和长期供货兑现"
  },
  {
    code:"KR",name:"韩国",tone:"amber",status:"制造连续性优先",headline:"33种关键矿产",
    summary:"围绕电池、半导体和汽车产业扩大储备、海外开发支持和供应链预警。",
    facts:["政策工具以储备、产业基金、海外合作和回收目标为主","下游制造能力较强，但部分前驱体、石墨和原料仍高度依赖外部"],
    watch:"库存只能换取调整时间，不能替代中游能力"
  },
  {
    code:"AU",name:"澳大利亚",tone:"red",status:"资源与金融工具叠加",headline:"战略储备进入工具化",
    summary:"从资源出口国转向资源、加工和金融工具提供者，使用长期承购、远期合同、需求聚合和选择性库存支持项目。",
    facts:["首批重点关注锑、镓及轻重稀土","政策贷款、税收抵免与盟友需求共同支撑本土加工"],
    watch:"高加工成本、融资关闭和政府商品交易能力"
  },
  {
    code:"IN",name:"印度",tone:"teal",status:"全链条任务启动",headline:"勘探到回收一体推进",
    summary:"国家关键矿产任务覆盖勘探、采矿、选矿、加工园区、海外资产、尾矿回收和技术研发。",
    facts:["政策优势来自市场规模、工程能力和集中协调","海外资源布局与国内加工基础设施同步推进"],
    watch:"工艺积累、基础设施与建设周期"
  }
];

const foreignResponseMeasures = [
  {id:"capital",num:"01",title:"政策融资与价格保护",stage:"强化",tone:"blue",desc:"政府由一次性补贴转向股权、长期贷款、价格底线和合同价差，降低低价周期对项目现金流的冲击。",impact:"推动分离、精炼和磁体项目跨过融资门槛",constraint:"财政成本与长期成本竞争力"},
  {id:"offtake",num:"02",title:"长期承购与需求聚合",stage:"加速",tone:"green",desc:"通过多年承购、联合采购和下游订单锁定，把资源、加工设施与终端制造需求连接成闭环。",impact:"提高项目可融资性并锁定可获得份额",constraint:"规格匹配、排他条款与客户认证"},
  {id:"reserve",num:"03",title:"战略储备与库存协调",stage:"扩围",tone:"amber",desc:"储备工具由国防应急延伸到民用经济安全，并与远期合同、私人库存和紧急调拨结合。",impact:"在许可变化或供应中断时提供短期缓冲",constraint:"轮换成本、品质管理与触发机制"},
  {id:"alliance",num:"04",title:"联盟融资与标准市场",stage:"成形",tone:"cyan",desc:"G7、Quad及双边伙伴关系正从政策声明转向项目筛选、融资协同、标准互认和物流安排。",impact:"形成区别于全球现货市场的安全供应网络",constraint:"重复投资、规则不兼容与执行协调"},
  {id:"recycle",num:"05",title:"回收、减量与替代研发",stage:"分层",tone:"violet",desc:"短期优先生产废料回收和材料减量，中长期推进无稀土电机、替代半导体和产品重设计。",impact:"降低单位用量并增加可切换供给",constraint:"原料规模、性能折衷与产业化认证"}
];

const alternativeCountryActions = [
  {code:"US",name:"美国",tone:"blue",focus:"稀土 · 磁体 · 石墨",status:"全链条建厂",action:"以国防资本、政策贷款、价格保护和采购承诺支持矿山、分离、磁体与合成石墨产线。",facilities:["Mountain Pass分离与10X磁体工厂","White Mesa稀土分离","eVAC南卡磁体工厂","NOVONIX合成石墨扩产"]},
  {code:"AU",name:"澳大利亚",tone:"amber",focus:"稀土 · 锑 · 镓",status:"资源转加工",action:"通过政策融资、税收抵免、长期承购和战略储备，把资源优势向本土精炼与加工延伸。",facilities:["Lynas Mt Weld与Kalgoorlie","Iluka Eneabba精炼项目","Arafura Nolans稀土项目","Alcoa-Sojitz Wagerup镓回收"]},
  {code:"FR",name:"法国",tone:"violet",focus:"重稀土 · 回收",status:"恢复欧洲中游",action:"叠加本国和日本政策支持，建设重稀土分离、回收磁体处理和长期供货能力。",facilities:["Caremag Lacq重稀土项目","Solvay La Rochelle扩建"]},
  {code:"EE",name:"爱沙尼亚",tone:"cyan",focus:"稀土磁体",status:"磁体产能落地",action:"依托既有稀土加工基础，把欧洲供应链从分离环节继续延伸至烧结永磁体制造。",facilities:["Neo Performance Narva磁体工厂","Silmet稀土加工基地"]},
  {code:"CA",name:"加拿大",tone:"teal",focus:"稀土 · 金属化",status:"分阶段投运",action:"推动稀土分离和金属化设施分阶段投运，并以公共融资、五年承购和扩建研究连接北美下游需求。",facilities:["SRC Saskatchewan稀土加工与金属化","NdPr金属商业产线","Dy/Tb氧化物与金属扩展"]},
  {code:"JP",name:"日本",tone:"red",focus:"重稀土 · 长期承购",status:"海外锁量",action:"不以国内大规模采矿为主，而以JOGMEC投资、长期承购、储备和资源外交锁定海外份额。",facilities:["持续投资Lynas全产业链","支持Caremag并锁定镝铽供应","推进回收磁体原料体系"]},
  {code:"KR",name:"韩国",tone:"green",focus:"钨 · 电池材料",status:"矿山重启+制造协同",action:"围绕 Sangdong 钨矿重启形成非中国钨精矿增量；稳定供应仍取决于实际投产和中游加工配套。",facilities:["Sangdong钨矿重启","中游加工配套待跟踪"]},
  {code:"BR",name:"巴西",tone:"green",focus:"中重稀土",status:"商业爬坡",action:"推动离子吸附型稀土资源商业化，增加西半球中重稀土矿端选择。",facilities:["Serra Verde Pela Ema项目"]},
  {code:"MY",name:"马来西亚",tone:"cyan",focus:"稀土分离",status:"商业扩展",action:"在既有规模化分离基础上扩展镝、铽等重稀土产品，承担中国以外中游节点。",facilities:["Lynas Malaysia分离基地","重稀土商业化扩展"]},
  {code:"IN",name:"印度",tone:"amber",focus:"勘探 · 加工 · 回收",status:"国家任务推进",action:"把勘探拍卖、加工园区、海外资产、尾矿利用和研发纳入统一任务体系。",facilities:["关键矿产加工园区","KABIL海外资源布局","国内稀土与回收能力扩建"]},
  {code:"MW",name:"马拉维",tone:"violet",focus:"稀土",status:"工程与融资",action:"依托矿山资源推进选矿和下游衔接，尝试形成非洲垂直整合稀土供应链。",facilities:["Songwe Hill项目"]},
  {code:"AO",name:"安哥拉",tone:"red",focus:"稀土",status:"建设推进",action:"利用资源与Lobito走廊物流条件，建设混合稀土产品供应能力。",facilities:["Longonjo稀土项目"]},
  {code:"ZA",name:"南非",tone:"teal",focus:"稀土回收",status:"可研推进",action:"从既有磷石膏等工业存量中回收稀土，降低新矿山开发和尾矿处置压力。",facilities:["Phalaborwa磷石膏回收项目"]}
];

const alternativeSupplyProjects = [
  {name:"Mountain Pass / MP Materials",region:"美国",mineral:"稀土",stage:"商业生产 / 扩建",stageKey:"delivery",chain:"矿山—分离—磁体",progress:"轻稀土已形成商业交付，重稀土分离和磁体能力继续建设。",bottleneck:"重稀土供给、成本和客户认证"},
  {name:"Lynas · Mt Weld—Malaysia",region:"澳大利亚 / 马来西亚",mineral:"稀土",stage:"商业生产 / 扩展",stageKey:"delivery",chain:"矿山—裂解浸出—分离",progress:"已形成中国以外规模化供应，并继续扩展镝铽等重稀土能力。",bottleneck:"产能爬坡、加工成本和长期承购"},
  {name:"Caremag Lacq",region:"法国",mineral:"重稀土",stage:"建设推进",stageKey:"build",chain:"回收磁体 / 原矿—重稀土分离",progress:"政府支持和长期供货安排已形成，目标补充欧洲重稀土分离能力。",bottleneck:"连续运行、原料来源和产品认证"},
  {name:"Eneabba",region:"澳大利亚",mineral:"稀土",stage:"建设 / 融资",stageKey:"build",chain:"矿砂副产物—稀土精炼",progress:"利用既有矿砂副产资源建设综合精炼能力。",bottleneck:"资本开支、进度控制和商业承购"},
  {name:"Serra Verde",region:"巴西",mineral:"中重稀土",stage:"商业爬坡",stageKey:"ramp",chain:"离子吸附型矿—混合产品",progress:"资源端已进入商业化阶段，正验证稳定产量和重稀土产品能力。",bottleneck:"产品稳定性、分离去向和物流"},
  {name:"White Mesa / Energy Fuels",region:"美国",mineral:"稀土",stage:"商业生产 / 扩建",stageKey:"delivery",chain:"独居石—分离氧化物—重稀土扩展",progress:"轻稀土产品已进入商业化阶段，并继续推进镝铽等重稀土分离。",bottleneck:"原料稳定、重稀土规模和长期成本"},
  {name:"eVAC Magnetics",region:"美国",mineral:"永磁体",stage:"建厂 / 认证",stageKey:"build",chain:"合金—制粉—烧结磁体",progress:"在南卡罗来纳建设钕铁硼磁体产能，面向汽车和国防客户认证。",bottleneck:"合金原料、制造良率和批量认证"},
  {name:"Neo Performance Narva",region:"爱沙尼亚",mineral:"永磁体",stage:"投产爬坡",stageKey:"ramp",chain:"稀土材料—烧结磁体",progress:"欧洲本土磁体工厂进入投产和客户导入阶段。",bottleneck:"稀土金属供应、成本和订单规模"},
  {name:"SRC Saskatchewan",region:"加拿大",mineral:"稀土",stage:"建设推进",stageKey:"build",chain:"分离—金属冶炼—下游供货",progress:"建设轻重稀土分离和金属化能力，补充北美中游节点。",bottleneck:"工程放大、产品规格和下游承购"},
  {name:"Solvay La Rochelle",region:"法国",mineral:"稀土",stage:"运营 / 扩建",stageKey:"delivery",chain:"稀土分离—高纯化合物",progress:"利用既有欧洲稀土化工基础扩展永磁相关轻重稀土产品。",bottleneck:"原料来源、能源成本和扩建节奏"},
  {name:"Nolans / Arafura",region:"澳大利亚",mineral:"稀土",stage:"融资 / 建设准备",stageKey:"build",chain:"矿山—分离—NdPr氧化物",progress:"推进矿山和分离一体化项目，争取以长期承购支持项目融资。",bottleneck:"资本开支、融资关闭和投产周期"},
  {name:"Wagerup / Alcoa—Sojitz",region:"澳大利亚",mineral:"镓",stage:"优先项目 / 工程推进",stageKey:"build",chain:"氧化铝流程—副产镓回收—精制",progress:"依托既有氧化铝生产流程建设副产镓回收能力，增加中国以外的初级镓来源。",bottleneck:"回收率、精制衔接和商业规模"},
  {name:"Songwe Hill",region:"马拉维",mineral:"稀土",stage:"工程准备",stageKey:"pilot",chain:"矿山—选矿—下游衔接",progress:"完成前期工程研究并推进融资，尝试构建非洲稀土供应节点。",bottleneck:"融资、基础设施和商业承购"},
  {name:"Longonjo",region:"安哥拉",mineral:"稀土",stage:"建设推进",stageKey:"build",chain:"矿山—混合稀土产品",progress:"利用Lobito走廊物流条件推进稀土项目建设。",bottleneck:"工程资金、项目进度和后续分离能力"},
  {name:"Phalaborwa",region:"南非",mineral:"稀土回收",stage:"可研 / 融资",stageKey:"pilot",chain:"磷石膏—稀土回收—NdPr产品",progress:"从既有工业副产物中回收稀土，降低新矿山开发压力。",bottleneck:"工艺放大、融资和稳定交付"},
  {name:"Sangdong",region:"韩国",mineral:"钨",stage:"重启建设",stageKey:"build",chain:"钨矿—精矿",progress:"矿山重启可增加非中国钨精矿来源。",bottleneck:"从精矿到APT、碳化钨和高规格粉末的中游缺口"},
  {name:"北美石墨项目群",region:"美国 / 加拿大",mineral:"石墨",stage:"多项目建设",stageKey:"build",chain:"矿山—球化—提纯—负极",progress:"矿端选择增加，球化提纯和负极材料产线同步布局。",bottleneck:"能耗、成本、包覆工艺和电池客户认证"},
  {name:"副产镓锗回收项目",region:"美国 / 欧洲 / 日本",mineral:"镓、锗",stage:"研发至扩产",stageKey:"pilot",chain:"铝土矿 / 锌冶炼 / 煤灰—高纯精制",progress:"围绕既有铝、锌和煤系原料流增加回收与高纯精制能力。",bottleneck:"副产原料流量、回收率、纯度和小市场经济性"}
];

// 替代项目仅以公开一手材料核验进度；“待补充”不作为已形成供应能力的依据。
const alternativeProjectVerification = {
  "Mountain Pass / MP Materials":{date:"2026-02-26",source:"MP Materials 官方公告",url:"https://investors.mpmaterials.com/investor-news/news-details/2026/MP-Materials-Selects-Northlake-Texas-as-the-Site-of-10X-a-New-U-S--Rare-Earth-Magnet-Manufacturing-Campus/default.aspx",status:"已核验 · 现有产线运营，10X 为建设计划"},
  "Lynas · Mt Weld—Malaysia":{date:"2026-03-02",source:"马来西亚许可续期报道",url:"https://apnews.com/article/a9e3f931987ca2011133fee15f666fac",status:"已核验 · 现有分离基地运营，扩展需持续跟踪"},
  "Caremag Lacq":{date:"2025-03-17",source:"日本经济产业省 / JOGMEC",url:"https://www.meti.go.jp/english/press/2025/0317_002.html",status:"已核验 · 建设中，非商业供应"},
  "Eneabba":{date:"2026-02-20",source:"Iluka 2025 年报",url:"https://www.iluka.com/media/yhwn2hzi/iluka-ar25-final-single-pages-18226.pdf",status:"已核验 · 精炼厂建设项目，未作商业供给计入"},
  "Serra Verde":{date:"2026-02-05",source:"Serra Verde 官方公告",url:"https://www.serraverde.com/2026/02/serra-verde-secures-us565-million-financing-from-us-international-development-finance-corporation/",status:"已核验 · 已商业生产，仍在优化扩产"},
  "White Mesa / Energy Fuels":{date:"2026-03-25",source:"Energy Fuels 官方公告",url:"https://investors.energyfuels.com/2026-03-25-Energy-Fuels-Announces-First-U-S-Primary-Production-of-Critical-Heavy-Rare-Earth-Material-in-Decades",status:"已核验 · 重稀土为试产/小批量，规模化待验证"},
  "eVAC Magnetics":{date:"—",source:"企业项目页",url:"https://evacmagnetics.com/",status:"待补充核验 · 需补入最新投产与认证公告"},
  "Neo Performance Narva":{date:"2025-09-19",source:"Neo Performance Materials 官方公告",url:"https://www.neomaterials.com/estonia/2/",status:"已核验 · 工厂已启用，产能爬坡中"},
  "SRC Saskatchewan":{date:"—",source:"Saskatchewan Research Council 项目页",url:"https://www.srcsk.ca/",status:"待补充核验 · 需补入最新分离/金属化投运公告"},
  "Solvay La Rochelle":{date:"2025-04-08",source:"Solvay 官方公告",url:"https://www.solvay.com/en/press-release/solvay-advances-european-rare-earths-production-through-capacity-expansion",status:"已核验 · 永磁材料稀土产线已启动商业生产"},
  "Nolans / Arafura":{date:"2026-05-21",source:"澳大利亚出口融资机构",url:"https://www.exportfinance.gov.au/newsroom/strategic-reserve-supporting-arafura-final-investment-decision/",status:"已核验 · 已作出投资决定，尚未形成供给"},
  "Wagerup / Alcoa—Sojitz":{date:"2025-10-20",source:"Alcoa 官方公告",url:"https://news.alcoa.com/press-releases/press-release-details/2025/GOVERNMENTS-ANNOUNCE-SUPPORT-FOR-ALCOAS-GALLIUM-CRITICAL-MINERAL-DEVELOPMENT-PROJECT-IN-WESTERN-AUSTRALIA/default.aspx",status:"已核验 · 联合开发阶段，非已投产项目"},
  "Songwe Hill":{date:"—",source:"Mkango 项目页",url:"https://mkango.ca/",status:"待补充核验 · 工程与融资状态需以公司最新公告确认"},
  "Longonjo":{date:"2026-06-08",source:"Pensana 官方运营更新",url:"https://pensana.co.uk/operational-update-8th-june-2026/",status:"已核验 · 项目推进中，商业供给尚待确认"},
  "Phalaborwa":{date:"2026-07-01",source:"伦敦证券交易所公司公告",url:"https://www.londonstockexchange.com/news-article/ECOR/update-on-the-phalaborwa-rare-earths-project-dfs/17667420",status:"已核验 · 可研/工程阶段，目标不等于已投产"},
  "Sangdong":{date:"2025-07-03",source:"Almonty 技术报告更新",url:"https://almonty.com/wp-content/uploads/2025/07/AII_NR250703_2.pdf",status:"已核验 · 当时预计下半年投产，需补入实际投产证明"},
  "北美石墨项目群":{date:"—",source:"聚合观察项",url:"https://www.novonixgroup.com/",status:"待拆分核验 · 不作为单一项目或已形成供应能力"},
  "副产镓锗回收项目":{date:"—",source:"聚合观察项",url:"https://www.alcoa.com/",status:"待拆分核验 · 各项目工艺、规模与投产状态不同"}
};

// 国别行动以一项代表性公开项目作核验锚点；不据此推定该国全部替代能力已落地。
const alternativeCountryVerification = {
  US:"Mountain Pass / MP Materials", AU:"Nolans / Arafura", FR:"Solvay La Rochelle", EE:"Neo Performance Narva", CA:"SRC Saskatchewan", JP:"Caremag Lacq", KR:"Sangdong", BR:"Serra Verde", MY:"Lynas · Mt Weld—Malaysia", IN:null, MW:"Songwe Hill", AO:"Longonjo", ZA:"Phalaborwa"
};

const alternativeCountryEvidence = {
  US:{date:"2026-02-26",source:"MP Materials 官方公告",url:"https://investors.mpmaterials.com/investor-news/news-details/2026/MP-Materials-Selects-Northlake-Texas-as-the-Site-of-10X-a-New-U-S--Rare-Earth-Magnet-Manufacturing-Campus/default.aspx",status:"已核验"},
  AU:{date:"2026-05-21",source:"澳大利亚出口融资机构",url:"https://www.exportfinance.gov.au/newsroom/strategic-reserve-supporting-arafura-final-investment-decision/",status:"已核验"},
  FR:{date:"2025-04-08",source:"Solvay 官方公告",url:"https://www.solvay.com/en/press-release/solvay-advances-european-rare-earths-production-through-capacity-expansion",status:"已核验"},
  EE:{date:"2025-09-19",source:"Neo Performance Materials 官方公告",url:"https://www.neomaterials.com/estonia/2/",status:"已核验"},
  CA:{date:"2025-12-08",source:"萨斯喀彻温省政府公告",url:"https://www.saskatchewan.ca/government/news-and-media/2025/december/08/saskatchewan-research-council-and-realloys-sign-historic-rare-earth-partnership-agreements-advancing",status:"已核验"},
  JP:{date:"2025-03-17",source:"JOGMEC 官方公告",url:"https://www.jogmec.go.jp/english/news/release/release_00412.html",status:"已核验"},
  KR:{date:"2025-07-03",source:"Almonty 技术报告更新",url:"https://almonty.com/wp-content/uploads/2025/07/AII_NR250703_2.pdf",status:"已核验"},
  BR:{date:"2026-02-05",source:"Serra Verde 官方公告",url:"https://www.serraverde.com/2026/02/serra-verde-secures-us565-million-financing-from-us-international-development-finance-corporation/",status:"已核验"},
  MY:{date:"2026-03-02",source:"马来西亚许可续期报道",url:"https://apnews.com/article/a9e3f931987ca2011133fee15f666fac",status:"已核验"},
  IN:{date:"2025-03-24",source:"印度政府新闻局",url:"https://mines.gov.in/admin/storage/ckeditor/Press_Release_Press_Information_Bureau_1751013391.pdf",status:"已核验"},
  MW:{date:"2025-12-01",source:"世界银行马拉维国别报告",url:"https://documents1.worldbank.org/curated/en/099120725140521030/pdf/P501730-eb5acf1a-8ebe-45d8-847c-7c2bd17a2e52.pdf",status:"已核验"},
  AO:{date:"2026-06-08",source:"Pensana 官方运营更新",url:"https://pensana.co.uk/operational-update-8th-june-2026/",status:"已核验"},
  ZA:{date:"2026-07-01",source:"伦敦证券交易所公司公告",url:"https://www.londonstockexchange.com/news-article/ECOR/update-on-the-phalaborwa-rare-earths-project-dfs/17667420",status:"已核验"}
};

const alternativeMineralReadiness = [
  {name:"稀土",source:"中",processing:"低",technology:"低",horizon:"5年以上",note:"矿端多点出现，但分离、金属化、磁体良率和客户认证仍是核心瓶颈。"},
  {name:"钨",source:"中",processing:"低",technology:"低",horizon:"2—5年",note:"矿山重启可补充精矿，APT、碳化钨和高规格粉末仍难快速替代。"},
  {name:"镓 / 锗",source:"低",processing:"低",technology:"低",horizon:"5年以上",note:"副产属性制约扩产，高纯精制和半导体、光学材料认证门槛高。"},
  {name:"石墨",source:"中",processing:"中低",technology:"中低",horizon:"2—5年",note:"天然矿端多元化快于球化、提纯、包覆和负极材料认证。"},
  {name:"锑",source:"中低",processing:"低",technology:"中低",horizon:"2—5年",note:"矿山、冶炼环保和军民需求叠加，部分用途可替代但难覆盖全部场景。"}
];

const alternativeTimeHorizons = [
  {range:"0—2年",title:"快速缓冲",items:["战略库存","许可协调","双源认证","生产废料回收"],tone:"green"},
  {range:"2—5年",title:"增加可切换供给",items:["回收扩产","材料减量","盟友分离与精炼爬坡"],tone:"cyan"},
  {range:"5年以上",title:"结构性降低依赖",items:["新矿山","全新材料体系","产品重新设计"],tone:"violet"}
];

const modules = {
  overview:{title:"情报总览",icon:"⌂",desc:"汇总关键矿产政策变化、供应风险与重点预警。",items:["风险仪表盘","最新动态","重点预警"]},
  "intelligence-analysis":{title:"开源信息情报",icon:"◈",desc:"围绕关键矿产汇集公开情报、执法查发案例与AI风险研判。",items:["情报快照","执法查发案例","走私违规分析"]},
  minerals:{title:"关键矿产态势",icon:"◇",desc:"逐项跟踪关键矿产出口量变化与海外市场参考价格。",items:["出口态势","海外价格","市场信号"]},
  countries:{title:"文件库",icon:"◎",desc:"集中归集关键矿产政策文件、执法资料与研究材料。",items:["政策文件","执法资料","研究材料"]},
  timeline:{title:"政策时间轴",icon:"⌁",desc:"把公告、调整、暂停与生效节点放在统一时间轴中追踪。",items:["时间筛选","事件关联","状态变更"]},
  "smart-qa":{title:"智能问答",icon:"◉",desc:"基于文件库、政策、态势和案例进行带来源依据的问答。",items:["来源选择","引用回答","追问分析"]},
  "relationship-graph":{title:"关系图谱分析",icon:"⌘",desc:"连接矿产、企业、国家、政策、商品、人员和案件关系。",items:["实体检索","路径发现","关系研判"]},
  "supply-chain-path":{title:"供应链路径分析",icon:"⇢",desc:"追踪矿山、加工、出口、港口、运输和境外买方链路。",items:["节点地图","物流路径","风险预警"]},
  "ai-analysis":{title:"AI智能分析",icon:"✣",desc:"通过自然语言调用数据、规则和模型完成多维分析。",items:["数据问答","异常识别","可视化分析"]},
  "ai-deep-research":{title:"AI深度研究",icon:"◐",desc:"通过多轮检索、来源核验和持续推理形成可追溯的专题研究成果。",items:["研究规划","深度检索","交叉核验"]},
  "ai-report":{title:"AI战略报告",icon:"▧",desc:"把研究过程、证据和图表编排为可审核的正式报告。",items:["模板选择","证据编排","审核导出"]},
  settings:{title:"系统设置",icon:"⚙",desc:"管理数据口径、模块权限、通知规则与界面偏好。",items:["数据口径","通知规则","权限配置"]}
};

const researchToolPages = {
  "smart-qa":{
    kicker:"SOURCE-GROUNDED Q&A",badge:"参考 NotebookLM · Perplexity",
    summary:"面向业务人员的快速入口。回答必须限定数据范围、展示逐条引用，并允许沿同一证据继续追问。",
    sections:[
      {title:"问答入口",tag:"ASK",items:["输入自然语言问题","选择矿产、时间和国家","常用问题模板","保存问答专题"]},
      {title:"来源范围",tag:"SOURCES",items:["文件库资料","政策公告与税号清单","出口量与价格数据","开源情报和执法案例","仅内部 / 仅互联网 / 混合来源"]},
      {title:"答案呈现",tag:"ANSWER",items:["结论摘要与置信度","引用来源和原文定位","数据表、趋势图与对比卡","事实、推断和待核实项分开展示"]},
      {title:"核验控制",tag:"VERIFY",items:["来源勾选与排除","引用点击回到原文","冲突来源并列提示","无依据时拒绝下结论"]}
    ],
    flow:["提出问题","限定来源","检索与引用","生成回答","追问或存档"],
    outputs:["带引用回答","分析笔记","问答记录","一键转深度研究"]
  },
  "relationship-graph":{
    kicker:"ENTITY & LINK ANALYSIS",badge:"参考 Neo4j Bloom · Maltego",
    summary:"以关系调查为核心，既能从一个实体向外扩展，也能查找企业、矿产、国家和政策之间的最短路径与异常关联。",
    sections:[
      {title:"实体体系",tag:"ENTITY",items:["矿产、产品和税号","境内外企业与实际控制人","国家、地区、港口和机构","政策、公告、许可证和案件","人员、船舶、集装箱和提运单"]},
      {title:"关系类型",tag:"LINKS",items:["生产、加工、采购和销售","投资、控股、任职和关联","出口、进口、运输和转口","受政策约束、涉案和被处罚","同地址、同电话、同收发货人"]},
      {title:"图谱工具",tag:"EXPLORE",items:["自然语言搜索实体","一至三层关系扩展","最短路径与共同关联","时间切片和关系强度","聚类、中心性和关键节点"]},
      {title:"证据侧栏",tag:"EVIDENCE",items:["节点属性和风险标签","每条关系的来源文件","原文片段与采集时间","人工确认、修正和备注"]}
    ],
    flow:["检索实体","选择观察视角","扩展关系","识别关键节点","保存图谱场景"],
    outputs:["关系网络图","关键实体清单","关联路径说明","风险关系证据包"]
  },
  "supply-chain-path":{
    kicker:"SUPPLY CHAIN & ROUTE",badge:"参考 Interos · project44",
    summary:"把产业链关系和实际物流路线放在同一视图，突出多层供应商、地域集中、转口路径和运输异常。",
    sections:[
      {title:"产业链节点",tag:"NODES",items:["矿山与原料产地","冶炼、加工和制造企业","出口商、货代和报关企业","港口、航线和运输工具","境外进口商、仓库和最终用户"]},
      {title:"路径视图",tag:"ROUTE",items:["矿山到最终用户全链路","海运、空运、铁路和陆路切换","启运港、中转港和目的港","正常路线与异常绕行对比","批次、时效和预计到达时间"]},
      {title:"风险图层",tag:"RISK",items:["单一国家和供应商集中度","受限企业、制裁和管制清单","高风险转口国家与港口","品名、税号、重量和价格异常","延误、滞港和路线突变"]},
      {title:"监测动作",tag:"WATCH",items:["重点节点关注清单","路径异常实时提醒","事件影响范围计算","替代供应商和替代路线建议"]}
    ],
    flow:["选择矿产产品","生成供应链","叠加物流路线","识别暴露点","形成处置建议"],
    outputs:["供应链地图","物流路径图","风险节点清单","中断影响分析"]
  },
  "ai-analysis":{
    kicker:"AI ANALYST WORKSPACE",badge:"参考 Palantir AIP Analyst",
    summary:"让模型以自然语言调用文件、表格、图谱和地理数据，并保留每一步数据变换和分析依据。",
    sections:[
      {title:"分析场景",tag:"SCENARIO",items:["出口趋势与价格联动","政策实施前后影响","国别依赖与供应集中度","企业风险和关联网络","走私违规模式与案例匹配"]},
      {title:"分析工具",tag:"TOOLS",items:["筛选、聚合和同比环比","时间序列与异常检测","企业和国家横向对比","图谱关系与路径算法","地理分布和路线分析"]},
      {title:"分析画布",tag:"CANVAS",items:["自然语言提出分析任务","添加文件、数据集和图谱上下文","生成表格、图表、地图和流程图","分支探索不同假设"]},
      {title:"过程溯源",tag:"TRACE",items:["显示每一步使用的数据","记录筛选和计算口径","区分模型生成与原始事实","保存分析分支和复现参数"]}
    ],
    flow:["选择分析场景","加载上下文","执行分析工具","核验证据链","沉淀分析结论"],
    outputs:["分析结论卡","可交互图表","异常与风险清单","可复现分析记录"]
  },
  "ai-deep-research":{
    kicker:"AGENTIC DEEP RESEARCH",badge:"多轮检索 · 证据驱动",
    summary:"面向复杂战略议题，由AI自主拆解问题、执行多轮开源检索与文件库分析，交叉核验关键事实并形成带来源、可复核的深度研究成果。",
    sections:[
      {title:"研究任务",tag:"BRIEF",items:["明确决策问题与研究边界","设定矿产、国家、企业和时间范围","选择海关要情、课题研究或综合信息呈报场景"]},
      {title:"多源检索",tag:"SEARCH",items:["优先检索政府、海关、法院和企业原始来源","联动文件库、开源情报和授权贸易数据","自动扩展关键词、外文名称和关联实体"]},
      {title:"交叉研判",tag:"ANALYZE",items:["事实、推断和待核实项分层","时间适用与法律性质校验","企业、商品、税号和物流链路关联","冲突来源并列与置信度评估"]},
      {title:"成果沉淀",tag:"DELIVER",items:["生成带脚注的专题研究报告","形成证据清单、风险矩阵和关系图谱","人工审核后转入AI战略报告并归档"]}
    ],
    flow:["定义研究问题","AI生成研究计划","多轮检索与阅读","交叉核验与研判","提交可审核成果"],
    outputs:["深度研究报告","来源与证据清单","风险及待核查事项","转入AI战略报告"]
  },
  "ai-report":{
    kicker:"AI REPORT STUDIO",badge:"参考 Deep Research · NotebookLM",
    summary:"依托AI对多源情报、政策数据与研究成果进行综合研判，自动生成海关要情、课题研究报告、综合信息呈报等专业成果，经人工复核审定后统一归档，形成可追溯、可复用的智能研究闭环。",
    sections:[
      {title:"报告模板",tag:"TEMPLATE",items:["每日情报简报","单一矿产专题报告","国别政策与市场报告","企业关联调查报告","供应链风险报告","执法案例分析报告"]},
      {title:"智能编排",tag:"COMPOSE",items:["AI生成目录和章节","自动插入结论、表格和图表","引用编号与来源清单","摘要、风险提示和建议","附录与数据口径说明"]},
      {title:"审核协作",tag:"REVIEW",items:["事实引用逐条核验","敏感表述和置信度提示","章节改写与版本对比","审核意见和批准状态"]},
      {title:"发布归档",tag:"EXPORT",items:["导出 Word、PDF 和 Markdown","生成汇报摘要和演示提纲","正式版锁定与版本号","自动保存到文件库","关联原研究任务和证据"]}
    ],
    flow:["选择模板","导入研究成果","AI编排初稿","人工审核定稿","导出并归档"],
    outputs:["正式报告","一页摘要","来源与证据附录","历史版本"]
  }
};

const aiReportDocuments = [
  {
    type:"海关要情",
    code:"CUSTOMS INTELLIGENCE",
    title:"多国加速构建关键矿产“反管制”体系 出口管制监管面临新形势",
    format:"Word",
    size:"263 KB",
    date:"2026-06-28",
    href:"./reports/customs-intelligence-critical-minerals-counter-control.docx"
  },
  {
    type:"课题研究报告",
    code:"RESEARCH REPORT",
    title:"新形势下出口管制博弈中的海关监管难点与应对路径研究",
    format:"Word",
    size:"55 KB",
    date:"2026-06-26",
    href:"./reports/research-customs-supervision-export-control.docx"
  }
];

const aiReportReports = [
  {
    id:"report-customs-intel",
    name:"多国加速构建关键矿产反管制体系 出口管制监管面临新形势",
    fileName:"customs-intelligence-critical-minerals-counter-control.docx",
    path:"./reports/customs-intelligence-critical-minerals-counter-control.docx",
    type:"document",
    date:"2026-06-28",
    size:"263 KB",
    summary:"围绕全球主要经济体加速构建关键矿产反管制体系的趋势，系统分析出口管制监管面临的新形势、挑战与应对路径。",
    authors:"海关研究团队",
    tags:["海关要情","反管制","海关监管","形势分析"],
    findings:[
      {num:"01",title:"反管制体系加速形成",desc:"美国、欧盟、日本等主要经济体通过行政命令、政策融资、战略储备和外交联盟加速构建反管制能力。"},
      {num:"02",title:"海关监管面临四重挑战",desc:"物项识别复杂度上升、转口风险增加、技术非货物化传输和合规成本提高构成主要监管难点。"}
    ]
  },
  {
    id:"report-research",
    name:"新形势下出口管制博弈中的海关监管难点与应对路径研究",
    fileName:"research-customs-supervision-export-control.docx",
    path:"./reports/research-customs-supervision-export-control.docx",
    type:"document",
    date:"2026-06-26",
    size:"55 KB",
    summary:"深入分析新形势下出口管制博弈中海关监管面临的技术性、制度性和操作性难点，提出系统化的应对路径建议。",
    authors:"政策研究组",
    tags:["课题研究报告","出口管制","应对路径","政策研究"],
    findings:[
      {num:"01",title:"博弈格局向多极化演变",desc:"出口管制博弈从双边对抗转向多边规则竞争与技术联盟构建，监管复杂性显著提升。"},
      {num:"02",title:"应对路径需多维度协同",desc:"建议从法律完善、技术升级、国际合作和人才培养四个维度构建系统性应对方案。"}
    ]
  }
];
var selectedAiReportId = "report-customs-intel";

const root = document.getElementById("pageRoot");
const dialog = document.getElementById("detailDialog");
const commandMask = document.getElementById("commandMask");
const commandInput = document.getElementById("commandInput");
let state = {status:"all",year:"all",query:""};
let marketState = {query:"",type:"all"};
let marketSituationState = {view:"alternatives"};
let announcementState = {query:"",status:"all",notice:"all"};
let intelligenceState = {mineral:"tungsten"};
let aiAnalysisState = {mineral:"tungsten"};
let libraryState = {query:"",source:"all",type:"all",view:"grid",page:1,pageSize:10};
let importedLibraryFiles = [];
const deepResearchReports = [
  {
    id:"generated-ai-deep-research-2026",
    name:"全球关键矿产《管制—反管制》体系与海关监管应对",
   fileName:"AI深度研究_全球关键矿产管制反制与海关监管应对_独立研究版.docx",
    path:"./reports/ai-deep-research-counter-controls-2026.docx",
    type:"document",
    category:"战略研究报告",
    date:"2026-07-05",
    size:"56 KB",
    summary:"独立生成的AI Agent深度研究专题报告，约9万字，包含26种矿产画像、8个国别及区域比较、10类海关监管风险和2026—2030情景推演；12个核心原始来源均已嵌入脚注。",
    authors:"AI Agent",
    featured:true,
    tags:["管制反制","海关监管","独立研究"],
    pages:89,
    words:"约9万字",
    sections:["管制政策结构分析","境外政策路径","供应链瓶颈","企业贸易网络","走私违规风险","情景推演","系统建设建议"],
    findings:[
      {num:"01",title:"管控体系已结构化",desc:"中国已形成覆盖镓、锗、石墨、稀土、锑、钨、超硬材料等11组物项的出口管制矩阵，管制手段从单一许可扩展至技术参数、最终用户和原产地规则的多维联动。"},
      {num:"02",title:"境外形成四类反制路径",desc:"美国侧重国防动员与价格工具，欧盟依托CRMA战略项目，日本以政策金融与长期承购为核心，资源国重构矿权条件。四类路径共同吸收供应冲击。"},
      {num:"03",title:"供应链瓶颈在中游",desc:"矿山产能不等于可销售产能。分离、纯化、磁材制备和下游认证构成六个真实瓶颈，替代链条的实际运转取决于中游连续产能。"},
      {num:"04",title:"2025—2030是脆弱窗口",desc:"替代项目增加但成本、良率、认证周期制约同步放量。政策冲击与产能建设存在时间错配，集中暴露十条走私违规风险。"},
      {num:"05",title:"监管需六维联动",desc:"海关研判应从单票单税号转向企业、物项、许可证、最终用户、物流和资金六维联动，形成穿透式核查能力。"},
      {num:"06",title:"情景推演覆盖四种路径",desc:"基准、缓和、升级和技术突破四种情景对应不同的监管准备需求。情景不是预测，而是检验外部冲击弹性的工具。"}
    ],
    metrics:[
      {label:"政策工具画像",value:"11组",desc:"管制物项矩阵"},
      {label:"境外政策路径",value:"8类",desc:"四大经济体分析"},
      {label:"供应链瓶颈",value:"6个",desc:"中游连续产能"},
      {label:"走私违规风险",value:"10类",desc:"海关核查模型"},
      {label:"未来情景",value:"4种",desc:"2026—2030"}
    ]
  },
  {
    id:"professional-review",
    name:"全球关键矿产反管制体系与供应链重构",
    fileName:"AI深度研究_全球关键矿产反管制体系与供应链重构_专业审阅稿.docx",
    path:"./reports/AI深度研究_全球关键矿产反管制体系与供应链重构_专业审阅稿.docx",
    type:"document",
    category:"战略研究报告",
    date:"2026-07-05",
    size:"347 KB",
    summary:"在独立研究成果基础上，经专家审阅形成的专业审阅稿。重点深化反管制体系比较、供应链重构路径与海关应对策略，补充了最新政策动态与案例数据。",
    authors:"AI Agent · 专家审阅",
    featured:false,
    tags:["反管制体系","供应链重构","专家审阅"],
    pages:"—",
    words:"约12万字",
    sections:["反管制体系框架","供应链重构路径","国别比较分析","海关应对策略","政策动态追踪","案例数据补充"],
    findings:[
      {num:"01",title:"反管制体系已形成框架",desc:"美国、欧盟、日本和资源国分别建立差异化的反管制体系，包括行政命令、政策融资、战略储备和联盟合作四大工具集群。"},
      {num:"02",title:"供应链重构进入实操阶段",desc:"境外中游项目从宣布转向融资和开工，但分离、纯化和磁材产能瓶颈仍需三至五年才能实质性缓解。"},
      {num:"03",title:"专家审阅深化了关键假设",desc:"对原报告的供需错配窗口、企业替代弹性、境外项目落地概率等核心假设进行了压力测试和置信度评级。"},
      {num:"04",title:"海关应对策略需分层",desc:"从风险识别、核查优先级、法律适用和跨部门协同四个维度提出分层应对策略。"},
      {num:"05",title:"补充78条最新政策动态",desc:"覆盖2025下半年至2026上半年的政策与项目更新，确保分析时效性。"}
    ],
    metrics:[
      {label:"反管制体系",value:"4类",desc:"美欧日资源国"},
      {label:"政策动态补充",value:"78条",desc:"2025H2—2026H1"},
      {label:"关键假设检验",value:"12项",desc:"含置信度评级"},
      {label:"应对策略维度",value:"4层",desc:"识别到协同"}
    ]
  },
  {
    id:"strategy-game-pdf",
    name:"出口管制反制-关键矿产战略博弈-供应链韧性与海关风险防控研究",
    fileName:"出口管制反制-关键矿产战略博弈-供应链韧性与海关风险防控研究.pdf",
    path:"./reports/出口管制反制-关键矿产战略博弈-供应链韧性与海关风险防控研究.pdf",
    type:"pdf",
    category:"战略研究报告",
    date:"2026-07-05",
    size:"2.4 MB",
    summary:"从战略博弈视角分析关键矿产出口管制反制措施，评估供应链韧性水平，提出海关风险防控的体系化建议。涵盖多国政策比较、企业合规框架与风险预警机制。",
    authors:"研究团队",
    featured:false,
    tags:["出口管制","战略博弈","供应链韧性"],
    pages:120,
    words:"约6万字",
    sections:["战略博弈分析","供应链韧性评估","海关风险防控","多国政策比较","企业合规框架","风险预警机制"],
    findings:[
      {num:"01",title:"战略博弈呈现多极化",desc:"各方在矿产资源、加工技术、市场准入和标准制定四个战场展开博弈，形成管制—反管制—再管制的动态循环。"},
      {num:"02",title:"供应链韧性存在关键缺口",desc:"高纯材料、磁体制造和回收技术构成韧性短板，单一来源依赖和政策冲击传播是核心脆弱点。"},
      {num:"03",title:"风险防控需构建预警机制",desc:"从企业画像、物流追踪、价格异动和许可证核验四个维度建立多层级海关风险预警信号体系。"},
      {num:"04",title:"合规框架应采取分级管控",desc:"区分物项管制、最终用途审查和关联交易核查三个层级，建立差异化的企业合规管理框架。"},
      {num:"05",title:"多国政策趋同但路径分化",desc:"主要经济体在关键矿产供应链安全目标上趋同，但在政策工具、时间表和资源投入路径上明显分化。"}
    ],
    metrics:[
      {label:"博弈战场",value:"4个",desc:"资源·技术·市场·标准"},
      {label:"韧性缺口",value:"3处",desc:"高纯·磁体·回收"},
      {label:"预警维度",value:"4层",desc:"企业·物流·价格·许可"},
      {label:"管控层级",value:"3级",desc:"物项·用途·交易"}
    ]
  }
];
let deepReportFilter = "all";
let selectedReportId = "generated-ai-deep-research-2026";
function escapeT(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
const intelligenceMinerals = [
  {id:"tungsten",name:"钨矿",symbol:"W",ready:true},
  {id:"gallium",name:"镓",symbol:"Ga",ready:false},
  {id:"germanium",name:"锗",symbol:"Ge",ready:false},
  {id:"graphite",name:"石墨",symbol:"C",ready:false},
  {id:"antimony",name:"锑",symbol:"Sb",ready:false},
  {id:"diamond",name:"金刚石",symbol:"C◆",ready:false},
  {id:"tellurium",name:"碲",symbol:"Te",ready:false},
  {id:"bismuth",name:"铋",symbol:"Bi",ready:false},
  {id:"molybdenum",name:"钼",symbol:"Mo",ready:false},
  {id:"indium",name:"铟",symbol:"In",ready:false},
  {id:"samarium",name:"钐",symbol:"Sm",ready:false},
  {id:"gadolinium",name:"钆",symbol:"Gd",ready:false},
  {id:"terbium",name:"铽",symbol:"Tb",ready:false},
  {id:"dysprosium",name:"镝",symbol:"Dy",ready:false},
  {id:"lutetium",name:"镥",symbol:"Lu",ready:false},
  {id:"scandium",name:"钪",symbol:"Sc",ready:false},
  {id:"yttrium",name:"钇",symbol:"Y",ready:false},
  {id:"holmium",name:"钬",symbol:"Ho",ready:false},
  {id:"erbium",name:"铒",symbol:"Er",ready:false},
  {id:"thulium",name:"铥",symbol:"Tm",ready:false},
  {id:"europium",name:"铕",symbol:"Eu",ready:false},
  {id:"ytterbium",name:"镱",symbol:"Yb",ready:false},
  {id:"lithium",name:"锂",symbol:"Li",ready:false},
  {id:"nickel",name:"镍",symbol:"Ni",ready:false},
  {id:"cobalt",name:"钴",symbol:"Co",ready:false},
  {id:"manganese",name:"锰",symbol:"Mn",ready:false}
];
const tungstenOpenIntel = [
  {
    date:"2026-05",region:"中国",type:"执法警示",
    title:"官方发布钨粉违法出口合规案例",
    summary:"中国出口管制信息网披露：钨粉属于两用物项，出口须取得许可；相关案例涉及夹带、伪报品名及商品编号等违法情形。",
    sourceName:"中国出口管制信息网",
    url:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1291.html"
  },
  {
    date:"2025-05",region:"中国",type:"专项行动",
    title:"多部门部署打击战略矿产走私出口",
    summary:"商务、公安、国家安全、海关、邮政等部门加强协作，重点关注伪报瞒报、夹藏以及第三国转口等规避出口管制风险。",
    sourceName:"中国出口管制信息网",
    url:"https://exportcontrol.mofcom.gov.cn/article/gndt/202505/1137.html"
  },
  {
    date:"2025-03",region:"中国",type:"政策问答",
    title:"钨相关物项识别口径进一步明确",
    summary:"官方问答明确仲钨酸铵、氧化钨、碳化钨的简单混合物及未烧结金属碳化钨等识别口径，并提供出口业务咨询渠道。",
    sourceName:"中国出口管制信息网",
    url:"https://exportcontrol.mofcom.gov.cn/article/cjwt/202503/1112.html"
  },
  {
    date:"2025-02",region:"中国",type:"管制政策",
    title:"钨相关材料、合金及技术纳入出口管制",
    summary:"商务部、海关总署公告2025年第10号列明仲钨酸铵、氧化钨、碳化钨、特定固态钨及合金等管制物项和参考税号。",
    sourceName:"商务部",
    url:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_084ded0609404b2d81c746b31c9a03a6.html"
  }
];
const tungstenCases = [
  {
    country:"中国",agency:"义乌海关",date:"2025-02",collectedAt:"2026-07-02",mineral:"钨粉",direction:"中国境内 → 目的地未披露",
    title:"无纺布包装袋货物中查获未申报钨粉20千克",
    finding:"实际出口人未申报、未领证，将钨粉夹带在市场采购贸易货物中出口；海关依法作出行政处罚。",
    status:"已处罚",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1291.html"
  },
  {
    country:"中国",agency:"长沙黄花机场海关、威海海关",date:"2021—2025",collectedAt:"2026-07-02",mineral:"钨、铋、钴等金属粉末",direction:"中国 → 美国、印度、马来西亚等",
    title:"金属粉末被伪报为其他品名并通过快件出口",
    finding:"官方合规案例梳理显示，相关公司未取得许可证，存在伪报品名及商品编号等违法行为，关联货代已被刑事立案。",
    status:"行政处罚 / 刑事立案",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1291.html"
  },
  {
    country:"中国",agency:"广东省高级人民法院",date:"2009—2023",collectedAt:"2026-07-02",mineral:"钇、氧化钪等稀土",direction:"中国 → 境外",
    title:"稀土产品长期伪报为“金属靶材样品”出口",
    finding:"该关联战略矿产案例经二审维持原判，企业及负责人因无证出口、伪报品名和低报价格被判处罚金及有期徒刑。",
    status:"刑事判决",source:"https://swt.fujian.gov.cn/xxgk/jgzn/jgcs/myycyaqc/gzdt_475/202512/t20251223_7049515.htm"
  },
  {
    country:"美国",agency:"美国司法部、HSI、DCIS",date:"2022-06",collectedAt:"2026-07-02",mineral:"钨重粉相关受控技术",direction:"美国 → 中国、印度等",
    title:"钨重粉企业前负责人承认非法输出受控技术",
    finding:"该案方向与中国战略矿产外流相反，作为境外出口管制执法参照：涉案人员在未获许可情况下向境外提供受ITAR管制的技术资料。",
    status:"认罪",source:"https://www.justice.gov/usao-sdca/pr/former-tungsten-heavy-powder-parts-ceo-pleads-guilty-conspiring-export-united-states"
  }
];
const tungstenRiskSignals = [
  {level:"高",title:"申报品名或税号与实物特征不一致",analysis:"合同、发票、检测报告与报关品名之间出现明显差异，或管制属性判定材料缺失。",check:"核验成分、粒度、形态、用途、税号及许可证的一致性。"},
  {level:"高",title:"普通货物中出现高密度金属粉末或异常夹带",analysis:"包装物、样品或普通低值货物与扫描、称重、材质检测结果不匹配。",check:"结合机检图像、重量偏差、取样检测和装箱记录开展复核。"},
  {level:"高",title:"韩国采购放量与对日再出口同步",analysis:"对韩碳化钨或钨粉出口短期高增，且韩国本土产能、库存消化和对日出口数据无法解释全部增量。",check:"比对中国出口、韩国进口、韩国对日出口、日本进口和买方产能，核验最终用户及再出口承诺。"},
  {level:"中高",title:"短期多批次、小批量或简易渠道集中出口",analysis:"同一主体、收货人或关联货代通过快件、市场采购等渠道连续拆分出货。",check:"穿透关联企业、地址、电话、付款人与物流轨迹，按时间窗口聚合研判。"},
  {level:"中高",title:"第三国中转与最终用户信息不匹配",analysis:"合同目的国、物流中转地、付款来源和最终用途说明存在矛盾或频繁变化。",check:"核验最终用户、最终用途、转运路径及第三方付款的合理性。"},
  {level:"中",title:"技术资料或远程访问替代实物交付",analysis:"受控工艺、参数、图纸可能通过邮件、云盘、远程账号等非货物渠道向境外传输。",check:"审查数据分级、境外访问日志、技术服务合同和许可范围。"}
];
const FONT_SCALE_KEY = "mineral-control-atlas-font-scale";
let fontScale = Math.min(1.3, Math.max(.9, Number(localStorage.getItem(FONT_SCALE_KEY)) || 1));

function applyFontScale(value,persist=true){
  fontScale=Math.min(1.3,Math.max(.9,Number(value)||1));
  document.documentElement.style.setProperty("--font-scale",fontScale);
  if(persist)localStorage.setItem(FONT_SCALE_KEY,String(fontScale));
}

applyFontScale(fontScale,false);

function routeName(){
  const value = location.hash.replace("#/","") || "export-controls";
  return value === "export-controls" || modules[value] ? value : "export-controls";
}

function setActiveNav(route){
  document.querySelectorAll("[data-route]").forEach(link=>link.classList.toggle("active",link.dataset.route===route));
  document.getElementById("breadcrumb").textContent = `关键矿产情报采集分析系统 / ${route==="export-controls"?"关键矿产清单":modules[route].title}`;
}


// === Smart Q&A ===
const smartQaState={messages:[],sources:{policy:true,intelligence:true,market:true,library:true,announcement:true}};
const smartQaQuickQuestions=[
  {q:"当前有哪些出口管制政策？",desc:"查看现行管制政策"},
  {q:"镓和锗的管制范围与要求",desc:"稀散金属管制"},
  {q:"美国关键矿产政策动向",desc:"国别态势"},
  {q:"近期管制政策有哪些变化？",desc:"政策动态"},
  {q:"锑的出口态势与价格",desc:"市场与出口"}
];
function renderSmartQaPage(){
  var msgs=smartQaState.messages;
  var chatHtml=msgs.length===0?'<div class="qa-empty-state"><span>⚡</span><p>选择数据源、输入问题或点击快捷问法开始</p></div>':msgs.map(function(m){return m.role==="user"?('<div class="qa-message qa-user"><div class="qa-avatar">U</div><div class="qa-bubble">'+m.text+'</div></div>'):('<div class="qa-message qa-assistant"><div class="qa-avatar">AI</div><div class="qa-bubble">'+m.text+'</div>'+(m.sources&&m.sources.length?'<div class="qa-sources">'+m.sources.map(function(s){return'<a href="'+escapeT(s.url)+'" target="_blank" rel="noreferrer">'+escapeT(s.label)+'</a>';}).join("")+'</div>':"")+'</div>');}).join("");
  root.innerHTML='<div class="page smart-qa-page">'+
    '<header class="page-heading"><div>'+
      '<p class="page-kicker">SOURCE-GROUNDED Q&amp;A</p>'+
      '<h1>智能问答</h1>'+
      '<p>基于文件库、政策、情报快照、市场数据和公告税号进行带来源依据的问答。</p>'+
    '</div></header>'+
    '<section class="qa-sources-bar">'+
      '<span>数据源：</span>'+
      '<button class="qa-source-chip '+(smartQaState.sources.policy?'active':'')+'" data-qa-source="policy">📋 政策管制</button>'+
      '<button class="qa-source-chip '+(smartQaState.sources.intelligence?'active':'')+'" data-qa-source="intelligence">🔍 情报快照</button>'+
      '<button class="qa-source-chip '+(smartQaState.sources.market?'active':'')+'" data-qa-source="market">📊 市场数据</button>'+
      '<button class="qa-source-chip '+(smartQaState.sources.library?'active':'')+'" data-qa-source="library">📁 文件库</button>'+
      '<button class="qa-source-chip '+(smartQaState.sources.announcement?'active':'')+'" data-qa-source="announcement">🏷️ 公告税号</button>'+
    '</section>'+
    '<section class="qa-quick-questions">'+
      smartQaQuickQuestions.map(function(q){return'<button class="qa-quick-btn" data-qa-quick="'+escapeT(q.q)+'"><span>'+escapeT(q.q)+'</span><small>'+escapeT(q.desc)+'</small></button>';}).join("")+
    '</section>'+
    '<section class="qa-chat-area" id="qaChatArea">'+chatHtml+'</section>'+
    '<div class="qa-input-bar">'+
      '<input id="qaInput" type="text" placeholder="输入关于关键矿产管制、政策或市场的问题..." />'+
      '<button id="qaSendBtn" type="button">发送</button>'+
    '</div></div>';
  document.getElementById("qaSendBtn").addEventListener("click",function(){var q=document.getElementById("qaInput").value.trim();if(!q)return;document.getElementById("qaInput").value="";handleSmartQaQuestion(q);});
  document.getElementById("qaInput").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();document.getElementById("qaSendBtn").click();}});
  document.querySelectorAll(".qa-source-chip").forEach(function(btn){btn.addEventListener("click",function(){var k=this.dataset.qaSource;smartQaState.sources[k]=!smartQaState.sources[k];this.classList.toggle("active");});});
  document.querySelectorAll(".qa-quick-btn").forEach(function(btn){btn.addEventListener("click",function(){handleSmartQaQuestion(this.dataset.qaQuick);});});
  var chatA=document.getElementById("qaChatArea");if(chatA)chatA.scrollTop=chatA.scrollHeight;
}
function handleSmartQaQuestion(q){
  smartQaState.messages.push({role:"user",text:q});
  var results=smartQaSearch(q),answer=smartQaBuildAnswer(q,results);
  smartQaState.messages.push(answer);
  renderSmartQaMessages();
}
function renderSmartQaMessages(){
  var ca=document.getElementById("qaChatArea");
  if(!ca){renderSmartQaPage();return;}
  var msgs=smartQaState.messages;
  ca.innerHTML=msgs.map(function(m){
    if(m.role==="user") return '<div class="qa-message qa-user"><div class="qa-avatar">U</div><div class="qa-bubble">'+m.text+'</div></div>';
    var html='<div class="qa-message qa-assistant"><div class="qa-avatar">AI</div><div class="qa-bubble">'+m.text+'</div>';
    if(m.sources&&m.sources.length) html+='<div class="qa-sources">'+m.sources.map(function(s){return'<a href="'+escapeT(s.url)+'" target="_blank" rel="noreferrer" class="qa-source-link">'+escapeT(s.label)+'</a>';}).join("")+'</div>';
    return html+'</div>';
  }).join("");
  ca.scrollTop=ca.scrollHeight;
}
function smartQaSearch(query){
  var q=query.toLowerCase(),results=[],active=smartQaState.sources;
  var keywords=q.split(/[\s,，。、？?！!；;：:\n]+/).filter(function(k){return k.length>=2;});
  if(keywords.length===0) return results;
  if(active.policy) for(var i=0;i<policies.length;i++){
    var p=policies[i],text=[p.name,p.symbol,p.type,p.scopeShort,p.scope,p.method,p.source,p.policyGroup].join(" ").toLowerCase(),score=0;
    for(var j=0;j<keywords.length;j++){if(text.indexOf(keywords[j])>=0) score++;}
    if(score>0) results.push({score:score,source:"policy",title:p.name+"（"+p.symbol+"）",body:p.scopeShort,detail:p.scope,date:p.date,url:p.url,sourceLabel:p.source});
  }
  if(active.intelligence&&typeof intelligenceSnapshots!=="undefined") for(var i=0;i<intelligenceSnapshots.length;i++){
    var s=intelligenceSnapshots[i],text=[s.titleZh,s.summaryZh].concat(s.factsZh||[]).concat((s.sectionsZh||[]).map(function(x){return x.title+" "+x.body;})).join(" ").toLowerCase(),score=0;
    for(var j=0;j<keywords.length;j++){if(text.indexOf(keywords[j])>=0) score++;}
    if(score>0) results.push({score:score,source:"intelligence",title:s.titleZh,body:s.summaryZh,date:s.sourcePublished,url:s.sourceUrl,sourceLabel:s.sourceName});
  }
  if(active.market) for(var i=0;i<mineralMarketData.length;i++){
    var m=mineralMarketData[i],text=[m.name,m.symbol,m.type,m.product].join(" ").toLowerCase(),score=0;
    for(var j=0;j<keywords.length;j++){if(text.indexOf(keywords[j])>=0) score++;}
    if(score>0) results.push({score:score,source:"market",title:m.name+"（"+m.symbol+"）",body:m.product+" · 价格 "+m.price+" "+m.unit,detail:"出口量指数: "+(m.exports||[]).join(" → ")+" · 价格变动: "+(m.change>0?"+":"")+m.change+"%",date:"",url:"#/minerals",sourceLabel:"市场数据"});
  }
  if(active.library&&typeof importedLibraryIndex!=="undefined") for(var i=0;i<importedLibraryIndex.length;i++){
    var lib=importedLibraryIndex[i],text=[lib.name,lib.typeName,lib.category,lib.mineral,lib.content||""].join(" ").toLowerCase(),score=0;
    for(var j=0;j<keywords.length;j++){if(text.indexOf(keywords[j])>=0) score++;}
    if(score>0) results.push({score:score,source:"library",title:lib.name,body:lib.typeName+(lib.category?" · "+lib.category:""),detail:lib.mineral?"涉及矿产："+lib.mineral:"",date:lib.date,url:lib.downloadUrl||"#/countries",sourceLabel:lib.sourceName});
  }
  if(active.announcement&&typeof announcementDefinitions!=="undefined") for(var i=0;i<announcementDefinitions.length;i++){
    var ann=announcementDefinitions[i],text=[ann.notice].concat((ann.items||[]).reduce(function(a,b){return a.concat(b);},[])).join(" ").toLowerCase(),score=0;
    for(var j=0;j<keywords.length;j++){if(text.indexOf(keywords[j])>=0) score++;}
    if(score>0) results.push({score:score,source:"announcement",title:ann.notice,body:(ann.items?ann.items.length:0)+" 项物项 · "+ann.statusText,detail:(ann.items||[]).slice(0,3).map(function(x){return x[0];}).join("、")+((ann.items||[]).length>3?"…":""),date:ann.date,url:ann.source,sourceLabel:"公告税号"});
  }
  results.sort(function(a,b){return b.score-a.score;});
  return results.slice(0,12);
}
function smartQaBuildAnswer(question,results){
  if(results.length===0) return {role:"assistant",text:'<p>未能在所选数据源中找到与「<strong>'+escapeT(question)+'</strong>」相关的结果。建议尝试：</p><ul style="margin-top:8px;padding-left:20px"><li>调整关键词或使用更简洁的问法</li><li>切换或扩大数据源范围</li><li>查看 <a href="#/export-controls" style="color:var(--green)">关键矿产清单</a> 或 <a href="#/intelligence-analysis" style="color:var(--green)">开源情报</a> 页面</li></ul>',sources:[]};
  var bySource={};
  for(var i=0;i<results.length;i++){var r=results[i];if(!bySource[r.source])bySource[r.source]=[];bySource[r.source].push(r);}
  var sLabels={policy:"政策管制",intelligence:"情报快照",market:"市场数据",library:"文件库",announcement:"公告税号"},sIcons={policy:"📋",intelligence:"🔍",market:"📊",library:"📁",announcement:"🏷️"};
  var sectionsHtml="",sources=[],keys=Object.keys(bySource);
  for(var si=0;si<keys.length;si++){
    var key=keys[si],items=bySource[key],label=sLabels[key]||key,icon=sIcons[key]||"📄";
    sectionsHtml+='<div class="qa-result-group"><h4>'+icon+' '+label+'（'+items.length+' 条）</h4>';
    for(var ii=0;ii<Math.min(items.length,4);ii++){
      var item=items[ii],dLines=[];
      if(item.detail) dLines.push(item.detail);
      if(item.date) dLines.push("发布日期："+item.date);
      sectionsHtml+='<div class="qa-result-item"><a href="'+escapeT(item.url)+'" target="_blank" rel="noreferrer" class="qa-result-title">'+escapeT(item.title)+'</a><p>'+escapeT(item.body)+'</p>'+(dLines.length?'<small>'+dLines.join(" · ")+'</small>':"")+'<span class="qa-result-badge">'+escapeT(item.sourceLabel||label)+'</span></div>';
      sources.push({label:item.title,url:item.url});
    }
    sectionsHtml+="</div>";
  }
  return {role:"assistant",text:'<div class="qa-answer"><p class="qa-answer-summary">根据所选数据源，找到 <strong>'+results.length+'</strong> 条相关内容：</p>'+sectionsHtml+'</div>',sources:sources};
}

const moduleVisualShapes={
  "export-controls":`
    <path class="mv-soft" d="M24 73h128M24 50h128M24 27h128"/>
    <path class="mv-primary mv-draw" d="M30 72L55 58L80 61L105 39L130 45L154 20"/>
    <path class="mv-secondary" d="M42 72V62M69 72V49M96 72V55M123 72V32M150 72V43"/>
    <circle class="mv-node mv-pulse" cx="154" cy="20" r="5"/>`,
  minerals:`
    <path class="mv-soft" d="M20 75L54 38L76 57L108 24L155 75Z"/>
    <path class="mv-primary mv-draw" d="M20 75L54 38L76 57L108 24L155 75"/>
    <path class="mv-secondary" d="M28 79C55 68 73 72 96 59S132 45 160 36"/>
    <circle class="mv-node mv-pulse" cx="160" cy="36" r="5"/>`,
  "intelligence-analysis":`
    <circle class="mv-soft" cx="92" cy="50" r="37"/><circle class="mv-soft" cx="92" cy="50" r="24"/>
    <path class="mv-primary mv-sweep" d="M92 50L126 33A37 37 0 0 1 121 73Z"/>
    <circle class="mv-node mv-pulse" cx="67" cy="62" r="5"/><circle class="mv-node" cx="111" cy="34" r="4"/>
    <path class="mv-secondary" d="M118 72l29 20"/>`,
  countries:`
    <rect class="mv-soft" x="35" y="18" width="82" height="62" rx="7"/>
    <rect class="mv-primary" x="48" y="10" width="82" height="62" rx="7"/>
    <path class="mv-secondary mv-draw" d="M62 28h52M62 40h43M62 52h47"/>
    <path class="mv-primary" d="M105 64l18 18 28-35"/>`,
  timeline:`
    <path class="mv-soft" d="M20 50h150"/>
    <path class="mv-primary mv-draw" d="M24 50h142"/>
    <circle class="mv-node" cx="43" cy="50" r="7"/><circle class="mv-node mv-pulse" cx="85" cy="50" r="7"/><circle class="mv-node" cx="127" cy="50" r="7"/><circle class="mv-node" cx="166" cy="50" r="7"/>
    <path class="mv-secondary" d="M43 43V25M85 57v18M127 43V25M166 57v18"/>`,
  "smart-qa":`
    <path class="mv-primary" d="M32 23h91a10 10 0 0 1 10 10v29a10 10 0 0 1-10 10H72L48 88V72H32a10 10 0 0 1-10-10V33a10 10 0 0 1 10-10Z"/>
    <path class="mv-secondary mv-draw" d="M43 42h70M43 54h48"/>
    <circle class="mv-node mv-pulse" cx="145" cy="25" r="7"/>`,
  "relationship-graph":`
    <path class="mv-soft" d="M42 66L86 30L128 62L160 25M42 66l86-4M86 30l74-5"/>
    <circle class="mv-node mv-pulse" cx="42" cy="66" r="9"/><circle class="mv-node" cx="86" cy="30" r="8"/><circle class="mv-node" cx="128" cy="62" r="10"/><circle class="mv-node" cx="160" cy="25" r="7"/>`,
  "supply-chain-path":`
    <path class="mv-soft" d="M24 66C49 20 83 82 112 39S153 25 170 47"/>
    <path class="mv-primary mv-draw" d="M24 66C49 20 83 82 112 39S153 25 170 47"/>
    <circle class="mv-node" cx="24" cy="66" r="6"/><circle class="mv-node mv-pulse" cx="112" cy="39" r="7"/><circle class="mv-node" cx="170" cy="47" r="6"/>
    <path class="mv-secondary" d="M68 59l11 2-5 10"/>`,
  "ai-analysis":`
    <path class="mv-soft" d="M69 22C41 19 30 40 42 57c-8 18 10 31 28 23 9 14 30 11 34-4 20 4 34-14 24-29 8-16-7-30-24-25-7-12-27-12-35 0Z"/>
    <path class="mv-primary mv-draw" d="M57 42h21l10-14 12 41 10-27h24"/>
    <circle class="mv-node mv-pulse" cx="88" cy="28" r="5"/><circle class="mv-node" cx="100" cy="69" r="5"/>`,
  "ai-deep-research":`
    <circle class="mv-soft" cx="92" cy="50" r="39"/><circle class="mv-soft" cx="92" cy="50" r="26"/>
    <path class="mv-primary mv-draw" d="M63 66V29l29 9 29-9v37l-29 9Z"/>
    <path class="mv-secondary" d="M92 38v37M70 44l15 4M99 48l15-4"/>
    <circle class="mv-node mv-pulse" cx="143" cy="24" r="6"/>`,
  "ai-report":`
    <path class="mv-primary" d="M47 14h70l22 22v52H47Z"/>
    <path class="mv-soft" d="M117 14v23h22"/>
    <path class="mv-secondary mv-draw" d="M65 68V55M82 68V43M99 68V50M116 68V36"/>
    <circle class="mv-node mv-pulse" cx="151" cy="72" r="7"/>`,
  settings:`
    <circle class="mv-primary mv-spin" cx="91" cy="50" r="26"/>
    <circle class="mv-soft" cx="91" cy="50" r="12"/>
    <path class="mv-secondary" d="M91 13v11M91 76v11M54 50h11M117 50h11M65 24l8 8M109 68l8 8M65 76l8-8M109 32l8-8"/>
    <circle class="mv-node mv-pulse" cx="91" cy="50" r="5"/>`
};

function decorateRenderedPage(route){
  root.dataset.route=route;
  if(route==="overview")return;
  const heading=root.querySelector(".page-heading");
  if(heading&&!heading.querySelector(".module-visual")){
    heading.classList.add("module-hero-heading");
    const visual=document.createElement("div");
    visual.className="module-visual";
    visual.setAttribute("aria-hidden","true");
    visual.innerHTML=`<svg viewBox="0 0 190 100" focusable="false">
      <path class="mv-grid" d="M10 20H180M10 50H180M10 80H180M40 8V92M95 8V92M150 8V92"/>
      <circle class="mv-particle p1" cx="24" cy="22" r="2"/><circle class="mv-particle p2" cx="170" cy="77" r="2.5"/>
      ${moduleVisualShapes[route]||moduleVisualShapes["ai-analysis"]}
    </svg>`;
    heading.appendChild(visual);
  }
  const animatedCards=root.querySelectorAll(".metric-card,.intel-summary-card,.snapshot-card,.library-file-card,.research-blueprint-card,.qa-quick-btn,.tl-card,.ai-risk-metrics article,.ai-findings-grid article,.deep-archive-card,.detail-finding,.cm-country-action-card,.cm-project-card,.cm-response-card");
  animatedCards.forEach((card,index)=>{
    card.classList.add("visual-card");
    card.style.setProperty("--stagger-index",String(Math.min(index,12)));
  });
}

function render(){
  const route=routeName();
  setActiveNav(route);
  if(route==="export-controls") renderExportPage();
  else if(route==="minerals") renderMineralMarketPage();
  else if(route==="intelligence-analysis") renderIntelligenceAnalysisPage();
  else if(route==="countries") renderFileLibraryPage();
  else if(route==="settings") renderSettingsPage();
  else if(route==="ai-analysis") renderAiAnalysisPage();
  else if(route==="ai-deep-research") renderAiDeepResearchPage();
  
  else if(route==="ai-report") renderAiReportPage();
  else if(route==="smart-qa") renderSmartQaPage();
  else if(researchToolPages[route]) renderResearchToolPage(route);
    else if(route==="timeline") renderTimelinePage();
    else if(route==="overview") renderOverviewPage();
  else renderPlaceholder(route);
  decorateRenderedPage(route);
  root.focus();
  closeMobileNav();
}

function sparkline(values){
  const min=Math.min(...values),max=Math.max(...values),range=max-min||1;
  const points=values.map((value,index)=>`${8+index*36},${34-((value-min)/range)*25}`).join(" ");
  const direction=values.at(-1)>=values[0]?"up":"down";
  return `<svg class="mini-spark ${direction}" viewBox="0 0 88 42" role="img" aria-label="出口量指数 ${values.join("、")}"><polyline points="${points}"/><circle cx="80" cy="${34-((values.at(-1)-min)/range)*25}" r="2.5"/></svg>`;
}

function filteredMarketData(){
  const q=marketState.query.trim().toLowerCase();
  return mineralMarketData.filter(item=>(marketState.type==="all"||item.type===marketState.type)&&(!q||[item.name,item.symbol,item.type,item.product].join(" ").toLowerCase().includes(q)));
}

function renderMineralMarketPage(){
  const exportRising=mineralMarketData.filter(item=>item.exports.at(-1)>item.exports[0]).length;
  const priceRising=mineralMarketData.filter(item=>item.change>0).length;
  root.innerHTML=`
    <div class="page market-page">
      <header class="page-heading">
        <div>
          <p class="page-kicker">CRITICAL MINERAL MARKET PULSE</p>
          <h1>关键矿产态势</h1>
          <p>综合观察关键矿产出口量、海外价格、国家管制政策、境外反制工具和替代供应进展。</p>
        </div>
        <span class="demo-badge">综合研判 · 更新至 2026.07</span>
      </header>

      <section class="metric-grid" aria-label="矿产态势概览">
        <article class="metric-card green"><span>覆盖关键矿产</span><strong>${mineralMarketData.length}</strong><small>MINERAL ITEMS</small></article>
        <article class="metric-card cyan"><span>出口指数高于 2023</span><strong>${exportRising}</strong><small>EXPORT RISING</small></article>
        <article class="metric-card red"><span>海外价格月度上涨</span><strong>${priceRising}</strong><small>PRICE UP</small></article>
        <article class="metric-card"><span>统一出口基期</span><strong>100</strong><small>2023 BASE INDEX</small></article>
      </section>

      <section class="cm-situation-shell">
        <div class="cm-situation-head">
          <div>
            <p class="page-kicker">GLOBAL CONTROL & SUBSTITUTION WATCH</p>
            <h2>全球管制与替代态势</h2>
            <p>区分政策动作、项目建设和实际交付，避免把公告、储量或规划产能直接视为有效供应。</p>
          </div>
          <div class="cm-situation-tabs" role="tablist" aria-label="关键矿产全球态势视图">
            <button type="button" role="tab" data-situation-view="countries" aria-selected="${marketSituationState.view==="countries"}" class="${marketSituationState.view==="countries"?"active":""}">国家管制</button>
            <button type="button" role="tab" data-situation-view="responses" aria-selected="${marketSituationState.view==="responses"}" class="${marketSituationState.view==="responses"?"active":""}">国外反制</button>
            <button type="button" role="tab" data-situation-view="alternatives" aria-selected="${marketSituationState.view==="alternatives"}" class="${marketSituationState.view==="alternatives"?"active":""}">替代进展</button>
          </div>
        </div>
        <div class="cm-situation-panel" id="criticalMineralSituationPanel" role="tabpanel"></div>
      </section>

      <section class="panel catalog-panel market-panel">
        <div class="panel-head">
          <div><h2>逐项矿产态势</h2><p>出口量以 2023 年为 100；海外价格按代表性产品规格展示</p></div>
          <span class="panel-tag">参考日 2026.07.02</span>
        </div>
        <div class="catalog-toolbar market-toolbar">
          <label class="search-field"><span>⌕</span><input id="marketSearch" placeholder="搜索矿产、元素或产品规格…" value="${marketState.query}"/></label>
          <select class="year-select" id="marketType">
            <option value="all">全部类别</option>
            ${[...new Set(mineralMarketData.map(item=>item.type))].map(type=>`<option value="${type}" ${marketState.type===type?"selected":""}>${type}</option>`).join("")}
          </select>
        </div>
        <div class="table-meta"><span>共展示 <strong id="marketResultCount">0</strong> 项矿产</span><div class="market-legend"><span>↑ 高于基期</span><span>↓ 低于基期</span></div></div>
        <div class="market-table-wrap" id="marketTableWrap"></div>
      </section>

      <section class="data-note">
        <div><strong>数据口径</strong><span>出口量采用指数化展示，便于跨矿种比较；海外价格对应表中代表性产品，并非所有品级的成交价。</span></div>
        <div><strong>拟接入来源</strong><span>中国海关统计、UN Comtrade、USGS，以及经授权的海外金属与稀土行情数据。</span></div>
        <div><strong>使用提示</strong><span>当前数值仅用于页面功能和视觉展示，不应用于交易、估值或合规决策。</span></div>
      </section>
    </div>`;
  document.getElementById("marketSearch").addEventListener("input",event=>{marketState.query=event.target.value;renderMarketTable()});
  document.getElementById("marketType").addEventListener("change",event=>{marketState.type=event.target.value;renderMarketTable()});
  document.querySelectorAll("[data-situation-view]").forEach(button=>button.addEventListener("click",()=>{
    marketSituationState.view=button.dataset.situationView;
    document.querySelectorAll("[data-situation-view]").forEach(item=>{
      const active=item.dataset.situationView===marketSituationState.view;
      item.classList.toggle("active",active);
      item.setAttribute("aria-selected",String(active));
    });
    renderCriticalMineralSituationPanel();
  }));
  renderCriticalMineralSituationPanel();
  renderMarketTable();
}

function renderCriticalMineralSituationPanel(){
  const panel=document.getElementById("criticalMineralSituationPanel");
  if(!panel)return;
  if(marketSituationState.view==="countries"){
    panel.innerHTML=`
      <div class="cm-judgement-strip">
        <article><span>01</span><div><strong>管制规则继续精细化</strong><p>物项、目的地、最终用户、技术参数和许可证状态共同决定实际管制强度。</p></div></article>
        <article><span>02</span><div><strong>政府正在成为市场组织者</strong><p>境外政策已从补贴矿山转向价格保护、长期承购、储备和加工能力建设。</p></div></article>
        <article><span>03</span><div><strong>政策速度快于产能形成</strong><p>政策可即时调整，矿山、分离、磁体和材料认证通常需要数年。</p></div></article>
      </div>
      <div class="cm-country-grid">
        ${criticalPolicySituation.map((item,index)=>`
          <article class="cm-country-card ${item.tone}" style="--cm-delay:${index*.055}s">
            <header><span class="cm-country-code">${item.code}</span><span class="cm-country-status"><i></i>${item.status}</span></header>
            <h3>${item.name}</h3>
            <strong class="cm-country-headline">${item.headline}</strong>
            <p>${item.summary}</p>
            <ul>${item.facts.map(fact=>`<li>${fact}</li>`).join("")}</ul>
            <footer><span>重点观察</span><strong>${item.watch}</strong></footer>
          </article>`).join("")}
      </div>`;
    decorateRenderedPage("minerals");
    return;
  }
  if(marketSituationState.view==="responses"){
    panel.innerHTML=`
      <div class="cm-response-lead">
        <div><p class="page-kicker">POLICY TOOLCHAIN</p><h3>国外反制已由“找矿”转向全链条组合工具</h3><p>核心不是简单增加矿权，而是让项目获得融资、订单、价格保护、库存缓冲和联盟市场准入。</p></div>
        <div class="cm-response-chain" aria-label="国外反制工具链">
          <span>资源</span><i>→</i><span>加工</span><i>→</i><span>认证</span><i>→</i><span>承购</span><i>→</i><span>储备</span>
        </div>
      </div>
      <div class="cm-response-grid">
        ${foreignResponseMeasures.map((item,index)=>`
          <article class="cm-response-card ${item.tone}" style="--cm-delay:${index*.06}s">
            <header><span>${item.num}</span><b>${item.stage}</b></header>
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            <dl><div><dt>主要作用</dt><dd>${item.impact}</dd></div><div><dt>现实约束</dt><dd>${item.constraint}</dd></div></dl>
          </article>`).join("")}
      </div>
      <div class="cm-response-bottom">
        <article><span>短期</span><strong>库存与许可协调</strong><p>先吸收供应中断和审批延迟。</p></article>
        <article><span>中期</span><strong>承购与中游爬坡</strong><p>把矿山、加工厂和下游客户接成闭环。</p></article>
        <article><span>长期</span><strong>标准市场与技术替代</strong><p>形成可持续的安全溢价和替代体系。</p></article>
      </div>`;
    decorateRenderedPage("minerals");
    return;
  }
  panel.innerHTML=`
    <div class="cm-horizon-grid">
      ${alternativeTimeHorizons.map(item=>`
        <article class="${item.tone}"><span>${item.range}</span><h3>${item.title}</h3><div>${item.items.map(value=>`<b>${value}</b>`).join("")}</div></article>`).join("")}
    </div>
    <section class="cm-country-action-section">
      <div class="cm-subsection-head"><div><h3>各国替代行动与投资建厂</h3><p>按国家梳理政策投入、在建工厂、海外投资和长期承购安排</p></div><span>${alternativeCountryActions.length} ECONOMIES</span></div>
      <div class="cm-country-action-grid">
        ${alternativeCountryActions.map((item,index)=>{const evidence=alternativeCountryEvidence[item.code];return `
          <article class="cm-country-action-card ${item.tone}" style="--cm-delay:${index*.045}s">
            <header><span>${item.code}</span><div><h4>${item.name}</h4><small>${item.focus}</small></div><b>${item.status}</b></header>
            <p>${item.action}</p>
            <div>${item.facilities.map(facility=>`<span>${facility}</span>`).join("")}</div>
            <footer class="cm-country-proof">${evidence?`<span class="cm-country-proof-status">${evidence.status}</span><a href="${evidence.url}" target="_blank" rel="noreferrer">来源：${evidence.source}</a><time>发布：${evidence.date}</time>`:`<span>待补充：国家级公开进展来源</span>`}</footer>
          </article>`;}).join("")}
      </div>
    </section>
    <div class="cm-alternative-layout">
      <section class="cm-project-section">
        <div class="cm-subsection-head"><div><h3>代表性替代供应项目</h3><p>仅把商业交付视为有效供应；建设、试产和规划产能分别标识。</p></div><span>${alternativeSupplyProjects.length} PROJECTS</span></div>
        <div class="cm-project-list">
          ${alternativeSupplyProjects.map((item,index)=>{const verification=alternativeProjectVerification[item.name];return `
            <article class="cm-project-card" style="--cm-delay:${index*.045}s">
              <div class="cm-project-mark ${item.stageKey}"><i></i><span>${item.mineral}</span></div>
              <div class="cm-project-main"><header><h4>${item.name}</h4><span>${item.region}</span></header><p>${item.progress}</p><small>${item.chain}</small><div class="cm-project-proof"><span class="cm-proof-status ${verification.status.startsWith("已核验")?"verified":"pending"}">${verification.status}</span><a href="${verification.url}" target="_blank" rel="noreferrer">来源：${verification.source}</a><time>发布：${verification.date}</time></div></div>
              <div class="cm-project-stage"><strong>${item.stage}</strong><span>瓶颈：${item.bottleneck}</span></div>
            </article>`;}).join("")}
        </div>
      </section>
      <section class="cm-readiness-section">
        <div class="cm-subsection-head"><div><h3>矿种替代成熟度</h3><p>资源端、中游加工与技术替代分开判断</p></div></div>
        <div class="cm-readiness-list">
          ${alternativeMineralReadiness.map(item=>`
            <article>
              <header><strong>${item.name}</strong><span>${item.horizon}</span></header>
              <div class="cm-readiness-bars">
                <div><span>资源替代</span><i data-level="${item.source}"></i><b>${item.source}</b></div>
                <div><span>中游替代</span><i data-level="${item.processing}"></i><b>${item.processing}</b></div>
                <div><span>技术替代</span><i data-level="${item.technology}"></i><b>${item.technology}</b></div>
              </div>
              <p>${item.note}</p>
            </article>`).join("")}
        </div>
      </section>
    </div>`;
  decorateRenderedPage("minerals");
}

function renderMarketTable(){
  const rows=filteredMarketData();
  document.getElementById("marketResultCount").textContent=rows.length;
  document.getElementById("marketTableWrap").innerHTML=rows.length?`
    <table class="market-table">
      <thead><tr><th>矿产</th><th>代表性产品</th><th>出口量态势</th><th>2023 / 2024 / 2025</th><th>海外参考价格</th><th>月度变化</th></tr></thead>
      <tbody>${rows.map(item=>{
        const exportChange=((item.exports.at(-1)/item.exports[0]-1)*100).toFixed(1);
        return `<tr>
          <td><div class="mineral-cell"><span class="element">${item.symbol}</span><div><strong>${item.name}</strong><small>${item.type}</small></div></div></td>
          <td class="market-product">${item.product}</td>
          <td><div class="trend-cell">${sparkline(item.exports)}<span class="${Number(exportChange)>=0?"trend-up":"trend-down"}">${Number(exportChange)>=0?"↑":"↓"} ${Math.abs(exportChange)}%</span></div></td>
          <td class="index-series">${item.exports.join(" / ")}</td>
          <td><strong class="market-price">${item.price}</strong><small>${item.unit}</small></td>
          <td><span class="price-change ${item.change>=0?"up":"down"}">${item.change>=0?"+":""}${item.change.toFixed(1)}%</span></td>
        </tr>`;
      }).join("")}</tbody>
    </table>`:`<div class="empty">没有符合当前筛选条件的矿产。</div>`;
}

function quarterlyPolicySeries(){
  const latestDate=new Date("2026-07-02T00:00:00");
  const latestQuarter=Math.floor(latestDate.getMonth()/3)+1;
  const series=[];
  for(let year=2023;year<=latestDate.getFullYear();year++){
    const firstQuarter=year===2023?3:1;
    const finalQuarter=year===latestDate.getFullYear()?latestQuarter:4;
    for(let quarter=firstQuarter;quarter<=finalQuarter;quarter++) series.push({year,quarter,count:0});
  }
  policyGroups.forEach(policy=>{
    const [startYear,startMonth]=policy.date.split("-").map(Number);
    const startQuarter=Math.floor((startMonth-1)/3)+1;
    const startBucket=series.find(item=>item.year===startYear&&item.quarter===startQuarter);
    if(startBucket) startBucket.added=(startBucket.added||0)+1;
    if(policy.pauseDate){
      const [pauseYear,pauseMonth]=policy.pauseDate.split("-").map(Number);
      const pauseQuarter=Math.floor((pauseMonth-1)/3)+1;
      const eventBucket=series.find(item=>item.year===pauseYear&&item.quarter===pauseQuarter);
      if(eventBucket) eventBucket.pauseEvents=(eventBucket.pauseEvents||0)+1;
      const applyYear=pauseQuarter===4?pauseYear+1:pauseYear;
      const applyQuarter=pauseQuarter===4?1:pauseQuarter+1;
      const applyBucket=series.find(item=>item.year===applyYear&&item.quarter===applyQuarter);
      if(applyBucket) applyBucket.paused=(applyBucket.paused||0)+1;
    }
  });
  let cumulative=0;
  series.forEach(item=>{
    item.newCount=item.added||0;
    item.pausedCount=item.paused||0;
    item.pauseEventCount=item.pauseEvents||0;
    cumulative+=item.newCount-item.pausedCount;
    item.count=cumulative;
  });
  return series;
}

function quarterEventLabel(item){
  return [
    item.newCount?`+${item.newCount}`:"",
    item.pausedCount?`−${item.pausedCount}`:"",
    item.pauseEventCount?`暂停${item.pauseEventCount}→下季`:""
  ].filter(Boolean).join(" / ");
}

function renderQuarterlyPolicyChart(){
  const series=quarterlyPolicySeries();
  const width=Math.max(820,series.length*54+40),height=168,left=28,right=18,top=18,bottom=38;
  const chartHeight=height-top-bottom,peak=Math.max(...series.map(item=>item.count));
  const tickStep=Math.max(1,Math.ceil(peak/4)),maxCount=tickStep*4;
  const ticks=Array.from({length:5},(_,index)=>index*tickStep);
  const x=index=>left+index*((width-left-right)/(series.length-1));
  const y=value=>top+chartHeight-(value/maxCount)*chartHeight;
  const points=series.map((item,index)=>`${x(index)},${y(item.count)}`).join(" ");
  const area=`M ${x(0)} ${y(0)} L ${points.replaceAll(",", " ")} L ${x(series.length-1)} ${y(0)} Z`;
  return `<div class="quarter-chart-scroll">
    <svg class="quarter-chart" viewBox="0 0 ${width} ${height}" style="min-width:${width}px" role="img" aria-label="2023年第三季度至2026年第三季度季度末有效政策组数量">
      <defs><linearGradient id="quarterAreaGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#50d18d" stop-opacity=".24"/><stop offset="1" stop-color="#50d18d" stop-opacity="0"/></linearGradient></defs>
      ${ticks.map(value=>`<line class="quarter-grid" x1="${left}" y1="${y(value)}" x2="${width-right}" y2="${y(value)}"/><text class="quarter-axis" x="5" y="${y(value)+3}">${value}</text>`).join("")}
      <path class="quarter-area" d="${area}"/>
      <polyline class="quarter-line" points="${points}"/>
      ${series.map((item,index)=>`<g><circle class="quarter-point ${item.count?"has-data":""}" cx="${x(index)}" cy="${y(item.count)}" r="${item.count?4:2.5}"><title>${item.year} Q${item.quarter}：有效 ${item.count} 组，新增 ${item.newCount} 组，本季扣减 ${item.pausedCount} 组，发生暂停 ${item.pauseEventCount} 组</title></circle>${item.newCount||item.pausedCount||item.pauseEventCount?`<text class="quarter-value" x="${x(index)}" y="${y(item.count)-9}">${item.count}</text><text class="quarter-event ${item.pausedCount||item.pauseEventCount?"has-pause":""}" x="${x(index)}" y="${y(item.count)-20}">${quarterEventLabel(item)}</text>`:""}<text class="quarter-label" x="${x(index)}" y="${height-13}">${String(item.year).slice(2)}Q${item.quarter}${index===series.length-1?"*":""}</text></g>`).join("")}
    </svg>
  </div><p class="quarter-note">* 新增政策在当季计入，暂停政策从下一季度扣减；2026 Q3 为当前未完结季度。</p>`;
}

function renderExportPage(){
  const activeRecords=policies.filter(policy=>policy.status==="active").length;
  const pausedRecords=policies.filter(policy=>policy.status==="paused").length;
  root.innerHTML=`
    <div class="page">
      <header class="page-heading">
        <div>
          <p class="page-kicker">EXPORT CONTROL INTELLIGENCE</p>
          <h1>关键矿产清单</h1>
          <p>集中展示中国自2023年以来涉及关键矿产的出口管制措施，区分现行与暂停状态，并链接官方政策来源。</p>
        </div>
        <div class="page-actions">
          <button class="button" id="openHsCatalog">商品税号清单</button>
          <button class="button" id="copySummary">复制摘要</button>
          <button class="button primary" id="exportData">导出清单 ↗</button>
        </div>
      </header>

      <section class="metric-grid" aria-label="数据概览">
        <article class="metric-card green"><span>现行清单记录</span><strong>${activeRecords}</strong><small>ACTIVE RECORDS</small></article>
        <article class="metric-card red"><span>暂停清单记录</span><strong>${pausedRecords}</strong><small>PAUSED RECORDS</small></article>
        <article class="metric-card cyan"><span>全部清单记录</span><strong>${policies.length}</strong><small>TOTAL RECORDS</small></article>
        <article class="metric-card"><span>政策组</span><strong>${policyGroups.length}</strong><small>POLICY GROUPS</small></article>
      </section>

      <section class="insight-grid">
        <article class="panel">
          <div class="panel-head"><div><h2>政策密度趋势</h2><p>季度有效政策组存量 · 暂停次季扣减</p></div><span class="panel-tag">2023 Q3—2026 Q3</span></div>
          <div class="chart-wrap">
            ${renderQuarterlyPolicyChart()}
          </div>
        </article>
        <article class="panel">
          <div class="panel-head"><div><h2>主要管制手段</h2><p>按政策记录覆盖情况归纳</p></div></div>
          <div class="mode-list">
            ${[["两用物项单项许可","82%"],["最终用户/用途审查","64%"],["技术出口禁止或限制","36%"],["设备与全链条管制","27%"]].map((x,i)=>`<div class="mode-item"><strong>${x[0]}</strong><span>${x[1]}</span><div class="mode-bar"><i style="width:${x[1]};opacity:${1-i*.12}"></i></div></div>`).join("")}
          </div>
        </article>
      </section>

      <section class="panel catalog-panel">
        <div class="panel-head"><div><h2>管制政策清单</h2><p>点击记录查看物项范围、管制手段和官方来源</p></div><span class="panel-tag">截至 2026.07.02</span></div>
        <div class="catalog-toolbar">
          <label class="search-field"><span>⌕</span><input id="policySearch" placeholder="搜索矿产、材料或管制物项…" value="${state.query}"/></label>
          <div class="filter-group">
            ${[["all","全部"],["active","现行"],["paused","暂停"]].map(x=>`<button class="filter-chip ${state.status===x[0]?"active":""}" data-status="${x[0]}">${x[1]}</button>`).join("")}
          </div>
          <select class="year-select" id="yearSelect"><option value="all">全部年份</option>${["2023","2024","2025"].map(y=>`<option value="${y}" ${state.year===y?"selected":""}>${y} 年</option>`).join("")}</select>
        </div>
        <div class="table-meta"><span>共找到 <strong id="resultCount">0</strong> 项商品记录</span><div class="legend"><span><i class="active"></i>现行</span><span><i class="paused"></i>暂停实施</span></div></div>
        <div id="tableWrap"></div>
      </section>

      <section class="panel catalog-panel hs-catalog" id="hsCatalog">
        <div class="panel-head">
          <div><h2>公告商品与税号清单</h2><p>按公告原文提取商品、两用物项管制编码和参考海关商品编号/税则号列</p></div>
          <button class="button" id="exportHsData">导出税号清单 ↗</button>
        </div>
        <div class="catalog-toolbar hs-toolbar">
          <label class="search-field"><span>⌕</span><input id="hsSearch" placeholder="搜索公告、商品、管制编码或税号…" value="${announcementState.query}"/></label>
          <select class="year-select" id="hsNotice">
            <option value="all">全部公告</option>
            ${announcementDefinitions.map(definition=>`<option value="${definition.notice}" ${announcementState.notice===definition.notice?"selected":""}>${definition.notice}</option>`).join("")}
          </select>
          <select class="year-select" id="hsStatus">
            ${[["all","全部状态"],["active","现行"],["paused","暂停"],["info","状态调整"]].map(([value,label])=>`<option value="${value}" ${announcementState.status===value?"selected":""}>${label}</option>`).join("")}
          </select>
        </div>
        <div class="table-meta"><span>共整理 <strong id="hsResultCount">0</strong> 项公告物项</span><span>税号仅供识别参考，以最新税则及主管部门解释为准</span></div>
        <div class="hs-table-wrap" id="hsTableWrap"></div>
      </section>
    </div>`;
  bindExportControls();
  renderTable();
  bindAnnouncementCatalog();
  renderAnnouncementTable();
}

function filteredPolicies(){
  const q=state.query.trim().toLowerCase();
  return policies.filter(p=>(state.status==="all"||p.status===state.status)&&(state.year==="all"||p.year===state.year)&&(!q||[p.name,p.type,p.scopeShort,p.scope,p.method].join(" ").toLowerCase().includes(q)));
}

function renderTable(){
  const rows=filteredPolicies();
  document.getElementById("resultCount").textContent=rows.length;
  document.getElementById("tableWrap").innerHTML=rows.length?`
    <table class="policy-table">
      <thead><tr><th>矿产 / 材料</th><th>管制范围</th><th>实施 / 公布</th><th>政策来源</th><th>当前状态</th><th></th></tr></thead>
      <tbody>${rows.map(p=>`<tr tabindex="0" data-id="${p.id}">
        <td><div class="mineral-cell"><span class="element">${p.symbol}</span><div><strong>${p.name}</strong><small>${p.type}</small></div></div></td>
        <td class="scope-text">${p.scopeShort}</td>
        <td class="policy-date-cell"><span>${p.date}</span>${p.pauseDate?`<small>暂停：${p.pauseDate}</small>`:""}</td>
        <td class="policy-source-cell"><span>${p.source.split("；")[0]}</span>${p.pauseNotice?`<a href="${p.pauseUrl}" target="_blank" rel="noreferrer">${p.pauseNotice} ↗</a>`:""}</td>
        <td><span class="status-pill ${p.status}">${p.statusText}</span></td><td class="row-arrow">↗</td>
      </tr>`).join("")}</tbody>
    </table>`:`<div class="empty">没有符合当前筛选条件的记录。</div>`;
  document.querySelectorAll("tr[data-id]").forEach(row=>{
    row.addEventListener("click",()=>openDetail(row.dataset.id));
    row.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(row.dataset.id)}});
  });
  document.querySelectorAll(".policy-source-cell a").forEach(link=>link.addEventListener("click",event=>event.stopPropagation()));
}

function bindExportControls(){
  document.getElementById("policySearch").addEventListener("input",e=>{state.query=e.target.value;renderTable()});
  document.getElementById("yearSelect").addEventListener("change",e=>{state.year=e.target.value;renderTable()});
  document.querySelectorAll(".filter-chip").forEach(btn=>btn.addEventListener("click",()=>{state.status=btn.dataset.status;document.querySelectorAll(".filter-chip").forEach(x=>x.classList.toggle("active",x===btn));renderTable()}));
  document.getElementById("copySummary").addEventListener("click",async()=>{const text="截至2026年7月2日，中国现行关键矿产出口管制直接涉及镓、锗、石墨、锑、钨、碲、铋、钼、铟，七种中重稀土及金刚石等超硬材料。多数措施为特定物项许可，并非全面禁运。";try{await navigator.clipboard.writeText(text)}catch{window.prompt("复制摘要",text)}});
  document.getElementById("exportData").addEventListener("click",()=>downloadCSV());
  document.getElementById("openHsCatalog").addEventListener("click",()=>document.getElementById("hsCatalog").scrollIntoView({behavior:"smooth",block:"start"}));
}

function filteredAnnouncementItems(){
  const q=announcementState.query.trim().toLowerCase();
  return announcementItems.filter(item=>
    (announcementState.status==="all"||item.status===announcementState.status)&&
    (announcementState.notice==="all"||item.notice===announcementState.notice)&&
    (!q||[item.notice,item.item,item.controlCode,item.hsCode].join(" ").toLowerCase().includes(q))
  );
}

function bindAnnouncementCatalog(){
  document.getElementById("hsSearch").addEventListener("input",event=>{announcementState.query=event.target.value;renderAnnouncementTable()});
  document.getElementById("hsNotice").addEventListener("change",event=>{announcementState.notice=event.target.value;renderAnnouncementTable()});
  document.getElementById("hsStatus").addEventListener("change",event=>{announcementState.status=event.target.value;renderAnnouncementTable()});
  document.getElementById("exportHsData").addEventListener("click",()=>downloadAnnouncementCSV());
}

function renderAnnouncementTable(){
  const rows=filteredAnnouncementItems();
  document.getElementById("hsResultCount").textContent=rows.length;
  document.getElementById("hsTableWrap").innerHTML=rows.length?`
    <table class="hs-table">
      <thead><tr><th>公告</th><th>商品 / 物项</th><th>管制编码</th><th>参考海关商品编号 / 税则号列</th><th>状态</th><th>原文</th></tr></thead>
      <tbody>${rows.map(item=>`<tr>
        <td><strong>${item.notice}</strong><small>${item.date}</small></td>
        <td>${item.item}</td>
        <td class="control-code">${item.controlCode}</td>
        <td class="hs-code">${item.hsCode}</td>
        <td><span class="status-pill ${item.status==="active"?"active":item.status==="paused"?"paused":"info"}">${item.statusText}</span></td>
        <td><a class="table-source-link" href="${item.source}" target="_blank" rel="noreferrer">查看 ↗</a></td>
      </tr>`).join("")}</tbody>
    </table>`:`<div class="empty">没有符合当前筛选条件的公告物项。</div>`;
}

function downloadAnnouncementCSV(){
  const head=["公告","发布日期","商品/物项","两用物项管制编码","参考海关商品编号/税则号列","状态","官方原文"];
  const lines=[head,...filteredAnnouncementItems().map(item=>[item.notice,item.date,item.item,item.controlCode,item.hsCode,item.statusText,item.source])]
    .map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob(["\ufeff"+lines],{type:"text/csv;charset=utf-8"});
  const anchor=document.createElement("a");
  anchor.href=URL.createObjectURL(blob);
  anchor.download="公告商品与税号清单.csv";
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function latestCollectionBatch(items){
  if(!items.length)return {date:"",items:[]};
  const date=items.reduce((latest,item)=>String(item.collectedAt||"")>latest?String(item.collectedAt):latest,"");
  return {date,items:items.filter(item=>String(item.collectedAt||"")===date)};
}

function formatCollectionDate(date){
  const [year,month,day]=String(date||"").split("-");
  return {year:year||"—",short:month&&day?`${month}.${day}`:"—"};
}

function renderIntelligenceAnalysisPage(){
  const selected=intelligenceMinerals.find(item=>item.id===intelligenceState.mineral)||intelligenceMinerals[0];
  const allSnapshots=(window.intelligenceSnapshots||[]).filter(item=>item.mineral===selected.id);
  const latestSnapshots=latestCollectionBatch(allSnapshots);
  const snapshots=latestSnapshots.items;
  const latestCases=latestCollectionBatch(tungstenCases);
  const visibleCases=latestCases.items;
  const collectionDate=formatCollectionDate(latestSnapshots.date);
  const content=selected.ready?`
    <section class="intel-summary-grid">
      <article class="intel-summary-card"><span>本次采集快照</span><strong>${snapshots.length}</strong><small>历史批次已归档</small></article>
      <article class="intel-summary-card"><span>本次执法案例</span><strong>${visibleCases.length}</strong><small>仅展示最新批次</small></article>
      <article class="intel-summary-card"><span>高风险信号</span><strong>${tungstenRiskSignals.filter(item=>item.level==="高").length}</strong><small>项优先复核</small></article>
      <article class="intel-summary-card"><span>最新采集</span><strong class="intel-date">${collectionDate.short}</strong><small>${collectionDate.year} 年</small></article>
    </section>

    <section class="panel intel-section">
      <div class="panel-head">
        <div><h2>情报快照</h2><p>仅展示 ${latestSnapshots.date||"当前"} 最新采集批次；历史批次自动归档至文件库。</p></div>
        <span class="panel-tag">${snapshots.length} LATEST SNAPSHOTS</span>
      </div>
      <div class="snapshot-list">
        ${snapshots.map((item,index)=>`
          <details class="snapshot-card" ${index<2?"open":""}>
            <summary>
              <div class="snapshot-status">
                <span>本地快照</span>
                <b class="${item.sourceLanguage==="zh-CN"?"native":"translated"}">${item.translationStatus}</b>
              </div>
              <div class="snapshot-heading">
                <div class="intel-card-meta"><span>${item.sourcePublished}</span><span>${item.sourceName}</span><b>${item.category}</b></div>
                <h3>${item.titleZh}</h3>
                <p>${item.summaryZh}</p>
              </div>
              <span class="snapshot-toggle"><em>查看采集稿</em><i aria-hidden="true">⌄</i></span>
            </summary>
            <div class="snapshot-content">
              ${item.titleOriginal?`<p class="original-title"><strong>原文标题</strong><span>${item.titleOriginal}</span></p>`:""}
              <h4>完整中文采集稿</h4>
              <article class="collected-article">
                ${(item.sectionsZh||[]).map(section=>`<section><h5>${section.title}</h5><p>${section.body}</p></section>`).join("")}
              </article>
              <h4 class="fact-index-title">关键事实索引</h4>
              <ul>${item.factsZh.map(fact=>`<li>${fact}</li>`).join("")}</ul>
              <footer>
                <span>采集时间：${item.collectedAt}</span>
                <span>原文语言：${item.sourceLanguage==="zh-CN"?"中文":"英文"}</span>
                <span>存储状态：本地可读</span>
                <a href="${item.sourceUrl}" target="_blank" rel="noreferrer">查看原始网页 ↗</a>
              </footer>
            </div>
          </details>`).join("")}
      </div>
    </section>

    <section class="panel intel-section">
      <div class="panel-head">
        <div><h2>执法查发案例</h2><p>仅展示 ${latestCases.date||"当前"} 最新采集批次；历史案例保留在文件库。</p></div>
        <span class="panel-tag">${visibleCases.length} LATEST CASES</span>
      </div>
      <div class="case-list">
        ${visibleCases.map(item=>`
          <article class="case-card">
            <div class="case-country"><strong>${item.country}</strong><span>${item.agency}</span></div>
            <div class="case-main">
              <div class="intel-card-meta"><span>${item.date}</span><b>${item.mineral}</b><em>${item.status}</em></div>
              <h3>${item.title}</h3>
              <p>${item.finding}</p>
              <div class="case-route"><span>流向</span><strong>${item.direction}</strong></div>
            </div>
            <a class="case-source" href="${item.source}" target="_blank" rel="noreferrer" aria-label="查看${item.title}来源">↗</a>
          </article>`).join("")}
      </div>
    </section>

    <section class="panel intel-section risk-section">
      <div class="panel-head">
        <div><h2>走私违规分析</h2><p>基于公开执法案例提炼风险信号，定位需进一步核查的异常，不直接作违法结论。</p></div>
        <span class="ai-badge">AI 研判 · 人工复核</span>
      </div>
      <div class="risk-grid">
        ${tungstenRiskSignals.map((item,index)=>`
          <article class="risk-card">
            <div class="risk-card-head"><span>R${String(index+1).padStart(2,"0")}</span><b class="${item.level==="高"?"high":"medium"}">${item.level}风险</b></div>
            <h3>${item.title}</h3>
            <p>${item.analysis}</p>
            <div><strong>建议核查</strong><span>${item.check}</span></div>
          </article>`).join("")}
      </div>
      <p class="intel-disclaimer">分析仅用于风险筛查与合规执法辅助；案件定性应以调查证据、法定程序及主管部门认定为准。</p>
    </section>`:`
    <section class="panel intel-empty">
      <span>${selected.symbol}</span>
      <h2>${selected.name}情报模块待接入</h2>
      <p>筛选标签已预留。当前先完成钨矿的公开情报、查发案例与AI风险分析。</p>
      <button class="button primary" type="button" data-mineral-jump="tungsten">查看钨矿情报</button>
    </section>`;

  root.innerHTML=`
    <div class="page intelligence-page">
      <header class="page-heading intel-heading">
        <div>
          <p class="page-kicker">OPEN-SOURCE INTELLIGENCE</p>
          <h1>开源信息情报</h1>
          <p>围绕关键矿产建立公开情报、执法案例和风险信号的统一分析视图。</p>
        </div>
        <span class="intel-update">公开来源 · 截至 2026.07.13</span>
      </header>
      <div class="mineral-selector">
        <button class="mineral-selector-button" id="mineralSelectorButton" type="button" aria-expanded="false" aria-controls="mineralDropdown">
          <span>筛选关键矿产</span>
          <strong><b>${selected.symbol}</b>${selected.name}</strong>
          <i aria-hidden="true">⌄</i>
        </button>
        <div class="mineral-dropdown" id="mineralDropdown" hidden>
          <div class="mineral-dropdown-head"><strong>全部关键矿产</strong><span>${intelligenceMinerals.length} 项</span></div>
          <div class="mineral-option-list" role="listbox" aria-label="关键矿产列表">
            ${intelligenceMinerals.map(item=>`<button type="button" class="mineral-option ${item.id===selected.id?"active":""}" data-mineral="${item.id}" role="option" aria-selected="${item.id===selected.id}"><b>${item.symbol}</b><span>${item.name}</span><small>${item.ready?"已接入":"待接入"}</small></button>`).join("")}
          </div>
        </div>
      </div>
      ${content}
    </div>`;

  const selectorButton=document.getElementById("mineralSelectorButton");
  const dropdown=document.getElementById("mineralDropdown");
  selectorButton.addEventListener("click",()=>{
    const expanded=selectorButton.getAttribute("aria-expanded")==="true";
    selectorButton.setAttribute("aria-expanded",String(!expanded));
    dropdown.hidden=expanded;
  });
  document.querySelectorAll(".mineral-option").forEach(button=>button.addEventListener("click",()=>{
    intelligenceState.mineral=button.dataset.mineral;
    renderIntelligenceAnalysisPage();
  }));
  document.querySelector("[data-mineral-jump]")?.addEventListener("click",()=>{
    intelligenceState.mineral="tungsten";
    renderIntelligenceAnalysisPage();
  });
  decorateRenderedPage("intelligence-analysis");
}

function renderSettingsPage(){
  const percent=Math.round(fontScale*100);
  root.innerHTML=`
    <div class="page settings-page">
      <header class="page-heading">
        <div>
          <p class="page-kicker">SYSTEM PREFERENCES</p>
          <h1>系统设置</h1>
          <p>调整系统界面偏好。设置仅保存在当前浏览器中，并会在刷新或下次打开时继续生效。</p>
        </div>
      </header>
      <section class="panel settings-panel">
        <div class="panel-head">
          <div><h2>字体大小</h2><p>同步调整菜单、正文、表格和图表标注的显示字号。</p></div>
          <span class="setting-value" id="fontScaleValue">${percent}%</span>
        </div>
        <div class="font-setting-body">
          <div class="font-presets" role="group" aria-label="字体大小预设">
            ${[
              ["较小",.9],
              ["标准",1],
              ["较大",1.15],
              ["特大",1.3]
            ].map(([label,value])=>`<button class="font-preset ${Math.abs(fontScale-value)<.01?"active":""}" data-font-scale="${value}" aria-pressed="${Math.abs(fontScale-value)<.01}"><span>${label}</span><small>${Math.round(value*100)}%</small></button>`).join("")}
          </div>
          <label class="font-slider-row" for="fontScaleRange">
            <span>精细调节</span>
            <input id="fontScaleRange" type="range" min="90" max="130" step="5" value="${percent}" aria-describedby="fontPreview"/>
          </label>
          <div class="font-preview" id="fontPreview">
            <span>预览</span>
            <strong>关键矿产清单</strong>
            <p>公告商品、海关税号及政策状态将按当前字号显示。</p>
          </div>
        </div>
      </section>
    </div>`;

  const range=document.getElementById("fontScaleRange");
  const valueLabel=document.getElementById("fontScaleValue");
  const update=value=>{
    applyFontScale(Number(value)/100);
    valueLabel.textContent=`${Math.round(fontScale*100)}%`;
    document.querySelectorAll(".font-preset").forEach(button=>{
      const active=Math.abs(Number(button.dataset.fontScale)-fontScale)<.01;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  };
  range.addEventListener("input",event=>update(event.target.value));
  document.querySelectorAll(".font-preset").forEach(button=>button.addEventListener("click",()=>{
    const percentValue=Math.round(Number(button.dataset.fontScale)*100);
    range.value=String(percentValue);
    update(percentValue);
  }));
}


﻿function renderOverviewPage(){
  var activeCount=0,pausedCount=0;
  var typeMap={};
  var events=[];
  for(var i=0;i<policyGroups.length;i++){
    var g=policyGroups[i];
    if(g.status==="active")activeCount++;
    else pausedCount++;
    if(!typeMap[g.type])typeMap[g.type]={active:0,paused:0,total:0};
    typeMap[g.type].total++;
    if(g.status==="active")typeMap[g.type].active++;
    else typeMap[g.type].paused++;
    events.push({date:g.date,type:"政策",text:g.name+" - "+g.statusText,status:g.status});
  }
  for(var i=0;i<intelligenceSnapshots.length;i++){
    var s=intelligenceSnapshots[i];
    events.push({date:s.collectedAt||s.sourcePublished,type:"情报",text:s.titleZh,status:""});
  }
  for(var i=0;i<tungstenCases.length;i++){
    var c=tungstenCases[i];
    events.push({date:c.collectedAt,type:"案例",text:c.title,status:"warning"});
  }
  events.sort(function(a,b){return b.date.localeCompare(a.date);});
  events=events.slice(0,8);

  var mineralCount=mineralMarketData.length;
  var intelCount=intelligenceSnapshots.length;
  var caseCount=tungstenCases.length;
  var deepCount=deepResearchReports.length;
  var aiReportCount=aiReportReports.length;
  var pausedDeadline="2026-11-10";
  var types=Object.keys(typeMap).sort();
  var typeBars=types.map(function(t){
    var d=typeMap[t];
    var activePct=d.active/d.total*100;
    var pausedPct=d.paused/d.total*100;
    var status=d.paused>0?(d.active>0?"部分暂停":"全部暂停"):"全部现行";
    return "<div class=\"ov-type-row\">"+
      "<div class=\"ov-type-name\"><span>"+t+"</span><small>"+status+"</small></div>"+
      "<div class=\"ov-type-track\"><i class=\"active\" style=\"--segment-width:"+activePct+"%\"></i><i class=\"paused\" style=\"--segment-width:"+pausedPct+"%\"></i></div>"+
      "<strong>"+d.total+"</strong>"+
    "</div>";
  }).join("");

  var priceAlerts=mineralMarketData.filter(function(m){return Math.abs(m.change)>=4;}).sort(function(a,b){return Math.abs(b.change)-Math.abs(a.change);}).slice(0,6);
  var totalPolicyCount=activeCount+pausedCount;
  var activePolicyPct=totalPolicyCount?Math.round(activeCount/totalPolicyCount*100):0;
  var latestEventDate=events.length?events[0].date:"—";

  function metricSpark(values){
    return "<span class=\"ov-metric-spark\" aria-hidden=\"true\">"+values.map(function(value,index){
      return "<i style=\"--spark-height:"+value+"%;--spark-delay:"+(index*.07)+"s\"></i>";
    }).join("")+"</span>";
  }
  function metricIcon(path){
    return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\">"+path+"</svg>";
  }
  var metrics=[
    {tone:"green",value:activeCount,unit:"组",label:"现行管制",note:"持续执行",spark:[38,52,67,82,100],icon:metricIcon("<path d=\"M12 3 19 6v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z\"/><path d=\"m9 12 2 2 4-5\"/>")},
    {tone:"amber",value:pausedCount,unit:"组",label:"暂停政策",note:"跟踪到期节点",spark:[92,74,58,44,36],icon:metricIcon("<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M10 9v6M14 9v6\"/>")},
    {tone:"blue",value:mineralCount,unit:"种",label:"受控矿产",note:"态势持续更新",spark:[34,46,62,78,94],icon:metricIcon("<path d=\"m12 3 8 7-8 11L4 10l8-7Z\"/><path d=\"m4 10 8 3 8-3M12 13v8\"/>")},
    {tone:"cyan",value:intelCount,unit:"条",label:"情报快照",note:"多源开源信息",spark:[28,52,43,76,100],icon:metricIcon("<path d=\"M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z\"/><path d=\"M12 9v3l2 2M4 4l2 2M20 4l-2 2\"/>")},
    {tone:"red",value:caseCount,unit:"条",label:"执法案例",note:"风险线索归档",spark:[30,38,58,70,88],icon:metricIcon("<circle cx=\"11\" cy=\"11\" r=\"6\"/><path d=\"m16 16 4 4M11 8v6M8 11h6\"/>")},
    {tone:"violet",value:deepCount,unit:"份",label:"AI深度研究",note:"专题成果",spark:[18,35,32,72,100],icon:metricIcon("<path d=\"M8 5a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 3 3M16 5a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-3 3M8 5v14M16 5v14M8 9h3M13 15h3\"/>")},
    {tone:"teal",value:aiReportCount,unit:"份",label:"AI战略报告",note:"正式成果归档",spark:[22,34,54,76,96],icon:metricIcon("<path d=\"M6 3h9l3 3v15H6V3Z\"/><path d=\"M15 3v4h4M9 11h6M9 15h6\"/>")}
  ];
  var metricCards=metrics.map(function(item,index){
    return "<article class=\"ov-metric-card "+item.tone+"\" style=\"--card-delay:"+(index*.055)+"s\">"+
      "<div class=\"ov-metric-top\"><span class=\"ov-metric-icon\">"+item.icon+"</span>"+metricSpark(item.spark)+"</div>"+
      "<div class=\"ov-metric-value\"><strong>"+item.value+"</strong><small>"+item.unit+"</small></div>"+
      "<div class=\"ov-metric-label\"><span>"+item.label+"</span><small>"+item.note+"</small></div>"+
    "</article>";
  }).join("");

  var eventRows=events.map(function(e,index){
    var typeClass={政策:"policy",情报:"intel",案例:"case"}[e.type]||"";
    return "<article class=\"ov-event "+typeClass+"\" style=\"--event-delay:"+(index*.05)+"s\">"+
      "<time>"+e.date+"</time><span class=\"ov-event-type\"><i></i>"+e.type+"</span><p>"+e.text+"</p>"+
    "</article>";
  }).join("");

  root.innerHTML="<div class=\"page overview-page\">"+
    "<section class=\"ov-hero\">"+
      "<div class=\"ov-hero-copy\"><p class=\"page-kicker\">CRITICAL MINERALS · LIVE INTELLIGENCE</p><h1>情报总览</h1><p>汇聚关键矿产政策、市场、执法与研究成果，用一张动态态势图把风险变化、重点信号和最新行动串联起来。</p>"+
        "<div class=\"ov-hero-tags\"><span><i class=\"live\"></i>态势持续监测</span><span>数据截至 2026年7月</span><span>最近更新 "+latestEventDate+"</span></div>"+
      "</div>"+
      "<div class=\"ov-radar\" aria-label=\"政策态势雷达图，共"+totalPolicyCount+"组政策\">"+
        "<svg viewBox=\"0 0 220 220\" role=\"img\"><circle class=\"ov-radar-ring outer\" cx=\"110\" cy=\"110\" r=\"91\"></circle><circle class=\"ov-radar-ring\" cx=\"110\" cy=\"110\" r=\"66\"></circle><circle class=\"ov-radar-ring\" cx=\"110\" cy=\"110\" r=\"39\"></circle><path class=\"ov-radar-axis\" d=\"M110 19v182M19 110h182M46 46l128 128M174 46 46 174\"></path><path class=\"ov-radar-sweep\" d=\"M110 110 110 19A91 91 0 0 1 197 84Z\"></path><polygon class=\"ov-radar-shape\" points=\"110,39 169,76 157,147 91,176 45,113 70,61\"></polygon><circle class=\"ov-radar-pulse one\" cx=\"169\" cy=\"76\" r=\"4\"></circle><circle class=\"ov-radar-pulse two\" cx=\"45\" cy=\"113\" r=\"4\"></circle><circle class=\"ov-radar-pulse three\" cx=\"157\" cy=\"147\" r=\"4\"></circle></svg>"+
        "<div><strong>"+totalPolicyCount+"</strong><span>政策组</span><small>"+activePolicyPct+"% 现行</small></div>"+
      "</div>"+
    "</section>"+

    "<section class=\"ov-primary-grid\">"+
      "<div class=\"ov-metrics-grid\" aria-label=\"核心情报指标\">"+metricCards+"</div>"+
      "<article class=\"panel ov-status-panel\"><div class=\"panel-head\"><div><p class=\"ov-panel-kicker\">CONTROL STATUS</p><h2>管制状态构成</h2><p>现行与暂停政策占比</p></div></div>"+
        "<div class=\"ov-status-summary\"><div class=\"ov-donut\" style=\"--active-policy:"+activePolicyPct+"%\"><div><strong>"+activePolicyPct+"%</strong><span>现行</span></div></div>"+
          "<div class=\"ov-status-legend\"><span><i class=\"active\"></i><b>"+activeCount+"</b> 现行管制</span><span><i class=\"paused\"></i><b>"+pausedCount+"</b> 暂停政策</span><small>暂停措施到期日<br/><strong>"+pausedDeadline+"</strong></small></div></div>"+
        "<div class=\"ov-type-bars\">"+typeBars+"</div>"+
      "</article>"+
    "</section>"+

    "<section class=\"ov-lower-grid\">"+
      "<article class=\"panel ov-events-panel\"><div class=\"panel-head\"><div><p class=\"ov-panel-kicker\">LATEST SIGNALS</p><h2>最新动态</h2><p>政策更新、情报采集与案例归档</p></div><span class=\"ov-live-badge\"><i></i>LIVE</span></div><div class=\"ov-events-list\">"+eventRows+"</div></article>"+
      "<article class=\"panel ov-alert-panel\"><div class=\"panel-head\"><div><p class=\"ov-panel-kicker\">RISK WATCH</p><h2>重点预警</h2><p>需要持续跟进的风险信号</p></div><span class=\"ov-alert-count\">3</span></div><div class=\"ov-alert-list\">"+
        "<div class=\"ov-alert high\"><span class=\"ov-alert-level\">高</span><div><strong>暂停政策到期窗口</strong><p>"+pausedCount+"组政策将于"+pausedDeadline+"到期，需持续关注恢复、延期或调整信号。</p></div><i class=\"ov-alert-arrow\">↗</i></div>"+
        (priceAlerts.length>0?"<div class=\"ov-alert medium\"><span class=\"ov-alert-level\">中</span><div><strong>国外市场价格异动</strong><p>"+priceAlerts.map(function(m){return m.name+" "+(m.change>0?"+":"")+m.change+"%";}).join(" · ")+"</p></div><i class=\"ov-alert-arrow\">↗</i></div>":"")+
        "<div class=\"ov-alert medium\"><span class=\"ov-alert-level\">中</span><div><strong>执法案例关联监测</strong><p>"+caseCount+"条案例已归档，建议持续核查同类物项、主体和物流路径变化。</p></div><i class=\"ov-alert-arrow\">↗</i></div>"+
      "</div></article>"+
    "</section>"+
  "</div>";
}


﻿function renderTimelinePage(){
  var types={};
  for(var i=0;i<policyGroups.length;i++){
    var g=policyGroups[i];
    if(!types[g.type])types[g.type]=true;
  }
  var typeList=Object.keys(types).sort();
  var entryCounter=0;

  function renderTimelineAxis(){
    var yearGroups={};
    for(var i=0;i<policyGroups.length;i++){
      var g=policyGroups[i];
      var year=g.year;
      if(!yearGroups[year])yearGroups[year]=[];
      yearGroups[year].push(g);
    }
    var years=Object.keys(yearGroups).sort().reverse();
    var html="";
    for(var y=0;y<years.length;y++){
      var year=years[y];
      var groups=yearGroups[year];
      groups.sort(function(a,b){return b.date.localeCompare(a.date);});
      html+="<div class=\"tl-year-node\"><span>"+year+"</span></div>";
      for(var g=0;g<groups.length;g++){
        var p=groups[g];
        var side=entryCounter%2===0?"tl-left":"tl-right";
        entryCounter++;
        var isPaused=p.status==="paused";
        var pauseInfo=p.pauseDate?"<span class=\"tl-pause-badge\">暂停至 "+p.pauseDate+"</span>":"";
        var dotClass=isPaused?"paused":"active";
        var statusClass=isPaused?"tl-status-paused":"tl-status-active";
        html+="<div class=\"tl-row "+side+"\" data-tl-type=\""+p.type+"\" data-tl-status=\""+p.status+"\">"+
          "<div class=\"tl-card\">"+
          "<div class=\"tl-card-head\"><time>"+p.date+"</time><span class=\"tl-type-badge\">"+p.type+"</span><span class=\"tl-status-label "+statusClass+"\">"+p.statusText+"</span></div>"+
          "<div class=\"tl-card-body\"><strong>"+p.name+"</strong><span class=\"tl-symbol\">"+p.symbol+"</span><p>"+p.scopeShort+"</p>"+pauseInfo+"</div>"+
          "<div class=\"tl-card-foot\"><a href=\""+p.url+"\" target=\"_blank\" rel=\"noreferrer\">查看原公告</a>"+
          (p.pauseUrl?"<a href=\""+p.pauseUrl+"\" target=\"_blank\" rel=\"noreferrer\">暂停公告</a>":"")+
          "</div></div>"+
          "<div class=\"tl-dot "+dotClass+"\"></div>"+
          "<div class=\"tl-connector\"></div>"+
        "</div>";
      }
    }
    return html;
  }

  function applyFilter(){
    var items=document.querySelectorAll(".tl-row");
    var typeVal=document.querySelector("#tlTypeFilters .filter-chip.active")?.getAttribute("data-tl-type")||"all";
    var statusVal=document.querySelector("#tlStatusFilters .filter-chip.active")?.getAttribute("data-tl-status")||"all";
    for(var i=0;i<items.length;i++){
      var item=items[i];
      var t=item.getAttribute("data-tl-type");
      var s=item.getAttribute("data-tl-status");
      var show=(typeVal==="all"||typeVal===t)&&(statusVal==="all"||statusVal===s);
      item.style.display=show?"":"none";
    }
    var yearNodes=document.querySelectorAll(".tl-year-node");
    for(var i=0;i<yearNodes.length;i++){
      var yn=yearNodes[i];
      var next=yn.nextElementSibling;
      var hasVisible=false;
      while(next&&!next.classList.contains("tl-year-node")){
        if(next.classList.contains("tl-row")&&next.style.display!=="none"){hasVisible=true;break;}
        next=next.nextElementSibling;
      }
      yn.style.display=hasVisible?"":"none";
    }
    var emptyState=document.getElementById("tlEmptyState");
    var hasAny=false;
    for(var i=0;i<items.length;i++){if(items[i].style.display!=="none"){hasAny=true;break;}}
    if(emptyState)emptyState.style.display=hasAny?"none":"";
  }

  var axisHtml=renderTimelineAxis();
  root.innerHTML="<div class=\"page timeline-page\">"+
    "<header class=\"page-heading timeline-heading\"><div><p class=\"page-kicker\">POLICY TIMELINE</p><h1>政策时间轴</h1><p>按时间线追踪关键矿产出口管制政策的发布、调整与暂停动态。</p></div></header>"+
    "<div class=\"tl-filters\">"+
    "<div class=\"filter-group\" id=\"tlTypeFilters\">"+
    "<button class=\"filter-chip active\" data-tl-type=\"all\">全部类型</button>"+
    typeList.map(function(t){return "<button class=\"filter-chip\" data-tl-type=\""+t+"\">"+t+"</button>";}).join("")+
    "</div>"+
    "<div class=\"filter-group\" id=\"tlStatusFilters\">"+
    "<button class=\"filter-chip active\" data-tl-status=\"all\">全部状态</button>"+
    "<button class=\"filter-chip\" data-tl-status=\"active\">现行</button>"+
    "<button class=\"filter-chip\" data-tl-status=\"paused\">暂停</button>"+
    "</div></div>"+
    "<div class=\"tl-axis\">"+
    (axisHtml||"<div class=\"tl-empty-state\" id=\"tlEmptyState\"><p>没有匹配的政策事件</p></div>")+
    "</div></div>";

  document.querySelectorAll("#tlTypeFilters [data-tl-type]").forEach(function(btn){
    btn.addEventListener("click",function(){
      document.querySelectorAll("#tlTypeFilters [data-tl-type]").forEach(function(b){b.classList.toggle("active",b===this);},this);
      applyFilter();
    });
  });
  document.querySelectorAll("#tlStatusFilters [data-tl-status]").forEach(function(btn){
    btn.addEventListener("click",function(){
      document.querySelectorAll("#tlStatusFilters [data-tl-status]").forEach(function(b){b.classList.toggle("active",b===this);},this);
      applyFilter();
    });
  });
  applyFilter();
}

function renderPlaceholder(route){
  const m=modules[route];
  root.innerHTML=`<div class="page placeholder-page"><article class="placeholder-card"><span class="placeholder-icon">${m.icon}</span><p class="page-kicker">EXTENSIBLE MODULE</p><h1>${m.title}</h1><p>${m.desc}<br/>当前已完成应用骨架和路由接口，可在此模块继续接入数据与业务功能。</p><div class="module-map">${m.items.map(x=>`<span>${x}</span>`).join("")}</div><a class="button primary" href="#/export-controls" style="margin-top:24px">返回关键矿产清单</a></article></div>`;
}

function aiAnalysisMineralSelector(selected){
  return `<div class="mineral-selector ai-mineral-selector">
    <button class="mineral-selector-button" id="aiMineralSelectorButton" type="button" aria-expanded="false" aria-controls="aiMineralDropdown">
      <span>筛选关键矿产</span>
      <strong><b>${selected.symbol}</b>${selected.name}</strong>
      <i aria-hidden="true">⌄</i>
    </button>
    <div class="mineral-dropdown" id="aiMineralDropdown" hidden>
      <div class="mineral-dropdown-head"><strong>全部关键矿产</strong><span>${intelligenceMinerals.length} 项</span></div>
      <div class="mineral-option-list" role="listbox" aria-label="AI分析关键矿产列表">
        ${intelligenceMinerals.map(item=>`<button type="button" class="mineral-option ${item.id===selected.id?"active":""}" data-ai-mineral="${item.id}" role="option" aria-selected="${item.id===selected.id}"><b>${item.symbol}</b><span>${item.name}</span><small>${item.id==="tungsten"?"已分析":"待分析"}</small></button>`).join("")}
      </div>
    </div>
 </div>`;
}

function bindAiAnalysisMineralSelector(){
  const selectorButton=document.getElementById("aiMineralSelectorButton");
  const dropdown=document.getElementById("aiMineralDropdown");
  selectorButton?.addEventListener("click",()=>{
    const expanded=selectorButton.getAttribute("aria-expanded")==="true";
    selectorButton.setAttribute("aria-expanded",String(!expanded));
    dropdown.hidden=expanded;
  });
  document.querySelectorAll("[data-ai-mineral]").forEach(button=>button.addEventListener("click",()=>{
    aiAnalysisState.mineral=button.dataset.aiMineral;
    renderAiAnalysisPage();
  }));
}

function renderAiAnalysisPage(){
  const selected=intelligenceMinerals.find(item=>item.id===aiAnalysisState.mineral)||intelligenceMinerals[0];
  if(selected.id!=="tungsten"){
    root.innerHTML=`<div class="page ai-risk-page">
      <header class="page-heading ai-risk-heading">
        <div>
          <p class="page-kicker">AI ANALYST WORKSPACE · ${selected.symbol}</p>
          <h1>${selected.name}产品出口风险专题</h1>
          <p>面向${selected.name}相关政策、贸易、企业、物流与执法信息建立智能分析专题，支持证据核验、风险信号识别和分析成果沉淀。</p>
        </div>
        <div class="ai-analysis-meta">
          <span>专题矿产<strong>${selected.name} ${selected.symbol}</strong></span>
          <span>分析状态<strong>待接入专题数据</strong></span>
        </div>
      </header>
      ${aiAnalysisMineralSelector(selected)}
      <section class="panel intel-empty ai-analysis-empty">
        <span>${selected.symbol}</span>
        <h2>${selected.name}智能分析专题待接入</h2>
        <p>矿产筛选入口已建立。后续可接入文件库、开源信息情报、贸易数据、企业关系和执法案例，生成对应的风险分析结果。</p>
        <button class="button primary" type="button" data-ai-mineral-jump="tungsten">查看钨矿分析</button>
      </section>
    </div>`;
    bindAiAnalysisMineralSelector();
    document.querySelector("[data-ai-mineral-jump]")?.addEventListener("click",()=>{
      aiAnalysisState.mineral="tungsten";
      renderAiAnalysisPage();
    });
    decorateRenderedPage("ai-analysis");
    return;
  }
  const sourceLinks={
    domestic:"https://www.tclegal.cn/compliace-case-detail/?id=1956155943393816578&type=1",
    mofcomCase:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1291.html",
    tijo:"https://www.hntijo.cn/",
    aibiTrade:"https://www.trademo.com/companies/yiwu-aibi-supply-chain-management/49217745",
    notice:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_084ded0609404b2d81c746b31c9a03a6.html",
    mofcomFaq:"https://exportcontrol.mofcom.gov.cn/article/cjwt/202503/1112.html"
  };
  root.innerHTML=`<div class="page ai-risk-page">
    <header class="page-heading ai-risk-heading">
      <div>
        <p class="page-kicker">AI ANALYST WORKSPACE · TUNGSTEN</p>
        <h1>钨产品出口风险专题</h1>
        <p>以2025年2月4日第10号公告生效为时间起点，围绕受控钨材料的出口许可、申报和流向开展风险研判。公告生效前交易不纳入本专题违规风险统计。</p>
      </div>
      <div class="ai-analysis-meta">
        <span>专题矿产<strong>钨矿 W</strong></span>
        <span>分析日期<strong>2026.07.03</strong></span>
        <span>分析状态<strong>已按生效时间复核</strong></span>
      </div>
    </header>

    ${aiAnalysisMineralSelector(selected)}

    <section class="ai-executive-grid" aria-label="AI研判摘要">
      <article class="ai-executive-main">
        <div class="ai-executive-label"><span></span>AI研判摘要</div>
        <h2>先看结论，再下钻证据</h2>
        <p>当前专题把“已确认事实、待核线索、排除边界”分层展示，避免把公告生效前交易、贸易救济案件或管制范围外成品误判为出口管制违规。</p>
        <ul>
          <li><strong>已确认处罚</strong><span>境内公开案例显示管制生效后存在未申报钨粉夹藏。</span></li>
          <li><strong>优先核查</strong><span>重点放在中国原产碳化钨粉、供应商缺失和许可证待核记录。</span></li>
          <li><strong>审慎排除</strong><span>公告生效前记录、成品棒材和贸易救济材料不直接进入违规判断。</span></li>
        </ul>
      </article>
      <article class="ai-executive-side">
        <span class="ai-pulse-dot"></span>
        <small>当前判断</small>
        <strong>高优先调单</strong>
        <p>先调取原始报关单、许可证、发票和运输单证，再形成企业或物流链条结论。</p>
      </article>
    </section>

    <section class="ai-evidence-boundary" aria-label="证据边界">
      <strong>证据边界</strong>
      <p>仅将2025年2月4日以后、且货物形态可能属于第10号公告管制范围的记录纳入许可核查。公告生效前交易、贸易救济案件及管制范围外成品不作为中国出口管制违规线索。</p>
      <span>生效时间与物项范围双重校验</span>
    </section>

    <section class="ai-risk-metrics">
      <article><span>管制生效后官方处罚</span><strong>1</strong><small>境内公开案例</small></article>
      <article><span>许可核查优先线索</span><strong>4</strong><small>均为管制生效后记录</small></article>
      <article><span>关联主体替代证据</span><strong>0</strong><small>未发现可核验闭环</small></article>
      <article><span>管制后粉末定向匹配</span><strong>338</strong><small>中国原产 + 284990 · 交易行</small></article>
    </section>

    <section class="panel ai-post2022-panel ai-powder-panel">
      <div class="panel-head">
        <div><h2>2025年管制生效后碳化钨粉定向核验</h2><p>检索条件：TUNGSTEN CARBIDE POWDER + HS 284990 + 原产地中国；期间 2025-02-04—2026-07-03</p></div>
        <span class="panel-tag">338 条交易明细</span>
      </div>
      <div class="ai-powder-alert">
        <strong>本轮新增两条高优先核查链</strong>
        <p>一是99.98%碳化钨粉由中国原产、经韩国集团主体供货至越南关联工厂；二是供应商字段缺失的大宗碳化钨粉经伊朗进口数据记录、目的国字段标为土耳其。两类记录均只能证明商业数据库存在相应申报字段，是否已取得中国出口许可仍须调取原始单证。</p>
      </div>
      <div class="ai-post2022-table-wrap">
        <table class="ai-post2022-table ai-powder-table">
          <thead><tr><th>日期 / 路线</th><th>主体</th><th>货物与规模</th><th>可核验编号</th><th>研判</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>2026-05-19</strong><small>中国 → 越南 · AIR</small></td>
              <td>EHWA Diamond Ind. Co., Ltd.<br/>→ EHWA Global Co., Ltd.</td>
              <td>GWC200H碳化钨粉，CAS 12070-12-1，纯度99.98%<br/><code>28499000</code> · 20千克 · 1,028.40美元</td>
              <td>越南进口报关单 <code>108256803100</code><br/>进口商税号 <code>0801227806</code></td>
              <td><span class="ai-level settlement">高优先许可核验</span><small>供应商登记在韩国，但原产国字段为中国，实际中国出口主体待反查</small></td>
            </tr>
            <tr>
              <td><strong>2026-04-09</strong><small>中国 → 越南 · AIR</small></td>
              <td>EHWA Diamond Ind. Co., Ltd.<br/>→ EHWA Global Co., Ltd.</td>
              <td>同型号99.98%碳化钨粉<br/><code>28499000</code> · 20千克 · 926.40美元</td>
              <td>列表记录已确认；报关单号及许可证字段待调取</td>
              <td><span class="ai-level related">同链复核</span><small>与5月记录形成重复供货模式</small></td>
            </tr>
            <tr class="ai-powder-priority">
              <td><strong>2026-01-27</strong><small>中国 → 土耳其字段 · LAND</small></td>
              <td>供应商：NOT AVAILABLE<br/>申报/采购/报关：Asghar Sheikhkanloo Milan</td>
              <td>碳化钨粉<br/><code>28499000</code> · 净重1,860千克 · 毛重2,160千克 · 2托盘 · 55,441.12美元</td>
              <td>进口报关单 <code>37328474</code><br/>申报人代码 <code>4929496047</code></td>
              <td><span class="ai-level confirmed">高优先调单</span><small>供应商缺失、红色查验通道、边境小额贸易，且伊朗数据源与目的国TR字段交叉</small></td>
            </tr>
            <tr>
              <td><strong>2026-01-27</strong><small>中国 → 土耳其字段 · LAND</small></td>
              <td>供应商：NOT AVAILABLE<br/>采购商：Jahangir Delai Milan</td>
              <td>碳化钨粉<br/><code>28499000</code> · 910千克 · 27,124.42美元</td>
              <td>同日关联交易；原始报关单号待调取</td>
              <td><span class="ai-level settlement">高优先关联核验</span><small>与1,860千克记录的日期、路线、品名及缺失字段一致</small></td>
            </tr>
            <tr>
              <td><strong>2026-03-19</strong><small>上海 → 印度那瓦舍瓦 · SEA</small></td>
              <td>洛阳金鹭硬质合金工具有限公司<br/>→ Jasmina Enterprise</td>
              <td>GP10CU热喷涂合金粉：86%碳化钨、10%钴、4%铬<br/><code>28499020</code> · 260千克 · 29,195.12美元</td>
              <td>主单号 <code>6ZRAX790VK5FJ</code><br/>印度进口商税号 <code>AAKFJ2272R</code></td>
              <td><span class="ai-level lead">排除性样本</span><small>属于碳化钨合金粉，依商务部问答不纳入此次新增管制范围</small></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="ai-post2022-note">338条为商业数据库交易明细行，并非338票独立出口；同一印度进口批次会因港口字段和商品行拆分重复展示。土耳其方向记录的底层数据源标注为“伊朗（进口）”，同时目的国代码为TR、边境估价办公室为Bazargan、监管通道为RED，应调取伊朗/土耳其原始申报核对真实流向，不能仅凭数据库字段认定转运或走私。<a href="${sourceLinks.mofcomFaq}" target="_blank" rel="noopener">核对管制范围</a></p>
    </section>

    <section class="panel ai-subject-panel">
      <div class="panel-head">
        <div><h2>重点核查主体</h2><p>按公开证据强度分层，不把正常生产经营或单纯关联关系作为违规证据。</p></div>
        <span class="panel-tag">ENTITY SCREENING</span>
      </div>
      <div class="ai-table-wrap">
        <table class="ai-risk-table">
          <thead><tr><th>主体</th><th>角色</th><th>分层</th><th>公开依据</th><th>建议动作</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>长沙天久金属材料有限公司</strong><small>境内企业</small></td>
              <td>实际出口人</td>
              <td><span class="ai-level confirmed">已有处罚</span></td>
              <td>2025年2月夹藏20千克纯钨粉，未申报且无许可证；公开案例记载海关罚款1万元。</td>
              <td>调取报关单、合同、发票、货代委托及历史同类商品出口记录。<a href="${sourceLinks.domestic}" target="_blank" rel="noopener">查看来源</a></td>
            </tr>
            <tr>
              <td><strong>义乌市艾庇供应链管理有限公司</strong><small>境内企业</small></td>
              <td>上述钨粉报关单境内发货人</td>
              <td><span class="ai-level related">关联核查</span></td>
              <td>出现在报关单链路中；公开材料未显示其被处罚或明知夹藏。</td>
              <td>仅核验揽货、制单、查验和客户尽调记录，不作违规预判。</td>
            </tr>
            <tr>
              <td><strong>EHWA Diamond / EHWA Global</strong><small>韩国—越南关联供应链</small></td>
              <td>中国原产碳化钨粉供货与加工</td>
              <td><span class="ai-level settlement">许可核验</span></td>
              <td>2026年4月、5月两笔越南进口记录均显示中国原产99.98%碳化钨粉；供应商登记地址在韩国，实际中国出口主体未显示。</td>
              <td>凭越南报关单号反查商业发票、原产地证、中国出口报关单及两用物项出口许可证，不据此预判违法。</td>
            </tr>
            <tr>
              <td><strong>Asghar Sheikhkanloo Milan</strong><small>境外申报与报关主体</small></td>
              <td>大宗碳化钨粉采购/申报/报关</td>
              <td><span class="ai-level confirmed">高优先调单</span></td>
              <td>2026年1月记录显示1,860千克中国原产碳化钨粉，供应商为空；伊朗进口数据源与目的国TR字段并存，交易类型为边境小额贸易、监管通道为RED。</td>
              <td>调取报关单37328474及配套许可证、付款、承运和边境流向文件；该分层仅表示核查优先级，不表示违法认定。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel ai-affiliate-panel">
      <div class="panel-head">
        <div><h2>查发后关联主体替代核验</h2><p>围绕处罚企业、境内发货人及其关联主体检查成立时间、控制关系和查发后贸易变化，不把同一品牌、同一地址或正常关联交易直接认定为规避管制。</p></div>
        <span class="panel-tag">ENTITY SUBSTITUTION CHECK</span>
      </div>
      <div class="ai-association-conclusion">
        <strong>当前结论：未发现查发后更换关联企业继续出口受控钨物项的可核验证据</strong>
        <p>现有公开资料和可见贸易记录只能支持建立监测关系，不能形成“主体替换—同类货物—相同买方或路线—许可证缺失”的证据闭环。</p>
      </div>
      <div class="ai-association-grid">
        <article>
          <header><span class="ai-level related">关联企业 · 未触发预警</span><b>01</b></header>
          <h3>长沙天久 → 湖南心方天久</h3>
          <p>企业官网显示湖南心方天久为长沙天久全资子公司，成立于2023年，早于2025年2月的处罚事件，因此不能据成立时间推断为查发后新设替代主体。</p>
          <dl>
            <div><dt>关联依据</dt><dd>全资子公司、共用品牌与生产体系</dd></div>
            <div><dt>当前证据</dt><dd>未查到处罚后由子公司承接受控钨粉出口的可靠记录</dd></div>
            <div><dt>建议复核</dt><dd>比对两主体2025-02-24后钨粉报关、买方、产品规格和收款账户</dd></div>
          </dl>
          <a href="${sourceLinks.tijo}" target="_blank" rel="noopener">查看企业公开关系</a>
        </article>
        <article>
          <header><span class="ai-level lead">第三方发货人 · 持续监测</span><b>02</b></header>
          <h3>长沙天久 → 义乌市艾庇供应链</h3>
          <p>处罚记录显示义乌艾庇仅作为该票境内发货人，实际出口人为长沙天久；公开资料未显示两者存在股权或管理控制关系，不应标注为关联企业。</p>
          <dl>
            <div><dt>查发后记录</dt><dd>可见贸易数据主要为服装辅料、化纤织物，目的地为菲律宾和越南</dd></div>
            <div><dt>排除结果</dt><dd>未见钨、碳化钨或第10号公告相关税号继续出口记录</dd></div>
            <div><dt>建议复核</dt><dd>关注市场采购贸易中实际出口人与境内发货人频繁更换</dd></div>
          </dl>
          <a href="${sourceLinks.aibiTrade}" target="_blank" rel="noopener">查看公开贸易概览</a>
        </article>
        <article>
          <header><span class="ai-level settlement">上游主体缺失 · 高优先调单</span><b>03</b></header>
          <h3>中国原产碳化钨粉 → 境外申报主体</h3>
          <p>越南和伊朗来源记录中分别出现境外集团供货、供应商字段缺失等情况，但尚不能与境内处罚企业或其关联主体建立联系。</p>
          <dl>
            <div><dt>风险信号</dt><dd>中国原产、受控粉末、境外供应商或供应商缺失</dd></div>
            <div><dt>证据缺口</dt><dd>中国出口人、许可证号、付款方和承运委托方未形成闭环</dd></div>
            <div><dt>建议复核</dt><dd>以境外进口申报单反查中国出口报关单和许可证核销记录</dd></div>
          </dl>
        </article>
      </div>
      <p class="ai-association-note">预警触发规则：只有在查发后出现关联或新设主体，并同时满足同类受控物项、相同或高度重合买方/路线、许可证无法核验等条件时，才升级为“疑似主体替代”线索。</p>
    </section>

    <section class="ai-logistics-grid">
      <article class="panel ai-logistics-card">
        <div class="panel-head"><div><h2>境内申报线索</h2><p>钨粉夹藏未申报案件</p></div><span class="ai-level confirmed">处罚记录</span></div>
        <dl>
          <div><dt>报关单号</dt><dd><code>292120250000173735</code></dd></div>
          <div><dt>申报方式</dt><dd>市场采购贸易</dd></div>
          <div><dt>申报商品</dt><dd>无纺布包装袋等5项</dd></div>
          <div><dt>查发商品</dt><dd>未申报纯钨粉20千克</dd></div>
          <div><dt>集装箱 / 提运单</dt><dd>公开材料未披露</dd></div>
        </dl>
      </article>

      <article class="panel ai-logistics-card ai-image-audit">
        <div class="panel-head"><div><h2>境外查发图片核验</h2><p>对相关官方页面、协议附件和公开报道进行图片可读性筛查</p></div><span class="ai-level related">OCR 结果</span></div>
        <div class="ai-image-result">
          <span class="ai-image-zero">0</span>
          <div>
            <strong>未识别到可归属于钨产品查发案件的新编号</strong>
            <p>本轮检索到的美国司法部钨案件页面及和解协议未发布可判读的集装箱门号、封志或提运单照片；其他国家公开搜索结果亦未找到能够与钨产品案件可靠对应的现场图。</p>
          </div>
        </div>
        <p class="ai-ticket-note">下方两个集装箱号来自公开海运舱单，不是从查发图片中识别所得。图片来源与舱单来源已分开标记，避免把“图像疑似”误写成“执法确认”。</p>
      </article>
    </section>

    <section class="panel ai-container-panel">
      <div class="panel-head">
        <div><h2>境外集装箱号预警</h2><p>编号通过 ISO 6346 校验，且主体、货物、期间和路线与公开和解所述链路高度重合；仍须调取原始进口申报后才能定性。</p></div>
        <span class="panel-tag">CONTAINER ALERTS</span>
      </div>
      <div class="ai-container-grid">
        <article class="ai-container-alert">
          <div class="ai-container-id"><span>高匹配调查线索</span><code>NYKU8470587</code></div>
          <dl>
            <div><dt>主 / 分提运单</dt><dd><code>ONEYTPEC30794300</code><br/><code>EXDO6810851511</code></dd></div>
            <div><dt>封志号</dt><dd><code>TW279126A</code></dd></div>
            <div><dt>到港与货量</dt><dd>2022-07-01 · 纽瓦克<br/>293箱 · 4,902千克</dd></div>
            <div><dt>收发货人</dt><dd>CB CERATIZIT<br/>→ CERATIZIT USA INC.</dd></div>
          </dl>
          <footer><span>来源：公开舱单</span><a href="${sourceLinks.manifest}" target="_blank" rel="noopener">核对记录</a></footer>
        </article>
        <article class="ai-container-alert">
          <div class="ai-container-id"><span>高匹配调查线索</span><code>TCLU4520061</code></div>
          <dl>
            <div><dt>主 / 分提运单</dt><dd><code>ONEYTPEC08878400</code><br/><code>EXDO6810834510</code></dd></div>
            <div><dt>封志号</dt><dd>公开页面未披露</dd></div>
            <div><dt>到港与货量</dt><dd>2022-04-09 · 纽约/纽瓦克<br/>273箱 · 4,504千克</dd></div>
            <div><dt>收发货人</dt><dd>CB CERATIZIT<br/>→ CERATIZIT USA INC.</dd></div>
          </dl>
          <footer><span>来源：公开舱单聚合页</span><a href="${sourceLinks.panjiva}" target="_blank" rel="noopener">核对记录</a></footer>
        </article>
        <article class="ai-container-alert priority">
          <div class="ai-container-id"><span>美国申报核查 · 2023新增</span><code>EISU1868902</code></div>
          <dl>
            <div><dt>主 / 分提运单</dt><dd><code>EGLV003301951565</code><br/><code>RWRD001300185527</code></dd></div>
            <div><dt>封志号</dt><dd><code>EMCJYF5403</code></dd></div>
            <div><dt>到港与货量</dt><dd>2023-12-07 · 纽瓦克<br/>973箱 · 16,953千克</dd></div>
            <div><dt>收发货人</dt><dd>CB CERATIZIT TAIWAN CO., LTD.<br/>→ CERATIZIT USA INC.</dd></div>
          </dl>
          <div class="ai-container-cargo"><span>公开货描</span><strong>TUNGSTEN CARBIDE PUNCHING RODS</strong><small>21托盘 · 舱单税号字段 8311.90</small><small>成品棒材不属于2025年第10号公告新增管制范围</small></div>
          <footer><span>来源：美国进口公开舱单</span><a href="${sourceLinks.taiwanManifest}" target="_blank" rel="noopener">核对记录</a></footer>
        </article>
      </div>
      <p class="ai-container-caveat">预警含义：三票均处于美国政府所述的相关申报争议期间；其中2023年提单公开显示碳化钨冲压棒及税号字段8311.90，因此属于美国原产地、税号和反倾销税申报核查线索。该票早于中国2025年钨物项出口管制，且成品棒材不属于第10号公告新增管制范围；美国司法部也未在和解协议中点名单票或集装箱，不能表述为“已确认违法集装箱”。</p>
    </section>

    <section class="panel ai-bol-panel">
      <div class="panel-head"><div><h2>其余提运单线索</h2><p>均需结合进口申报、商业发票和原产地文件逐票复核。</p></div><span class="panel-tag">BILL OF LADING</span></div>
      <div class="ai-bol-list">
        <code>HDMUTPEM27921400 <i>/</i> EXDO6810850718</code>
        <code>ONEYTPEC11196500 <i>/</i> EXDO6810836283</code>
        <code>ONEYTPEC08878400 <i>/</i> EXDO6810834510</code>
        <code>HDMUTPEM31142700 <i>/</i> EXDO6810828878</code>
      </div>
    </section>

    <section class="panel ai-post2022-panel">
      <div class="panel-head"><div><h2>2022年以后新增提单记录</h2><p>公开页面可确认三票台湾主体对美发运；一票字段完整，两票受公开权限限制。</p></div><span class="panel-tag">POST-2022 RECORDS</span></div>
      <div class="ai-post2022-table-wrap">
        <table class="ai-post2022-table">
          <thead><tr><th>到港日期</th><th>发货人 → 收货人</th><th>公开货物信息</th><th>编号可见性</th><th>研判</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>2023-12-07</strong><small>高雄 → 纽瓦克</small></td>
              <td>CB Ceratizit Taiwan Co., Ltd.<br/>→ Ceratizit USA Inc.</td>
              <td>碳化钨冲压棒<br/>973箱 · 16,953千克</td>
              <td><code>EGLV003301951565</code><br/><code>RWRD001300185527</code><br/><code>EISU1868902</code></td>
              <td><span class="ai-level settlement">美国申报核查</span><small>货描与税号字段均可见</small></td>
            </tr>
            <tr>
              <td><strong>2023-12-04</strong><small>公开列表记录</small></td>
              <td>CB Ceratizit Taiwan Co., Ltd.<br/>→ Ceratizit USA Inc.</td>
              <td>公开页货描受遮蔽；文字结构与同批次碳化钨记录相近，但不据此直接确认。</td>
              <td>主分提运单及集装箱号未公开显示</td>
              <td><span class="ai-level related">待调单</span><small>不补猜缺失字段</small></td>
            </tr>
            <tr>
              <td><strong>2023-10-09</strong><small>公开列表记录</small></td>
              <td>CB Ceratizit Taiwan Co., Ltd.<br/>→ Ceratizit Sacramento LP</td>
              <td>公开页货描受遮蔽，仅能确认企业、日期及提单记录存在。</td>
              <td>主分提运单及集装箱号未公开显示</td>
              <td><span class="ai-level related">待调单</span><small>需取得原始舱单</small></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="ai-post2022-note">授权商业数据库精确检索进一步确认：CB CERATIZIT TAIWAN CO., LTD. 的相关结果按日期倒序仍停在2023年12月；当前检索范围内未发现2024年以后由同一台湾主体发出、且货描明确写明碳化钨的更新提单。<a href="${sourceLinks.taiwanPanjiva}" target="_blank" rel="noopener">三票公开列表</a></p>
    </section>

    <section class="ai-analysis-grid">
      <article class="panel ai-network-panel">
        <div class="panel-head"><div><h2>境内外企业关联链</h2><p>企业名称关联用于确定调单范围，不作为违法判断。</p></div><span class="panel-tag">ENTITY LINKAGE</span></div>
        <div class="ai-network-flow">
          <div><small>中国大陆网络节点</small><strong>CB-CERATIZIT（厦门）中国总部 / 厦门工厂</strong><span>官网可核验集团在厦门的生产与管理节点</span></div>
          <i>→</i>
          <div><small>台湾发货节点</small><strong>CB-CERATIZIT Taiwan Co., Ltd.</strong><span>公开舱单地址与官网“新北大道217号”集团总部地址匹配</span></div>
          <i>→</i>
          <div><small>美国进口节点</small><strong>Ceratizit USA Inc. / LLC</strong><span>公开舱单收货人；美国和解主体</span></div>
        </div>
        <p class="ai-network-note">和解协议显示 CBCT Group 为 Ever Spring International Holdings Ltd. 与 Ceratizit S.A. 各持50%的合资企业。官方文件只称相关货物在中国制造并经台湾转运，没有指明具体由哪一家中国大陆子公司生产；厦门节点因此只列为“企业网络核验节点”。<a href="${sourceLinks.locations}" target="_blank" rel="noopener">集团地址</a><a href="${sourceLinks.settlement}" target="_blank" rel="noopener">和解协议</a></p>
      </article>

      <article class="panel ai-anomaly-panel">
        <div class="panel-head"><div><h2>舱单数据异常提示</h2><p>跨平台字段冲突应优先核对原始 ACE 舱单和 CBP Entry Summary。</p></div><span class="ai-level settlement">待原件核验</span></div>
        <div class="ai-anomaly-list">
          <div class="priority"><code>RWRD001300185527</code><p>公开货描明确为碳化钨冲压棒，同时显示 HTS <strong>8311.90</strong>；该字段与美国和解协议所述需重点核验的申报模式一致。</p><a href="${sourceLinks.taiwanManifest}" target="_blank" rel="noopener">来源</a></div>
          <div><code>EXDO6810834510</code><p>Panjiva 页面显示 HTS <strong>6110.20</strong>，与钨制品描述和该供应商常见货物明显不一致。</p><a href="${sourceLinks.panjiva}" target="_blank" rel="noopener">来源</a></div>
          <div><code>EXDO6810836283</code><p>Zauba 页面将同一产品代码映射为 <strong>2105.00</strong>，与钨制品不一致。</p><a href="${sourceLinks.zauba}" target="_blank" rel="noopener">来源</a></div>
          <div><code>CB CERATIZIT PROFILE</code><p>另一聚合页显示常见出口税号 <strong>8708.30</strong>，亦与页面上的钨/碳化钨货描冲突。</p><a href="${sourceLinks.trademo}" target="_blank" rel="noopener">来源</a></div>
        </div>
        <p class="ai-anomaly-foot">这些差异可能来自聚合平台的字段错配、章节归类或解析错误，也可能提示申报字段异常；在取得原始申报文件前，不据此认定伪报。</p>
      </article>
    </section>

    <section class="panel ai-exclusion-panel">
      <div>
        <span class="ai-level related">排除性证据</span>
        <h2>贸易救济记录中的企业不自动进入高风险名单</h2>
        <p>欧盟钨碳化物复审材料涉及中国生产企业和反倾销措施，但这属于贸易救济调查，不等同于走私查发。本专题不因企业出现在复审文件中就将其标记为走私或违规主体。</p>
      </div>
      <a href="${sourceLinks.euReview}" target="_blank" rel="noopener">查看欧盟复审文件</a>
    </section>

    <section class="ai-findings-grid">
      <article class="panel ai-finding-card">
        <div class="panel-head"><div><h2>人员情况</h2><p>只展示公开文书明确披露的自然人。</p></div><span class="panel-tag">PEOPLE</span></div>
        <div class="ai-finding-body">
          <strong>本次中国出口方向：未发现可实名落地人员</strong>
          <p>境内钨粉案件没有公开负责人、货代人员或境外收货人姓名。商务部案例仅说明相关货代已被刑事立案，主体仍匿名。</p>
          <a href="${sourceLinks.mofcomCase}" target="_blank" rel="noopener">查看商务部匿名案例</a>
        </div>
      </article>

      <article class="panel ai-finding-card">
        <div class="panel-head"><div><h2>高频风险特征</h2><p>由文件库材料与公开执法案例交叉归纳。</p></div><span class="panel-tag">RISK SIGNALS</span></div>
        <div class="ai-signal-list">
          <span>市场采购夹藏</span><span>伪报品名与税号</span><span>C类快件小批量</span>
          <span>供应商字段缺失</span><span>流向字段交叉</span><span>许可证信息待核</span>
          <span>异常大宗粉末</span><span>最终用户不匹配</span>
        </div>
      </article>
    </section>

    <section class="panel ai-action-panel">
      <div class="panel-head"><div><h2>建议优先调取的原始材料</h2><p>仅围绕管制生效后的受控粉末记录核查许可、申报和真实流向。</p></div><span class="panel-tag">NEXT ACTIONS</span></div>
      <ol>
        <li><span>01</span><div><strong>中国出口报关单与许可证</strong><p>以境外进口申报单号反查中国出口报关单、两用物项出口许可证及许可证核销信息。</p></div></li>
        <li><span>02</span><div><strong>商业发票与产品技术资料</strong><p>核对品名、成分、纯度、形态、CAS号和商品编号，确认货物是否实际落入第10号公告管制范围。</p></div></li>
        <li><span>03</span><div><strong>运输与真实流向文件</strong><p>调取空运单、陆运单、付款和收货记录，核对申报目的国、进口数据源和最终收货地是否一致。</p></div></li>
        <li><span>04</span><div><strong>最终用户与最终用途材料</strong><p>核验境外买方、最终用户、用途说明及关联交易关系，避免仅凭企业名称或数据库字段作出结论。</p></div></li>
      </ol>
    </section>

    <section class="panel ai-control-panel">
      <div>
        <p class="page-kicker">CONTROL SCOPE</p>
        <h2>重点筛查税号与判定原则</h2>
        <p>优先关注 <code>8101100010</code>、<code>2841801000</code>、<code>28259012xx</code>、<code>2849902000</code>、<code>8101940001</code>、<code>8101991001</code>、<code>8101999001</code>。是否受控必须结合成分、形态、尺寸及技术参数，不能仅凭税号或企业名称定性。商务部问答明确：已烧结碳化钨、碳化钨板/块/棒/球、硬质合金钻头和刀片、冲压模具及铣刀等不属于此次新增管制范围。</p>
      </div>
      <div class="ai-control-actions"><a class="button" href="${sourceLinks.notice}" target="_blank" rel="noopener">查看第10号公告</a><a class="button" href="${sourceLinks.mofcomFaq}" target="_blank" rel="noopener">查看范围问答</a></div>
    </section>
  </div>`;
  root.querySelectorAll(".ai-image-audit,.ai-container-panel,.ai-bol-panel,.ai-post2022-panel:not(.ai-powder-panel),.ai-analysis-grid,.ai-exclusion-panel").forEach(section=>section.remove());
  bindAiAnalysisMineralSelector();
  decorateRenderedPage("ai-analysis");
}

function renderResearchToolPage(route){
  const tool=researchToolPages[route];
  const reportDocuments=route==="ai-report"?`
    <section class="panel ai-report-library">
      <div class="panel-head">
        <div><h2>已生成报告</h2><p>正式报告已归档，可直接查看或下载 Word 原文。</p></div>
        <span class="panel-tag">${aiReportDocuments.length} REPORTS</span>
      </div>
      <div class="ai-report-document-grid">
        ${aiReportDocuments.map((report,index)=>`
          <article class="ai-report-document">
            <div class="ai-report-document-icon"><span>DOCX</span><b>${String(index+1).padStart(2,"0")}</b></div>
            <div class="ai-report-document-body">
              <div class="ai-report-document-meta"><strong>${report.type}</strong><span>${report.code}</span></div>
              <h3>${report.title}</h3>
              <div class="ai-report-document-actions">
                <a class="button primary" href="${report.href}" target="_blank" rel="noreferrer">查看报告</a>
                <a class="button" href="${report.href}" download>下载 Word</a>
              </div>
            </div>
          </article>`).join("")}
      </div>
    </section>`:"";
  root.innerHTML=`<div class="page research-tool-page">
    <header class="page-heading research-tool-heading">
      <div>
        <p class="page-kicker">${tool.kicker}</p>
        <h1>${modules[route].title}</h1>
        <p>${tool.summary}</p>
      </div>
      ${route==="ai-report"?"":`<span class="research-blueprint-badge">模块蓝图 · ${tool.badge}</span>`}
    </header>

    ${route==="ai-report"?"":`<section class="research-scope-strip">
      <div><span>当前定位</span><strong>${modules[route].desc}</strong></div>
      <div><span>数据底座</span><strong>文件库 · 情报快照 · 态势数据 · 关系数据</strong></div>
      <div><span>建设状态</span><strong>信息架构已定义 · 后端能力待接入</strong></div>
    </section>`}

    ${reportDocuments}

    ${route==="ai-report"?"":`<section class="research-blueprint-grid">
      ${tool.sections.map((section,index)=>`<article class="research-blueprint-card">
        <header><span>${String(index+1).padStart(2,"0")}</span><div><small>${section.tag}</small><h2>${section.title}</h2></div></header>
        <ul>${section.items.map(item=>`<li>${item}</li>`).join("")}</ul>
      </article>`).join("")}
    </section>

    <section class="panel research-flow-panel">
      <div class="panel-head"><div><h2>建议工作流程</h2><p>按实际业务任务组织页面操作，所有AI结论均保留来源与人工审核入口。</p></div><span class="panel-tag">WORKFLOW</span></div>
      <div class="research-flow">
        ${tool.flow.map((step,index)=>`<div><b>${index+1}</b><span>${step}</span></div>${index<tool.flow.length-1?`<i>→</i>`:""}`).join("")}
      </div>
    </section>

    <section class="research-output-panel">
      <div><p class="page-kicker">EXPECTED OUTPUTS</p><h2>模块主要产出</h2></div>
      <div>${tool.outputs.map(output=>`<span>${output}</span>`).join("")}</div>
    </section>`}
  </div>`;
}

function renderAiDeepResearchPageLegacy(){
  const viewpoints=[
    ["01","工具竞争升级","关键矿产博弈已由单一出口许可扩展为投资、价格保障、战略储备、联盟融资与贸易救济的组合工具竞争。"],
    ["02","加工能力是核心瓶颈","矿山扩张无法直接替代中国供应，分离冶炼、材料纯化、磁体制造和规模化工艺经验更难复制。"],
    ["03","2025—2030高风险窗口","中国管制工具已趋成熟，而境外替代产能尚未形成规模，政策冲击与产能建设存在明显时间错配。"],
    ["04","国别路径差异显著","美国侧重国防动员与资本工具，欧盟侧重法规和循环利用，日本侧重长期承购，韩国侧重库存和产业稳定。"],
    ["05","监管需穿透多维关系","海关识别应从税号筛查升级为成分、形态、技术参数、最终用户、物流路径和资金流联合研判。"],
    ["06","企业风险必须证据闭环","关联关系本身不是违规证据；主体替换、同类受控物项、重合买方路线与许可证缺口共同出现时才应升级预警。"]
  ];
  root.innerHTML=`<div class="page deep-research-page">
    <header class="page-heading deep-research-heading">
      <div>
        <p class="page-kicker">AGENTIC DEEP RESEARCH</p>
        <h1>AI深度研究</h1>
        <p>AI Agent围绕“全球关键矿产管制—反管制体系与海关监管应对”完成问题拆解、多轮检索、证据分级、交叉研判和专题报告编排。</p>
      </div>
      <span class="deep-status"><i></i>研究任务已完成</span>
    </header>

    <section class="deep-metrics">
      <article><span>专题报告规模</span><strong>约 8.5 万字</strong><small>626 个正文段落</small></article>
      <article><span>来源与脚注</span><strong>524</strong><small>网页来源逐条脚注</small></article>
      <article><span>结构化成果</span><strong>26</strong><small>政策、项目及产能表格</small></article>
      <article><span>研究范围</span><strong>2023—2026</strong><small>政策与产业动态</small></article>
    </section>


    <section class="panel deep-report-card">
      <div class="deep-report-mark"><span>DOCX</span><strong>AI</strong></div>
      <div class="deep-report-copy">
        <p class="page-kicker">FINAL RESEARCH DELIVERABLE</p>
        <h2>全球关键矿产“管制—反管制”体系与海关监管应对</h2>
        <p>覆盖中国出口管制体系、美欧日韩反制政策、矿产与加工项目、企业和承购关系、替代技术、战略储备及海关监管风险。</p>
        <div><span>证据分级</span><span>脚注溯源</span><span>人工审核框架</span><span>系统已归档</span></div>
      </div>
      <div class="deep-report-actions">
        <a class="button primary" href="./reports/ai-deep-research-counter-controls-2026.docx" target="_blank" rel="noreferrer">查看专题报告</a>
        <a class="button" href="./reports/ai-deep-research-counter-controls-2026.docx" download>下载 Word</a>
        <a class="button" href="#/ai-report">转入AI战略报告</a>
      </div>
    </section>

    <section class="panel deep-flow-panel">
      <div class="panel-head"><div><h2>AI Agent研究链路</h2><p>从问题定义到报告归档保留完整的研究过程与人工复核入口。</p></div><span class="panel-tag">6 STAGES</span></div>
      <div class="deep-flow">
        ${[
          ["01","任务拆解","政策、国家、产业、企业、监管"],
          ["02","多源检索","政府、海关、法院、企业、贸易数据"],
          ["03","信息提取","政策、税号、企业、项目与物流关系"],
          ["04","交叉核验","时间适用、来源冲突与证据分级"],
          ["05","分析生成","观点、风险矩阵、关系网络与图表"],
          ["06","审核归档","Word报告、脚注和系统文件库"]
        ].map(item=>`<article><b>${item[0]}</b><strong>${item[1]}</strong><span>${item[2]}</span><i>✓</i></article>`).join("")}
      </div>
    </section>

    <section class="deep-section-head"><div><p class="page-kicker">KEY FINDINGS</p><h2>主要战略观点</h2></div><p>下列观点从报告正文提炼，事实、研判和预测在Word报告中分别标注来源与证据边界。</p></section>
    <section class="deep-viewpoint-grid">
      ${viewpoints.map(item=>`<article><span>${item[0]}</span><h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}
    </section>

    <section class="deep-two-column">
      <article class="panel deep-evidence-panel">
        <div class="panel-head"><div><h2>证据分级与来源审计</h2><p>来源数量不等于证据质量，关键结论优先回溯官方原文。</p></div><span class="panel-tag">EVIDENCE</span></div>
        <div class="deep-evidence-ring"><div><strong>524</strong><span>来源链接</span></div></div>
        <div class="deep-evidence-bars">
          <div><header><strong>A级 · 官方及国际组织</strong><span>约 11%</span></header><i><b style="width:11%"></b></i><p>政府、海关、法院、监管机构及国际组织。</p></div>
          <div><header><strong>B级 · 企业及专业机构</strong><span>交叉核验</span></header><i><b style="width:58%"></b></i><p>企业公告、行业机构和可复核贸易记录。</p></div>
          <div><header><strong>C级 · 聚合与二手线索</strong><span>仅作线索</span></header><i><b style="width:31%"></b></i><p>新闻聚合、行业博客和单一二手来源。</p></div>
        </div>
      </article>

      <article class="panel deep-risk-panel">
        <div class="panel-head"><div><h2>海关监管风险矩阵</h2><p>按发生可能性和监管影响确定优先核查方向。</p></div><span class="panel-tag">RISK MATRIX</span></div>
        <div class="deep-risk-matrix">
          <div class="high"><b>高影响 / 高可能</b><strong>伪报品名、税号与技术参数</strong><span>许可证与实物一致性核验</span></div>
          <div class="high"><b>高影响 / 中可能</b><strong>第三方发货与主体替换</strong><span>穿透实际出口人与关联网络</span></div>
          <div class="medium"><b>中影响 / 高可能</b><strong>最终用户和用途偏离</strong><span>核验合同、付款与真实流向</span></div>
          <div class="medium"><b>中影响 / 中可能</b><strong>技术资料非货物化传输</strong><span>审查云端、邮件与远程访问</span></div>
        </div>
      </article>
    </section>

    <section class="panel deep-network-panel">
      <div class="panel-head"><div><h2>全球“管制—反管制”关系网络</h2><p>政策冲击沿资源、加工、制造和监管节点向下游传导。</p></div><span class="panel-tag">RELATION NETWORK</span></div>
      <div class="deep-network">
        <div class="deep-network-core"><span>中国</span><strong>出口管制工具</strong><small>许可 · 清单 · 技术 · 最终用途</small></div>
        <i>→</i>
        <div class="deep-network-countries">
          <article><b>美国</b><span>国防投资 · 价格保障 · 储备</span></article>
          <article><b>欧盟</b><span>CRMA · 战略项目 · 循环利用</span></article>
          <article><b>日本</b><span>JOGMEC · 长期承购 · 资源外交</span></article>
          <article><b>韩国</b><span>库存 · 产业基金 · 供应稳定</span></article>
        </div>
        <i>→</i>
        <div class="deep-network-output"><span>供应链重构</span><strong>矿山 → 分离 → 材料 → 制造</strong><small>海关监管 · 企业合规 · 风险预警</small></div>
      </div>
    </section>
  </div>`;
}

function escapeLibraryText(value){
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
}

function snapshotToLibraryFile(item,index){
  const content=[
    `# ${item.titleZh}`,"",`来源：${item.sourceName}`,`原文发布日期：${item.sourcePublished}`,
    `采集日期：${item.collectedAt}`,`翻译状态：${item.translationStatus}`,"","## 内容摘要",item.summaryZh,"",
    ...(item.sectionsZh||[]).flatMap(section=>[`## ${section.title}`,section.body,""]),
    "## 关键事实",...(item.factsZh||[]).map(fact=>`- ${fact}`),"",`原文地址：${item.sourceUrl}`
  ].join("\n");
  const isForeign=item.sourceLanguage!=="zh-CN";
  return {
    id:`snapshot-${item.id}`,name:`${item.titleZh}${isForeign?"（中文编译）":""}.md`,extension:"MD",
    type:"document",typeName:"文档",source:"collected",sourceName:"已采集",date:item.collectedAt,
    size:`${Math.max(4,Math.round(content.length/500))} KB`,mineral:"钨",category:item.category,
    content,url:item.sourceUrl,sort:index
  };
}

function announcementLibraryFile(){
  const head=["公告","发布日期","商品/物项","两用物项管制编码","参考海关商品编号/税则号列","状态","官方原文"];
  const rows=[head,...announcementItems.map(item=>[item.notice,item.date,item.item,item.controlCode,item.hsCode,item.statusText,item.source])];
  const content="\ufeff"+rows.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
  return {
    id:"generated-announcement-csv",name:"公告商品与税号清单.csv",extension:"CSV",type:"spreadsheet",typeName:"表格",
    source:"generated",sourceName:"已生成",date:"2026-07-02",size:`${Math.max(8,Math.round(content.length/700))} KB`,
    mineral:"全部矿产",category:"结构化数据",content,sort:100
  };
}

function deepResearchLibraryFileLegacy(){
  return {
    id:"generated-ai-deep-research-2026",
    name:"AI深度研究_全球关键矿产管制反制与海关监管应对.docx",
    extension:"DOCX",
    type:"document",
    typeName:"文档",
    source:"generated",
    sourceName:"AI深度研究",
    date:"2026-07-05",
    size:"1.9 MB",
    mineral:"全部矿产",
    category:"战略研究报告",
    content:"AI Agent深度研究专题报告，约8.5万字，覆盖全球关键矿产出口管制、境外反制政策、供应链重构、企业项目与海关监管应对，并保留524条脚注来源。",
    downloadUrl:"./reports/ai-deep-research-counter-controls-2026.docx",
    sort:-100
  };
}

function caseToLibraryFile(item,index){
  const content=[
    `# ${item.title}`,"",`采集日期：${item.collectedAt}`,`执法国家：${item.country}`,
    `执法机构：${item.agency}`,`涉案物项：${item.mineral}`,`案件时间：${item.date}`,
    `案件状态：${item.status}`,`流向：${item.direction}`,"","## 案情摘要",item.finding,"",`公开来源：${item.source}`
  ].join("\n");
  return {
    id:`case-archive-${index}`,name:`执法案例_${item.title}.md`,extension:"MD",type:"document",typeName:"文档",
    source:"collected",sourceName:"采集归档",date:item.collectedAt,size:`${Math.max(2,Math.round(content.length/500))} KB`,
    mineral:item.mineral,category:"执法案例",content,url:item.source,sort:120+index
  };
}

function libraryFiles(){
  const snapshots=(window.intelligenceSnapshots||[]).map(snapshotToLibraryFile);
  const caseArchives=tungstenCases.map(caseToLibraryFile);
  const indexedFiles=window.importedLibraryIndex||[];
  return [...importedLibraryFiles,deepResearchLibraryFile(),...indexedFiles,...snapshots,...caseArchives,announcementLibraryFile()].sort((a,b)=>b.date.localeCompare(a.date)||a.sort-b.sort);
}

function filteredLibraryFiles(){
  const query=libraryState.query.trim().toLowerCase();
  return libraryFiles().filter(file=>{
    const matchesQuery=!query||[file.name,file.mineral,file.category,file.sourceName].some(value=>String(value||"").toLowerCase().includes(query));
    return matchesQuery&&(libraryState.source==="all"||file.source===libraryState.source)&&(libraryState.type==="all"||file.type===libraryState.type);
  });
}

function libraryFileIcon(file){
  return ({document:"DOC",spreadsheet:"XLS",pdf:"PDF",image:"IMG",presentation:"PPT",data:"DAT"}[file.type]||file.extension.slice(0,3).toUpperCase());
}

function libraryPageTokens(current,total){
  if(total<=7)return Array.from({length:total},(_,index)=>index+1);
  const pages=new Set([1,total,current-1,current,current+1]);
  const sorted=[...pages].filter(page=>page>=1&&page<=total).sort((a,b)=>a-b);
  const tokens=[];
  sorted.forEach((page,index)=>{
    if(index&&page-sorted[index-1]>1)tokens.push("ellipsis");
    tokens.push(page);
  });
  return tokens;
}

function renderFileLibraryPage(){
  root.innerHTML=`<div class="page library-page">
    <header class="page-heading library-heading">
      <div><p class="page-kicker">KNOWLEDGE LIBRARY</p><h1>文件库</h1><p>每次情报采集都会自动归档到文件库。每页展示10条，支持搜索、筛选、全文预览与下载。</p></div>
      <div class="page-actions">
        <span class="library-storage"><b>${libraryFiles().length}</b> 个文件</span>
        <label class="button primary library-upload">＋ 导入文件<input id="libraryUpload" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.json,.html,.ppt,.pptx" hidden></label>
      </div>
    </header>
    <section class="panel library-shell">
      <div class="library-toolbar">
        <label class="search-field library-search"><span>⌕</span><input id="librarySearch" placeholder="搜索文件名、矿产或资料类型…" value="${escapeLibraryText(libraryState.query)}"></label>
        <div class="filter-group library-source-filters" aria-label="来源筛选">
          <button class="filter-chip ${libraryState.source==="all"?"active":""}" data-library-source="all">全部</button>
          <button class="filter-chip ${libraryState.source==="collected"?"active":""}" data-library-source="collected">已采集</button>
          <button class="filter-chip ${libraryState.source==="generated"?"active":""}" data-library-source="generated">已生成</button>
          <button class="filter-chip ${libraryState.source==="uploaded"?"active":""}" data-library-source="uploaded">已导入</button>
        </div>
        <select class="year-select library-type-select" id="libraryType" aria-label="文件类型">
          <option value="all">全部类型</option><option value="document">文档</option><option value="spreadsheet">表格</option>
          <option value="pdf">PDF</option><option value="presentation">演示文稿</option><option value="data">数据文件</option>
        </select>
        <div class="library-view-switch" aria-label="视图切换">
          <button class="${libraryState.view==="grid"?"active":""}" data-library-view="grid" title="网格视图">▦</button>
          <button class="${libraryState.view==="list"?"active":""}" data-library-view="list" title="列表视图">☷</button>
        </div>
      </div>
      <div class="library-meta"><span>共 <b id="libraryResultCount">0</b> 个文件</span><span>文件仅保存在当前项目及本次浏览器会话中</span></div>
      <div id="libraryFileArea"></div>
    </section>
  </div>`;
  document.getElementById("libraryType").value=libraryState.type;
  document.getElementById("librarySearch").addEventListener("input",event=>{libraryState.query=event.target.value;libraryState.page=1;renderLibraryFiles()});
  document.getElementById("libraryType").addEventListener("change",event=>{libraryState.type=event.target.value;libraryState.page=1;renderLibraryFiles()});
  document.querySelectorAll("[data-library-source]").forEach(button=>button.addEventListener("click",()=>{
    libraryState.source=button.dataset.librarySource;
    libraryState.page=1;
    document.querySelectorAll("[data-library-source]").forEach(item=>item.classList.toggle("active",item===button));
    renderLibraryFiles();
  }));
  document.querySelectorAll("[data-library-view]").forEach(button=>button.addEventListener("click",()=>{
    libraryState.view=button.dataset.libraryView;
    document.querySelectorAll("[data-library-view]").forEach(item=>item.classList.toggle("active",item===button));
    renderLibraryFiles();
  }));
  document.getElementById("libraryUpload").addEventListener("change",importLibraryFiles);
  renderLibraryFiles();
  decorateRenderedPage("countries");
}

function renderLibraryFiles(){
  const files=filteredLibraryFiles();
  const area=document.getElementById("libraryFileArea");
  const count=document.getElementById("libraryResultCount");
  if(!area||!count)return;
  count.textContent=files.length;
  const totalPages=Math.max(1,Math.ceil(files.length/libraryState.pageSize));
  libraryState.page=Math.min(Math.max(1,libraryState.page),totalPages);
  const start=(libraryState.page-1)*libraryState.pageSize;
  const visibleFiles=files.slice(start,start+libraryState.pageSize);
  area.className=`library-files ${libraryState.view}`;
  area.innerHTML=files.length?`${visibleFiles.map(file=>`<article class="library-file-card">
    <button class="library-file-open" data-library-open="${escapeLibraryText(file.id)}" type="button">
      <span class="library-file-icon ${file.type}">${libraryFileIcon(file)}</span>
      <span class="library-file-copy"><strong title="${escapeLibraryText(file.name)}">${escapeLibraryText(file.name)}</strong><small>${escapeLibraryText(file.typeName)} · ${escapeLibraryText(file.size)}</small></span>
    </button>
    <div class="library-file-tags"><span>${escapeLibraryText(file.mineral)}</span><span>${escapeLibraryText(file.category)}</span></div>
    <div class="library-file-foot"><span class="library-source ${file.source}">${escapeLibraryText(file.sourceName)}</span><time>${escapeLibraryText(file.date)}</time><button type="button" data-library-download="${escapeLibraryText(file.id)}" title="下载">↓</button></div>
  </article>`).join("")}
    <nav class="library-pagination" aria-label="文件库分页">
      <button type="button" data-library-page="${libraryState.page-1}" ${libraryState.page===1?"disabled":""}>← 上一页</button>
      <div class="library-page-numbers">${libraryPageTokens(libraryState.page,totalPages).map(token=>token==="ellipsis"?`<span>…</span>`:`<button type="button" data-library-page="${token}" class="${token===libraryState.page?"active":""}" aria-current="${token===libraryState.page?"page":"false"}">${token}</button>`).join("")}</div>
      <span class="library-page-status">第 ${libraryState.page} / ${totalPages} 页</span>
      <button type="button" data-library-page="${libraryState.page+1}" ${libraryState.page===totalPages?"disabled":""}>下一页 →</button>
    </nav>`:`<div class="library-empty"><span>⌕</span><strong>没有找到文件</strong><p>换一个关键词或清除筛选条件后再试。</p></div>`;
  area.querySelectorAll("[data-library-open]").forEach(button=>button.addEventListener("click",()=>openLibraryFile(button.dataset.libraryOpen)));
  area.querySelectorAll("[data-library-download]").forEach(button=>button.addEventListener("click",()=>downloadLibraryFile(button.dataset.libraryDownload)));
  area.querySelectorAll("[data-library-page]").forEach(button=>button.addEventListener("click",()=>{
    libraryState.page=Number(button.dataset.libraryPage);
    renderLibraryFiles();
    document.querySelector(".library-shell")?.scrollIntoView({behavior:"auto",block:"start"});
  }));
  decorateRenderedPage("countries");
}

async function importLibraryFiles(event){
  const files=[...event.target.files];
  for(const [index,file] of files.entries()){
    const extension=(file.name.split(".").pop()||"FILE").toUpperCase();
    const type=/pdf/i.test(file.type)||extension==="PDF"?"pdf":/sheet|excel|csv/i.test(file.type)||["XLS","XLSX","CSV"].includes(extension)?"spreadsheet":/presentation|powerpoint/i.test(file.type)||["PPT","PPTX"].includes(extension)?"presentation":/json/i.test(file.type)||extension==="JSON"?"data":"document";
    const readable=/^(text\/|application\/(json|xml))/.test(file.type)||["CSV","TXT","MD","JSON","HTML"].includes(extension);
    const content=readable?await file.text():"该文件已导入当前浏览器会话。此格式暂不支持在线全文解析，可下载后使用本地应用查看。";
    importedLibraryFiles.unshift({
      id:`uploaded-${Date.now()}-${index}`,name:file.name,extension,type,typeName:{pdf:"PDF",spreadsheet:"表格",presentation:"演示文稿",data:"数据文件",document:"文档"}[type],
      source:"uploaded",sourceName:"已导入",date:new Date().toISOString().slice(0,10),size:`${file.size>1048576?(file.size/1048576).toFixed(1)+" MB":Math.max(1,Math.round(file.size/1024))+" KB"}`,
      mineral:"未分类",category:"本地导入",content,fileObject:file,sort:-index
    });
  }
  event.target.value="";
  libraryState.page=1;
  renderFileLibraryPage();
}

function openLibraryFile(id){
  const file=libraryFiles().find(item=>item.id===id);
  if(!file)return;
  document.getElementById("dialogContent").innerHTML=`<div class="dialog-body library-dialog-body">
    <div class="library-dialog-head"><span class="library-file-icon ${file.type}">${libraryFileIcon(file)}</span><div><span class="library-source ${file.source}">${escapeLibraryText(file.sourceName)}</span><h2>${escapeLibraryText(file.name)}</h2><p class="dialog-sub">${escapeLibraryText(file.typeName)} · ${escapeLibraryText(file.size)} · ${escapeLibraryText(file.date)}</p></div></div>
    <section class="detail-block"><h3>FILE PREVIEW / 文件预览</h3><pre class="library-preview">${escapeLibraryText(file.content||"暂无可预览内容")}</pre></section>
    <div class="library-dialog-actions"><button class="button primary" id="libraryDialogDownload" type="button">↓ 下载文件</button>${file.url?`<a class="button" href="${escapeLibraryText(file.url)}" target="_blank" rel="noreferrer">打开原文 ↗</a>`:""}</div>
  </div>`;
  document.getElementById("libraryDialogDownload").addEventListener("click",()=>downloadLibraryFile(id));
  dialog.showModal();
}

function downloadLibraryFile(id){
  const file=libraryFiles().find(item=>item.id===id);
  if(!file)return;
  const anchor=document.createElement("a");
  if(file.downloadUrl){
    anchor.href=file.downloadUrl;
    anchor.download=file.name;
    anchor.click();
    return;
  }
  const blob=file.fileObject||new Blob([file.content||""],{type:file.type==="spreadsheet"?"text/csv;charset=utf-8":"text/plain;charset=utf-8"});
  anchor.href=URL.createObjectURL(blob);
  anchor.download=file.name;
  anchor.click();
  setTimeout(()=>URL.revokeObjectURL(anchor.href),1000);
}

function openDetail(id){
  const p=policies.find(x=>x.id===id); if(!p)return;
  document.getElementById("dialogContent").innerHTML=`<div class="dialog-body"><span class="dialog-symbol">${p.symbol}</span><span class="status-pill ${p.status}">${p.statusText}</span><h2>${p.name}</h2><p class="dialog-sub">${p.date} · ${p.type}${p.pauseDate?` · 暂停公告日期 ${p.pauseDate}`:""}</p><section class="detail-block"><h3>CONTROL SCOPE / 管制范围</h3><p>${p.scope}</p></section><section class="detail-block"><h3>CONTROL METHOD / 管制手段</h3><p>${p.method}</p></section><section class="detail-block"><h3>PRIMARY SOURCE / 政策来源</h3><p>${p.source}</p><div class="source-actions"><a class="source-link" href="${p.url}" target="_blank" rel="noreferrer">打开原公告 ↗</a>${p.pauseUrl?`<a class="source-link pause" href="${p.pauseUrl}" target="_blank" rel="noreferrer">打开第70号暂停公告 ↗</a>`:""}</div></section></div>`;
  dialog.showModal();
}

function downloadCSV(){
  const head=["矿产/材料","类别","原公告日期","暂停公告日期","范围","状态","政策来源","原公告链接","暂停公告链接"];
  const lines=[head,...filteredPolicies().map(p=>[p.name,p.type,p.date,p.pauseDate||"",p.scopeShort,p.statusText,p.source,p.url,p.pauseUrl||""])].map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob(["\ufeff"+lines],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="关键矿产出口管制清单.csv";a.click();URL.revokeObjectURL(a.href);
}

function openCommand(){
  commandMask.hidden=false; commandInput.value=""; renderCommandResults(""); setTimeout(()=>commandInput.focus(),0);
}
function closeCommand(){commandMask.hidden=true}
function renderCommandResults(query){
  const q=query.trim().toLowerCase();
  const rows=policies.filter(p=>!q||[p.name,p.type,p.source].join(" ").toLowerCase().includes(q)).slice(0,7);
  document.getElementById("commandResults").innerHTML=rows.map(p=>`<button class="command-result" data-id="${p.id}"><span>${p.name}</span><span>${p.type} · ${p.date}</span></button>`).join("")||`<div class="empty">没有匹配记录</div>`;
  document.querySelectorAll(".command-result").forEach(btn=>btn.addEventListener("click",()=>{closeCommand();location.hash="#/export-controls";setTimeout(()=>openDetail(btn.dataset.id),0)}));
}

function closeMobileNav(){document.getElementById("sidebar").classList.remove("open");document.getElementById("mobileMask").classList.remove("show")}
document.getElementById("menuButton").addEventListener("click",()=>{document.getElementById("sidebar").classList.add("open");document.getElementById("mobileMask").classList.add("show")});
document.getElementById("mobileMask").addEventListener("click",closeMobileNav);
document.getElementById("globalSearch").addEventListener("click",openCommand);
commandInput.addEventListener("input",e=>renderCommandResults(e.target.value));
commandMask.addEventListener("click",e=>{if(e.target===commandMask)closeCommand()});
document.getElementById("dialogClose").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openCommand()}if(e.key==="Escape"){closeCommand();if(dialog.open)dialog.close()}});
window.addEventListener("hashchange",render);
render();

function renderAiDeepResearchPagePrevious(){
  const viewpoints=[
    ["01","竞争工具正在组合化","关键矿产博弈已从单一出口许可，扩展到价格保障、战略储备、政策性融资、长期承购和产业联盟。监管研判需要同时观察政策、资本与贸易流。"],
    ["02","加工能力比矿权更难替代","新增矿山并不等于形成可用供给。分离、冶炼、纯化、粉体和磁材制造等中游环节，决定替代链条能否真正运转。"],
    ["03","2025—2030是错配窗口","境外项目建设周期长，而政策冲击可以即时发生。供给替代尚未规模化的阶段，是价格波动、转口和规避申报风险集中暴露期。"],
    ["04","各经济体采取不同路径","美国侧重国防动员、贷款与价格工具；欧盟侧重法规目标和战略项目；日本侧重政策金融与长期承购。不能用单一指标衡量“反管制”强度。"],
    ["05","海关核查应转向关系穿透","仅看品名和税号不足以识别复杂规避。成分、形态、技术参数、最终用户、物流路径、资金流和关联主体应形成联合核验链。"],
    ["06","关联关系不等于违规证据","企业关联、路线重合或主体更换只能构成风险线索。只有与受控物项、许可缺口、异常单证等证据共同出现，才应升级预警。"]
  ];
  root.innerHTML=`<div class="page deep-research-page">
    <header class="page-heading deep-research-heading">
      <div><p class="page-kicker">INDEPENDENT AGENTIC RESEARCH</p><h1>AI深度研究</h1>
      <p>围绕全球关键矿产“管制—反管制”体系，独立完成问题拆解、官方原始资料检索、证据核验、跨国比较、情景推演与海关监管建模；不复制既有附件表述。</p></div>
      <span class="deep-status"><i></i>独立研究版已完成</span>
    </header>

    <section class="deep-metrics">
      <article><span>专题报告规模</span><strong>约 9 万字</strong><small>89,911 个中文字符</small></article>
      <article><span>核心原始来源</span><strong>12</strong><small>全部嵌入可核查脚注</small></article>
      <article><span>矿产研究画像</span><strong>26</strong><small>逐项分析链条与风险</small></article>
      <article><span>比较与推演</span><strong>8 + 3</strong><small>国别/区域 · 未来情景</small></article>
    </section>

    <section class="panel deep-report-card">
      <div class="deep-report-mark"><span>DOCX</span><strong>AI</strong></div>
      <div class="deep-report-copy">
        <p class="page-kicker">ORIGINAL RESEARCH DELIVERABLE</p>
        <h2>全球关键矿产“管制—反管制”体系与海关监管应对</h2>
        <p>以官方公告、国际组织报告和政府项目文件为证据底座，形成政策工具比较、供应链瓶颈、企业与资本关系、十类监管风险、2026—2030情景推演及分层应对建议。</p>
        <div><span>独立撰写</span><span>事实与研判分离</span><span>12条原始脚注</span><span>人工复核入口</span></div>
      </div>
      <div class="deep-report-actions">
        <a class="button primary" href="./reports/ai-deep-research-counter-controls-2026.docx" target="_blank" rel="noreferrer">查看专题报告</a>
        <a class="button" href="./reports/ai-deep-research-counter-controls-2026.docx" download>下载 Word</a>
        <a class="button" href="#/ai-report">转入AI战略报告</a>
      </div>
    </section>

    <section class="panel deep-flow-panel">
      <div class="panel-head"><div><h2>研究链路与证据边界</h2><p>每个判断均经过“问题—来源—事实—推断—复核”链路，避免把媒体线索或企业关联直接写成确定事实。</p></div><span class="panel-tag">6 STAGES</span></div>
      <div class="deep-flow">
        ${[
          ["01","问题拆解","政策、矿产、国家、企业、物流与监管"],
          ["02","原始检索","政府、国际组织、项目与政策金融文件"],
          ["03","结构提取","物项、工具、节点、主体与时间关系"],
          ["04","交叉核验","适用时间、来源冲突与证据等级"],
          ["05","分析推演","观点、矩阵、网络与三种未来情景"],
          ["06","报告归档","Word正文、脚注、附录与人工复核"]
        ].map(item=>`<article><b>${item[0]}</b><strong>${item[1]}</strong><span>${item[2]}</span><i>✓</i></article>`).join("")}
      </div>
    </section>

    <section class="deep-section-head"><div><p class="page-kicker">KEY FINDINGS</p><h2>主要战略观点</h2></div><p>页面展示报告的压缩结论；完整论证、限定条件和证据出处保留在Word专题报告中。</p></section>
    <section class="deep-viewpoint-grid">${viewpoints.map(item=>`<article><span>${item[0]}</span><h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}</section>

    <section class="deep-two-column">
      <article class="panel deep-evidence-panel">
        <div class="panel-head"><div><h2>核心证据审计</h2><p>核心事实只采用政府与国际组织原始页面；二手材料不进入核心脚注计数。</p></div><span class="panel-tag">EVIDENCE</span></div>
        <div class="deep-evidence-ring"><div><strong>12</strong><span>核心脚注</span></div></div>
        <div class="deep-evidence-bars">
          <div><header><strong>A级 · 政府与国际组织</strong><span>100%</span></header><i><b style="width:100%"></b></i><p>中国商务部、IEA、美国政府、欧盟委员会和日本经产省原始资料。</p></div>
          <div><header><strong>事实层</strong><span>逐条脚注</span></header><i><b style="width:100%"></b></i><p>政策名称、适用时间、工具类型和项目安排可回溯至原文。</p></div>
          <div><header><strong>研判层</strong><span>明确标识</span></header><i><b style="width:82%"></b></i><p>趋势、风险和情景为综合推断，不冒充已发生事实。</p></div>
        </div>
      </article>

      <article class="panel deep-risk-panel">
        <div class="panel-head"><div><h2>海关监管风险矩阵</h2><p>矩阵用于确定核查顺序，不直接替代执法认定。</p></div><span class="panel-tag">RISK MATRIX</span></div>
        <div class="deep-risk-matrix">
          <div class="high"><b>高影响 / 高可能</b><strong>品名、税号与技术参数错配</strong><span>核验成分、形态、纯度、用途和许可证一致性</span></div>
          <div class="high"><b>高影响 / 中可能</b><strong>第三方发货与主体替换</strong><span>穿透实际出口人、收货人和关联交易网络</span></div>
          <div class="medium"><b>中影响 / 高可能</b><strong>最终用户和用途偏离</strong><span>比对合同、付款、运输节点与真实流向</span></div>
          <div class="medium"><b>中影响 / 中可能</b><strong>技术资料非货物化传输</strong><span>结合授权边界审查云端、邮件与远程访问线索</span></div>
        </div>
      </article>
    </section>

    <section class="panel deep-network-panel">
      <div class="panel-head"><div><h2>全球“管制—反管制”传导网络</h2><p>出口管制改变预期，境外政策工具推动资本与产能重排，最终传导至贸易路线和海关风险。</p></div><span class="panel-tag">RELATION NETWORK</span></div>
      <div class="deep-network">
        <div class="deep-network-core"><span>中国</span><strong>出口管制工具</strong><small>清单 · 许可 · 技术参数 · 最终用户</small></div><i>→</i>
        <div class="deep-network-countries">
          <article><b>美国</b><span>国防投资 · 贷款 · 价格与承购工具</span></article>
          <article><b>欧盟</b><span>CRMA · 战略项目 · 循环利用目标</span></article>
          <article><b>日本</b><span>政策金融 · 海外项目 · 长期承购</span></article>
          <article><b>其他资源国</b><span>矿权 · 本地加工 · 投资条件重构</span></article>
        </div><i>→</i>
        <div class="deep-network-output"><span>供应链重构</span><strong>矿山 → 分离 → 材料 → 制造</strong><small>价格波动 · 路线变化 · 主体替换 · 监管预警</small></div>
      </div>
    </section>

    <section class="deep-section-head"><div><p class="page-kicker">SCENARIO OUTLOOK</p><h2>2026—2030三种情景</h2></div><p>情景不是预测结论，而是用于检验监管准备是否足以覆盖不同外部冲击。</p></section>
    <section class="deep-viewpoint-grid">
      <article><span>A</span><h3>渐进脱险</h3><p>境外中游项目缓慢投产，供应集中度边际下降，但高纯材料和规模化工艺仍存在瓶颈。</p></article>
      <article><span>B</span><h3>集团化分链</h3><p>政策金融、承购协议和原产地规则共同推动区域供应链，贸易成本和转口识别难度上升。</p></article>
      <article><span>C</span><h3>冲击后协调</h3><p>短期供应中断引发价格和库存波动，随后主要经济体通过许可、储备和项目合作形成有限协调。</p></article>
    </section>
  </div>`;
}

function deepResearchLibraryFile(){
  return {
    id:"generated-ai-deep-research-2026",
    name:"AI深度研究_全球关键矿产管制反制与海关监管应对_独立研究版.docx",
    extension:"DOCX",type:"document",typeName:"文档",source:"generated",sourceName:"AI深度研究",
    date:"2026-07-05",size:"56 KB",mineral:"全部矿产",category:"战略研究报告",
    content:"独立生成的AI Agent深度研究专题报告，约9万字，包含26种矿产画像、8个国别及区域比较、10类海关监管风险和2026—2030情景推演；12个核心原始来源均已嵌入脚注。",
    downloadUrl:"./reports/ai-deep-research-counter-controls-2026.docx",sort:-100
  };
}


function renderAiDeepResearchPage(){
  root.innerHTML="<div class=\"page deep-research-page\">"+
    "<header class=\"page-heading deep-research-heading\">"+
      "<div>"+
        "<p class=\"page-kicker\">REPORT-ALIGNED RESEARCH BRIEF</p>"+
        "<h1>AI深度研究</h1>"+
        "<p>页面内容依据研究报告提炼，完整论证和证据以原报告为准。点击上方报告卡片可切换展示内容。</p>"+
      "</div>"+
      "<span class=\"deep-status\"><i></i>报告观点同步完成</span>"+
    "</header>"+
    "<section class=\"panel deep-archive-panel\">"+
      "<div class=\"panel-head\">"+
        "<div>"+
          "<h2>报告存档</h2>"+
          "<p>共 <b id=\"deepArchiveCount\">0</b> 份报告，点击卡片可查看详情与下载</p>"+
        "</div>"+
        "<div class=\"filter-group\" id=\"deepArchiveFilters\">"+
          "<button class=\"filter-chip active\" data-report-filter=\"all\">全部</button>"+
          "<button class=\"filter-chip\" data-report-filter=\"document\">文档</button>"+
          "<button class=\"filter-chip\" data-report-filter=\"pdf\">PDF</button>"+
        "</div>"+
      "</div>"+
      "<div class=\"deep-archive-grid\" id=\"deepArchiveGrid\"></div>"+
    "</section>"+
    "<section class=\"panel deep-report-detail\" id=\"deepReportDetail\">"+
      "<div class=\"panel-head\">"+
        "<div>"+
          "<h2 id=\"detailTitle\">选择一份报告查看详情</h2>"+
          "<p id=\"detailSubtitle\">点击上方报告卡片，下方将展示对应的核心观点与研究内容</p>"+
        "</div>"+
      "</div>"+
      "<div class=\"deep-detail-grid\" id=\"detailFindings\"></div>"+
      "<div class=\"deep-detail-charts\" id=\"detailCharts\"></div>"+
      "<div class=\"deep-detail-sections\" id=\"detailSections\"></div>"+
    "</section>"+
  "</div>";
  renderDeepReportArchive();
  renderReportDetail(selectedReportId);
}
function renderDeepReportArchive(){
  var grid=document.getElementById("deepArchiveGrid");
  var count=document.getElementById("deepArchiveCount");
  if(!grid||!count)return;
  var filtered=deepResearchReports.filter(function(r){return deepReportFilter==="all"||r.type===deepReportFilter});
  count.textContent=filtered.length;
  var html="";
  for(var i=0;i<filtered.length;i++){
    var r=filtered[i];
    var feat=r.featured?" deep-archive-featured":"";
    html+="<article class=\"deep-archive-card"+feat+"\" data-deep-report=\""+r.id+"\">"+
      "<div class=\"deep-archive-mark\"><span>"+(r.type==="pdf"?"PDF":"DOCX")+"</span></div>"+
      "<div class=\"deep-archive-copy\">"+
        "<h3>"+escapeT(r.name)+"</h3>"+
        "<p>"+escapeT(r.summary)+"</p>"+
        "<div class=\"deep-archive-meta\">"+
          "<span>"+escapeT(r.date)+"</span>"+
          "<span>"+escapeT(r.authors)+"</span>"+
          "<span>"+escapeT(r.size)+"</span>"+
        "</div>"+
        "<div class=\"deep-archive-tags\">";
    for(var t=0;t<r.tags.length;t++){
      html+="<span>"+escapeT(r.tags[t])+"</span>";
    }
    html+="</div></div>"+
      "<div class=\"deep-archive-action\"><button type=\"button\" data-deep-report=\""+r.id+"\" title=\"查看详情\">→</button></div>"+
    "</article>";
  }
  grid.innerHTML=html;
  var cards=grid.querySelectorAll("[data-deep-report]");
  for(var c=0;c<cards.length;c++){
    cards[c].addEventListener("click",function(){
      var rid=this.getAttribute("data-deep-report");
      if(rid){
        selectedReportId=rid;
        renderReportDetail(rid);
        openDeepReport(rid);
      }
    });
  }
  var filters=document.querySelectorAll("#deepArchiveFilters [data-report-filter]");
  for(var f=0;f<filters.length;f++){
    filters[f].addEventListener("click",function(){
      deepReportFilter=this.getAttribute("data-report-filter");
      var allF=document.querySelectorAll("#deepArchiveFilters [data-report-filter]");
      for(var af=0;af<allF.length;af++){allF[af].classList.toggle("active",allF[af]===this)}
      renderDeepReportArchive();
    });
  }
  decorateRenderedPage("ai-deep-research");
}
function renderReportDetail(id){
  var r=deepResearchReports.find(function(x){return x.id===id});
  if(!r||!r.findings)return;
  document.getElementById("detailTitle").textContent=r.name;
  document.getElementById("detailSubtitle").textContent=r.summary;
  var fg=document.getElementById("detailFindings");
  if(fg){
    var fHtml="";
    for(var i=0;i<r.findings.length;i++){
      var f=r.findings[i];
      fHtml+="<article class=\"detail-finding\"><span>"+f.num+"</span><h3>"+escapeT(f.title)+"</h3><p>"+escapeT(f.desc)+"</p></article>";
    }
    fg.innerHTML=fHtml||"<p>暂无观点数据</p>";
  }
  var cg=document.getElementById("detailCharts");
  if(cg&&r.metrics){
    var cHtml="<h3>研究指标</h3><div class=\"detail-metrics-bar\">";
    for(var i=0;i<r.metrics.length;i++){
      var m=r.metrics[i];
      var barW=Math.min(80,m.value.length*18);
      cHtml+="<div class=\"metric-row\"><span class=\"metric-label\">"+escapeT(m.label)+"</span><span class=\"metric-val\">"+escapeT(m.value)+"</span><div class=\"metric-bar\"><span style=\"width:"+barW+"%\"></span></div><span class=\"metric-desc\">"+escapeT(m.desc)+"</span></div>";
    }
    cHtml+="</div>";
    cg.innerHTML=cHtml;
  }
  var sg=document.getElementById("detailSections");
  if(sg&&r.sections){
    var sHtml="<h3>篇章结构</h3><div class=\"detail-section-tags\">";
    for(var i=0;i<r.sections.length;i++){
      sHtml+="<span class=\"detail-section-tag\">"+escapeT(r.sections[i])+"</span>";
    }
    sHtml+="</div><div class=\"detail-view-link\">"+
      "<a class=\"button primary\" href=\""+escapeT(r.path)+"\" target=\"_blank\" rel=\"noreferrer\">查看完整报告 ↗</a>"+
      "<a class=\"button\" href=\""+escapeT(r.path)+"\" download>下载 "+(r.type==="pdf"?"PDF":"DOCX")+"</a>"+
    "</div>";
    sg.innerHTML=sHtml;
  }
  decorateRenderedPage("ai-deep-research");
}
function openDeepReport(id){
  var r=deepResearchReports.find(function(x){return x.id===id});
  if(!r)return;
  var dc=document.getElementById("dialogContent");
  var iconType=r.type==="pdf"?"PDF":"DOCX";
  var pagesStr=r.pages!=="—"?r.pages+" 页":"—";
  var sectionHtml="";
  for(var i=0;i<r.sections.length;i++){
    sectionHtml+="<li>"+escapeT(r.sections[i])+"</li>";
  }
  dc.innerHTML="<div class=\"dialog-body deep-report-dialog-body\">"+
    "<div class=\"deep-report-dialog-head\">"+
      "<span class=\"deep-report-dialog-icon\">"+iconType+"</span>"+
      "<div>"+
        "<span class=\"deep-report-dialog-source\">"+escapeT(r.authors)+"</span>"+
        "<h2>"+escapeT(r.name)+"</h2>"+
        "<p class=\"dialog-sub\">"+escapeT(r.date)+" · "+escapeT(r.size)+" · "+pagesStr+"</p>"+
      "</div>"+
    "</div>"+
    "<section class=\"detail-block\"><h3>报告摘要</h3><p>"+escapeT(r.summary)+"</p></section>"+
    "<section class=\"detail-block\"><h3>报告章节</h3><ul class=\"deep-report-sections\">"+sectionHtml+"</ul></section>"+
    "<div class=\"library-dialog-actions\">"+
      "<a class=\"button primary\" href=\""+escapeT(r.path)+"\" target=\"_blank\" rel=\"noreferrer\">查看报告 ↗</a>"+
      "<a class=\"button\" href=\""+escapeT(r.path)+"\" download>下载 "+iconType+"</a>"+
    "</div>"+
  "</div>";
  dialog.showModal();
}


function renderAiReportPage(){
  root.innerHTML="<div class=\"page research-tool-page\"><header class=\"page-heading research-tool-heading\"><div><p class=\"page-kicker\">AI REPORT STUDIO</p><h1>AI战略报告</h1><p>点击上方已生成报告查看概要信息。</p></div><span class=\"deep-status\"><i></i>报告已归档</span></header><section class=\"panel\" style=\"margin-bottom:8px\"><div style=\"display:flex;gap:10px;align-items:center\"><strong style=\"font-size:13px;color:var(--text-secondary);white-space:nowrap\">AI生成</strong><button class=\"button primary\" id=\"btnGenBrief\">生成要情</button><button class=\"button\" id=\"btnGenReport\">生成呈报</button><button class=\"button\" id=\"btnGenResearch\">生成研究报告</button></div></section><section class=\"panel deep-archive-panel\"><div class=\"panel-head\"><div><h2>已生成报告</h2><p>共 <b id=\"aiReportCount\">0</b> 份报告</p></div></div><div class=\"deep-archive-grid\" id=\"aiReportGrid\"></div></section><section class=\"panel deep-report-detail\" id=\"aiReportDetail\"><div class=\"panel-head\"><div><h2 id=\"aiReportTitle\">选择一份报告查看详情</h2><p id=\"aiReportSubtitle\">点击上方报告卡片查看概要</p></div></div><div class=\"deep-detail-grid\" id=\"aiReportFindings\"></div><div id=\"aiReportActions\" style=\"margin-top:16px\"></div></section></div>";  renderAiReportArchive();
  document.getElementById("btnGenBrief")?.addEventListener("click",function(){showFormatDialog("要情");});
  document.getElementById("btnGenReport")?.addEventListener("click",function(){showFormatDialog("呈报");});
  document.getElementById("btnGenResearch")?.addEventListener("click",function(){showFormatDialog("研究报告");});
  renderAiReportDetail(selectedAiReportId);
}

function renderAiReportArchive(){
  var grid=document.getElementById("aiReportGrid");
  var count=document.getElementById("aiReportCount");
  if(!grid||!count)return;
  count.textContent=aiReportReports.length;
  var html="";
  for(var i=0;i<aiReportReports.length;i++){
    var r=aiReportReports[i];
    html+="<article class=\"deep-archive-card\" data-ai-report=\""+r.id+"\">"+"<div class=\"deep-archive-mark\"><span>DOCX</span></div>"+"<div class=\"deep-archive-copy\">"+"<h3>"+escapeT(r.name)+"</h3>"+"<p>"+escapeT(r.summary)+"</>"+"<div class=\"deep-archive-meta\">"+"<span>"+escapeT(r.date)+"</>"+"<span>"+escapeT(r.authors)+"</>"+"<span>"+escapeT(r.size)+"</>"+"</>"+"<div class=\"deep-archive-tags\">";
    for(var t=0;t<r.tags.length;t++){html+="<span>"+escapeT(r.tags[t])+"</span>";}
    html+="</div></div>"+
      "<div class=\"deep-archive-action\"><button type=\"button\" data-ai-report=\""+r.id+"\" title=\"查看详情\">→</button></div>"+
    "</article>";
  }
  grid.innerHTML=html;
  var cards=grid.querySelectorAll("[data-ai-report]");
  for(var c=0;c<cards.length;c++){
    cards[c].addEventListener("click",function(){
      var rid=this.getAttribute("data-ai-report");
      if(rid){selectedAiReportId=rid;renderAiReportDetail(rid);openAiReportDialog(rid);}
    });
  }
  decorateRenderedPage("ai-report");
}

function renderAiReportDetail(id){
  var r=aiReportReports.find(function(x){return x.id===id});
  if(!r||!r.findings)return;
  document.getElementById("aiReportTitle").textContent=r.name;
  document.getElementById("aiReportSubtitle").textContent=r.summary;
  var fg=document.getElementById("aiReportFindings");
  if(fg){
    var fh="";
    for(var i=0;i<r.findings.length;i++){
      var f=r.findings[i];
      fh+="<article class=\"detail-finding\"><span>"+f.num+"</span><h3>"+escapeT(f.title)+"</h3><p>"+escapeT(f.desc)+"</p></article>";
    }
    fg.innerHTML=fh||"<p>无数据</p>";
  }
  var ag=document.getElementById("aiReportActions");
  if(ag){
    ag.innerHTML="<div class=\"detail-view-link\">"+"<a class=\"button primary\" href=\""+escapeT(r.path)+"\" target=\"_blank\" rel=\"noreferrer\">查看完整报告 ↗</a>"+"<a class=\"button\" href=\""+escapeT(r.path)+"\" download>下载 DOCX</a></div>";
  }
  decorateRenderedPage("ai-report");
}

function openAiReportDialog(id){
  var r=aiReportReports.find(function(x){return x.id===id});
  if(!r)return;
  var dc=document.getElementById("dialogContent");
  var fhtml="";
  for(var i=0;i<r.findings.length;i++){
    fhtml+="<li>"+escapeT(r.findings[i].title)+"："+escapeT(r.findings[i].desc)+"</li>";
  }
  dc.innerHTML="<div class=\"dialog-body deep-report-dialog-body\">"+"<div class=\"deep-report-dialog-head\"><span class=\"deep-report-dialog-icon\">DOCX</span>"+"<div><span class=\"deep-report-dialog-source\">"+escapeT(r.authors)+"</span>"+"<h2>"+escapeT(r.name)+"</h2>"+"<p class=\"dialog-sub\">"+escapeT(r.date)+" · "+escapeT(r.size)+"</p></div></div>"+"<section class=\"detail-block\"><h3>报告摘要</h3><p>"+escapeT(r.summary)+"</p></section>"+"<section class=\"detail-block\"><h3>核心观点</h3><ul>"+fhtml+"</ul></section>"+"<div class=\"library-dialog-actions\">"+"<a class=\"button primary\" href=\""+escapeT(r.path)+"\" target=\"_blank\" rel=\"noreferrer\">查看报告 ↗</a>"+"<a class=\"button\" href=\""+escapeT(r.path)+"\" download>下载 DOCX</a></div></div>";
  dialog.showModal();
}


function showFormatDialog(bt){
  var dc=document.getElementById("dialogContent");
  dc.innerHTML="<div class=\"dialog-body\"><h2>选择生成内容</h2><p>请选择要生成的文档类型：</p>"+
    "<div style=\"display:flex;flex-direction:column;gap:8px\">"+
    "<button class=\"button primary\" id=\"fmtBtn1\" style=\"margin-bottom:4px\">📋 海关要情</button>"+
    "<button class=\"button\" id=\"fmtBtn2\" style=\"margin-bottom:4px\">📋 海关综合信息呈报</button>"+
    "<button class=\"button\" id=\"fmtBtn3\" style=\"margin-bottom:4px\">📋 海关课题研究报告</button>"+
    "</div>"+
    "<button class=\"button\" style=\"margin-top:12px\" onclick=\"dialog.close()\">取消</button>"+
  "</div>";
  document.getElementById("fmtBtn1")?.addEventListener("click",function(){showPromptDialog("海关要情",bt);});
  document.getElementById("fmtBtn2")?.addEventListener("click",function(){showPromptDialog("海关综合信息呈报",bt);});
  document.getElementById("fmtBtn3")?.addEventListener("click",function(){showPromptDialog("海关课题研究报告",bt);});
  dialog.showModal();
}

function showPromptDialog(fmt,bt){
  var dc=document.getElementById("dialogContent");
  dc.innerHTML="<div class=\"dialog-body\"><h2>输入提示词</h2><p>已选：<strong>"+fmt+"</strong></p>"+
    "<textarea id=\"promptInput\" style=\"width:100%;min-height:80px;padding:8px;border:1px solid var(--border);border-radius:6px;resize:vertical\" placeholder=\"请输入提示词，例如：分析近期稀土出口管制动态...\"></textarea>"+
    "<div style=\"display:flex;gap:8px;margin-top:12px\">"+
    "<button class=\"button primary\" id=\"btnDoGenerate\">生成</button>"+
    "<button class=\"button\" id=\"fmtBtnBack\" style=\"margin-right:4px\">返回</button>"+
    "<button class=\"button\" onclick=\"dialog.close()\">取消</button></div>"+
  "</div>";
  document.getElementById("btnDoGenerate")?.addEventListener("click",function(){generateReport(fmt,bt);});
  document.getElementById("fmtBtnBack")?.addEventListener("click",function(){showFormatDialog(bt);});
  dialog.showModal();
}

function generateReport(fmt,bt){
  var p=document.getElementById("promptInput")?.value||"";
  if(!p.trim()){alert("请输入提示词");return;}
  dialog.close();
  var n=new Date();
  var d=n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0");
  var id="gen-"+n.getTime();
  var nm=fmt+" - "+(p.length>28?p.substring(0,28)+"...":p);
  var tags=[fmt];
  var findings=[];
  if(fmt.indexOf("要情")>=0){
    findings=[{num:"01",title:"动态摘要",desc:"根据分析需求，对相关矿产出口管制最新动态进行梳理。"},{num:"02",title:"关键判断",desc:"结合政策连续性和供应链现状，对趋势演变提出研判意见。"},{num:"03",title:"监管提示",desc:"针对物项识别、转口风险和最终用户审查提出具体监管要点。"}];
  } else if(fmt.indexOf("呈报")>=0){
    findings=[{num:"01",title:"综合态势",desc:"整合多源信息，对关键矿产管制与反管制最新形势进行综合分析。"},{num:"02",title:"影响评估",desc:"评估政策变化对我国供应链安全、产业竞争和海关监管的具体影响。"},{num:"03",title:"对策建议",desc:"从法律、技术、合作和人才培养四个维度提出综合性应对建议。"}];
  } else {
    findings=[{num:"01",title:"研究背景",desc:"系统梳理相关政策演变和产业动态。"},{num:"02",title:"深度分析",desc:"采用多维度框架，对政策工具、供应链瓶颈和监管挑战进行研究。"},{num:"03",title:"结论与建议",desc:"形成具有操作性的研究结论和政策建议，支持决策参考。"}];
  }
  var sum="基于提示词："+p+"。自动生成的"+fmt+"。";
  aiReportReports.unshift({id:id,name:nm,fileName:fmt+".docx",path:"",type:"document",date:d,size:"—",summary:sum,authors:"AI生成",tags:tags,findings:findings});
  selectedAiReportId=id;
  renderAiReportArchive();
  renderAiReportDetail(id);
}

