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
  {name:"镱",symbol:"Yb",type:"中重稀土",product:"氧化镱 99.9%",exports:[100,106,109],price:"14",unit:"美元/千克",change:1.8},
  {name:"锂",symbol:"Li",type:"电池材料",product:"电池级碳酸锂",exports:[100,96,101],price:"待接行情",unit:"",change:0,dataStatus:"USGS 2026供需基线"},
  {name:"镍",symbol:"Ni",type:"电池材料",product:"一级镍 / 电池级硫酸镍",exports:[100,103,99],price:"待接行情",unit:"",change:0,dataStatus:"USGS 2026供需基线"},
  {name:"钴",symbol:"Co",type:"电池材料",product:"精炼钴 / 硫酸钴",exports:[100,98,102],price:"待接行情",unit:"",change:0,dataStatus:"USGS 2026供需基线"},
  {name:"锰",symbol:"Mn",type:"电池材料",product:"高纯硫酸锰 / 电解锰",exports:[100,101,104],price:"待接行情",unit:"",change:0,dataStatus:"USGS 2026供需基线"}
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
  {code:"US",name:"美国",tone:"blue",focus:"稀土 · 磁体 · 石墨",status:"政策加码+全链条扩容",action:"2026年继续以国防采购、项目融资和示范计划推动“矿山—分离—金属—磁体”本土化；既有产线扩容与新磁体园区并行，但新增项目仍处建设或爬坡期。",facilities:["Mountain Pass分离与10X磁体园区","White Mesa重稀土试产","USA Rare Earth Stillwater磁体项目","关键材料示范项目"]},
  {code:"AU",name:"澳大利亚",tone:"amber",focus:"稀土 · 镓 · 石墨",status:"框架投资+加工延伸",action:"2026年美澳框架与对日合作进一步向具体项目投入，资源端继续向精炼、分离和副产回收延伸；融资承诺不等于即时商业供给。",facilities:["Lynas Mt Weld与Kalgoorlie","Iluka Eneabba精炼项目","Arafura Nolans已作投资决定","Alcoa-Sojitz Wagerup镓回收"]},
  {code:"FR",name:"法国",tone:"violet",focus:"重稀土 · 回收",status:"现有产线+新建分离",action:"Solvay已启动永磁材料稀土商业生产；Caremag在法日长期承购与融资支持下建设，目标形成回收磁体和重稀土分离能力。",facilities:["Solvay La Rochelle永磁材料产线","Caremag Lacq重稀土项目"]},
  {code:"EE",name:"爱沙尼亚",tone:"cyan",focus:"稀土磁体",status:"客户导入+扩产规划",action:"Narva烧结磁体厂已完成首批客户导入节点并进入商业化爬坡，后续产能取决于车企认证、原料保障和一期扩产决策。",facilities:["Neo Performance Narva磁体工厂","Silmet稀土加工基地","一期1B扩产规划"]},
  {code:"CA",name:"加拿大",tone:"teal",focus:"稀土 · 锗 · 锑 · 镓",status:"承购锁定+冶炼扩容",action:"SRC稀土分离与金属化设施仍以2027年全面投运为目标；2026年7月加拿大启动关键矿产加速器并支持Teck Trail扩建，拟提升锗、锑加工能力并增加镓供应可能性。两类项目均未按新增商业供给计入。",facilities:["SRC Saskatchewan稀土处理设施","Teck Trail锗锑加工扩展","潜在镓副产回收","NdPr金属承购安排"]},
  {code:"JP",name:"日本",tone:"red",focus:"重稀土 · 长期承购",status:"联合投资+锁定资源",action:"以JOGMEC投资和长期承购为主轴，并通过美日行动计划和四方关键矿产框架协同项目、储备、标准及融资工具。",facilities:["Caremag镝铽长期承购","Lynas供应链合作","Quad关键矿产框架"]},
  {code:"KR",name:"韩国",tone:"green",focus:"钨 · 磁体材料",status:"钨矿一期投产",action:"Sangdong钨矿一期已完成调试并开始生产，后续重点转向达产、二期扩能及钨氧化物等中游建设；精矿增量不等同于APT和碳化钨替代能力。",facilities:["Sangdong一期选厂投产","2027二期扩能计划","钨氧化物设施开发"]},
  {code:"BR",name:"巴西",tone:"green",focus:"中重稀土",status:"商业扩产+承购安排",action:"Serra Verde已商业生产并优化扩产；2026年公布与USA Rare Earth的组合及长期承购安排，强化矿端稳定性，但分离和磁体环节仍主要在境外。",facilities:["Serra Verde Pela Ema商业生产","2027年扩产目标","长期承购与融资安排"]},
  {code:"MY",name:"马来西亚",tone:"cyan",focus:"稀土分离",status:"运营续期+重稀土扩展",action:"Lynas马来西亚基地继续承担中国以外大型分离节点，许可证获续期并推进重稀土产品扩展；环保与残渣处置条件仍影响长期运行安排。",facilities:["Lynas Malaysia分离基地","重稀土分离扩展","许可证续期与残渣处置计划"]},
  {code:"IN",name:"印度",tone:"amber",focus:"勘探 · 加工 · 回收",status:"国家任务+国际协同",action:"国家关键矿产任务继续覆盖勘探、加工园区、海外资产和回收；2026年通过Quad框架加强与美日澳在项目投资、标准和技术上的协作。",facilities:["关键矿产加工园区","KABIL海外资源布局","Quad关键矿产框架"]},
  {code:"MW",name:"马拉维",tone:"violet",focus:"稀土",status:"战略项目+融资落地",action:"Songwe Hill已获得欧盟关键原材料战略项目定位并持续推进融资和基础设施配套；项目周期仍受电力、交通和承购条件约束。",facilities:["Songwe Hill稀土项目","配套分离路径研究","融资与基础设施安排"]},
  {code:"AO",name:"安哥拉",tone:"red",focus:"稀土",status:"工程推进+走廊物流",action:"Longonjo继续推进工程、融资与市场安排，Lobito走廊提升外运条件；项目尚未形成商业分离供应，需跟踪实际建设和投产节点。",facilities:["Longonjo稀土项目","Lobito走廊物流","混合稀土产品路径"]},
  {code:"ZA",name:"南非",tone:"teal",focus:"稀土回收",status:"DFS完成+建设准备",action:"Phalaborwa以磷石膏回收为路线推进DFS和融资；公开计划指向2027年建设、2028年目标产出，当前仍属开发阶段。",facilities:["Phalaborwa磷石膏回收","分离流程定型","2027建设准备"]},
  {code:"EU",name:"欧盟",tone:"cyan",focus:"电池材料 · 磁体回收",status:"战略项目+循环产业化",action:"CRMA首轮战略项目已覆盖石墨、锂、镍、钴、锗、镓、钨和稀土等环节；2026年继续以跨区域投资支持电池回收、磁体循环与材料产业化。战略项目资格和资助并不等同于即时产能。",facilities:["CRMA战略项目组合","BATMASS电池循环示范","磁体回收与材料产业化","加速许可与融资对接"]}
];

const alternativeSupplyProjects = [
  {name:"Mountain Pass / MP Materials",region:"美国",mineral:"稀土",stage:"商业生产 / 扩建",stageKey:"delivery",chain:"矿山—分离—金属—磁体",progress:"Mountain Pass现有分离和磁体业务运行；10X磁体园区已确定德州选址，目标于2028年开始调试，不能计为当前产能。",bottleneck:"重稀土供给、建设周期、客户认证与价格支持"},
  {name:"Lynas · Mt Weld—Malaysia",region:"澳大利亚 / 马来西亚",mineral:"稀土",stage:"商业生产 / 扩展",stageKey:"delivery",chain:"矿山—裂解浸出—分离",progress:"既有矿山与马来西亚分离基地持续运行；重稀土产品扩展与经营许可续期同步推进。",bottleneck:"重稀土分离爬坡、加工成本、残渣处置与长期承购"},
  {name:"Caremag Lacq",region:"法国",mineral:"重稀土",stage:"建设推进",stageKey:"build",chain:"回收磁体 / 原矿—重稀土分离",progress:"法日支持、融资与长期承购已落地，设施目标于2026年末投入运行；投运前不计为有效商业供给。",bottleneck:"连续运行、回收原料与矿料保障、产品认证"},
  {name:"Eneabba",region:"澳大利亚",mineral:"稀土",stage:"建设 / 融资",stageKey:"build",chain:"矿砂副产物—稀土精炼",progress:"利用既有矿砂副产资源建设综合精炼能力。",bottleneck:"资本开支、进度控制和商业承购"},
  {name:"Serra Verde",region:"巴西",mineral:"中重稀土",stage:"商业生产 / 扩产",stageKey:"delivery",chain:"离子吸附型矿—混合产品",progress:"Pela Ema已商业生产；2026年公布长期承购和公司组合安排，产线持续优化，目标于2027年底达到约6,400吨TREO年产能。",bottleneck:"扩产执行、分离去向、物流与长期价格机制"},
  {name:"White Mesa / Energy Fuels",region:"美国",mineral:"稀土",stage:"轻稀土商业 / 重稀土试产",stageKey:"ramp",chain:"独居石—分离氧化物—重稀土扩展",progress:"轻稀土处理能力已运行；镝、铽等重稀土完成试产和质量验证节点，规模化产能仍取决于二期工程及原料保障。",bottleneck:"原料稳定、重稀土工程放大、长期成本与客户认证"},
  {name:"eVAC Magnetics",region:"美国",mineral:"永磁体",stage:"建厂 / 认证",stageKey:"build",chain:"合金—制粉—烧结磁体",progress:"在南卡罗来纳建设钕铁硼磁体产能，面向汽车和国防客户认证。",bottleneck:"合金原料、制造良率和批量认证"},
  {name:"Neo Performance Narva",region:"爱沙尼亚",mineral:"永磁体",stage:"客户导入 / 商业爬坡",stageKey:"ramp",chain:"稀土材料—烧结磁体",progress:"2026年2月完成第一百万块磁体生产并持续出货认证产品；多个汽车项目计划于2026年启动商业生产，1B扩产处于工程准备。",bottleneck:"稀土金属供应、汽车认证进度、成本和订单兑现"},
  {name:"SRC Saskatchewan",region:"加拿大",mineral:"稀土",stage:"承购锁定 / 2027投运",stageKey:"build",chain:"分离—金属冶炼—下游供货",progress:"已形成NdPr金属及Dy/Tb产品的五年承购和大规模扩建研究；官方预期一体化设施于2027年初全面运行。",bottleneck:"工程调试、产品规格、原料供应与承购执行"},
  {name:"Solvay La Rochelle",region:"法国",mineral:"稀土",stage:"运营 / 扩建",stageKey:"delivery",chain:"稀土分离—高纯化合物",progress:"利用既有欧洲稀土化工基础扩展永磁相关轻重稀土产品。",bottleneck:"原料来源、能源成本和扩建节奏"},
  {name:"Nolans / Arafura",region:"澳大利亚",mineral:"稀土",stage:"已作投资决定 / 建设启动",stageKey:"build",chain:"矿山—分离—NdPr氧化物",progress:"2026年5月已作出最终投资决定，进入建设阶段；其未来供给能力仍取决于工程执行和达产周期。",bottleneck:"资本开支、建设进度、投产爬坡和长期承购"},
  {name:"Wagerup / Alcoa—Sojitz",region:"澳大利亚",mineral:"镓",stage:"优先项目 / 工程推进",stageKey:"build",chain:"氧化铝流程—副产镓回收—精制",progress:"依托既有氧化铝生产流程建设副产镓回收能力，增加中国以外的初级镓来源。",bottleneck:"回收率、精制衔接和商业规模"},
  {name:"Trail / Teck",region:"加拿大",mineral:"锗、锑、镓",stage:"扩建支持 / 方案推进",stageKey:"build",chain:"多金属冶炼—锗/锑加工—潜在镓副产",progress:"加拿大2026年7月公布关键矿产加速器首项协议，为Trail冶炼体系扩展提供最高8.5亿加元潜在投资框架；官方称扩展有望使锗、锑产能翻倍，并可能新增镓生产。尚处协议与扩展推进阶段。",bottleneck:"融资落地、工程实施、原料组合与实际扩产兑现"},
  {name:"美国关键矿产回收试点",region:"美国",mineral:"稀土、石墨、锰",stage:"联邦资助 / 试点验证",stageKey:"pilot",chain:"煤基原料/废料—提取—分离—材料",progress:"美国能源部2026年5月为19个项目提供4570万美元，包含稀土分离、废磁体处理、石墨前驱体和锰回收等试点；项目属于技术放大和示范阶段，不能等同于稳定商业产能。",bottleneck:"工艺放大、连续运行、产品纯度与商业成本"},
  {name:"Songwe Hill",region:"马拉维",mineral:"稀土",stage:"战略项目 / 融资推进",stageKey:"pilot",chain:"矿山—选矿—下游分离",progress:"已取得欧盟关键原材料战略项目定位并完成工程研究更新；资金、电力和下游分离路径仍是建设前关键条件。",bottleneck:"融资、电力与基础设施、下游分离和商业承购"},
  {name:"Longonjo",region:"安哥拉",mineral:"稀土",stage:"建设推进",stageKey:"build",chain:"矿山—混合稀土产品",progress:"利用Lobito走廊物流条件推进稀土项目建设。",bottleneck:"工程资金、项目进度和后续分离能力"},
  {name:"Phalaborwa",region:"南非",mineral:"稀土回收",stage:"DFS完成 / 建设准备",stageKey:"pilot",chain:"磷石膏—稀土回收—NdPr及中重稀土",progress:"分离路线与DFS持续更新；公开计划为2027年启动加工厂建设、2028年目标产出，尚未形成商业供应。",bottleneck:"工艺放大、融资、建设执行和稳定交付"},
  {name:"Sangdong",region:"韩国",mineral:"钨",stage:"一期投产 / 达产爬坡",stageKey:"delivery",chain:"钨矿—精矿—氧化物规划",progress:"一期于2026年3月完成调试并开始生产，设计年处理约64万吨矿石、年产约2,300吨钨精矿；二期扩能目标为2027年。",bottleneck:"达产爬坡、精矿质量、APT/碳化钨等中游配套与客户认证"},
  {name:"北美石墨项目群",region:"美国 / 加拿大",mineral:"石墨",stage:"多项目建设",stageKey:"build",chain:"矿山—球化—提纯—负极",progress:"矿端选择增加，球化提纯和负极材料产线同步布局。",bottleneck:"能耗、成本、包覆工艺和电池客户认证"},
  {name:"副产镓锗回收项目",region:"美国 / 欧洲 / 日本",mineral:"镓、锗",stage:"研发至扩产",stageKey:"pilot",chain:"铝土矿 / 锌冶炼 / 煤灰—高纯精制",progress:"围绕既有铝、锌和煤系原料流增加回收与高纯精制能力。",bottleneck:"副产原料流量、回收率、纯度和小市场经济性"},
  {name:"Matawinie / Nouveau Monde",region:"加拿大",mineral:"石墨",stage:"启动建设 / 政府承购",stageKey:"build",chain:"天然石墨矿—精矿—球化提纯规划",progress:"加拿大政府披露项目于2026年5月启动建设，并形成每年3万吨精矿承购安排；负极材料交付仍取决于下游加工和认证。",bottleneck:"建设进度、球化提纯、能耗成本和电池客户认证"},
  {name:"INL锑分离试验厂",region:"美国",mineral:"锑",stage:"试验运行",stageKey:"pilot",chain:"Stibnite矿石—选矿/分离—锑产品验证",progress:"2026年7月启用试验设施，目标是获取矿石表征和分离运行数据；尚未形成稳定商业产量。",bottleneck:"工艺放大、原料供应、产品纯度和商业成本"},
  {name:"Keliber",region:"芬兰",mineral:"锂",stage:"一体化项目爬坡",stageKey:"ramp",chain:"锂矿—精矿—电池级氢氧化锂",progress:"芬兰政府2026年5月追加资本支持项目爬坡；实际稳定产量和质量仍须以后续运营披露核验。",bottleneck:"爬坡效率、产品质量、能源成本和长期价格"},
  {name:"NorthMet / NewRange",region:"美国",mineral:"镍、钴",stage:"设计调整 / 许可推进",stageKey:"pilot",chain:"铜镍钴矿—选矿—金属中间品",progress:"2026年7月项目方向明尼苏达自然资源部门提交设计调整，仍处方案与许可推进阶段。",bottleneck:"许可、设计变更、资本开支和下游精炼衔接"}
];

// 替代项目仅以公开一手材料核验进度；“待补充”不作为已形成供应能力的依据。
const alternativeProjectVerification = {
  "Mountain Pass / MP Materials":{date:"2026-02-26",source:"MP Materials 官方公告",url:"https://investors.mpmaterials.com/investor-news/news-details/2026/MP-Materials-Selects-Northlake-Texas-as-the-Site-of-10X-a-New-U-S--Rare-Earth-Magnet-Manufacturing-Campus/default.aspx",status:"已核验 · 现有产线运营，10X 为建设计划"},
  "Lynas · Mt Weld—Malaysia":{date:"2026-03-02",source:"马来西亚许可续期报道",url:"https://apnews.com/article/a9e3f931987ca2011133fee15f666fac",status:"已核验 · 现有分离基地运营，扩展需持续跟踪"},
  "Caremag Lacq":{date:"2025-03-17",source:"日本经济产业省 / JOGMEC",url:"https://www.meti.go.jp/english/press/2025/0317_002.html",status:"已核验 · 建设中，非商业供应"},
  "Eneabba":{date:"2026-02-20",source:"Iluka 2025 年报",url:"https://www.iluka.com/media/yhwn2hzi/iluka-ar25-final-single-pages-18226.pdf",status:"已核验 · 精炼厂建设项目，未作商业供给计入"},
  "Serra Verde":{date:"2026-04-20",source:"Serra Verde 官方公告",url:"https://www.serraverde.com/2026/04/serra-verde-announces-agreed-combination-with-usa-rare-earth-to-create-global-rare-earths-leader-and-a-15-year-offtake-with-guaranteed-floor-prices/",status:"已核验 · 已商业生产，正优化扩产并落实长期承购"},
  "White Mesa / Energy Fuels":{date:"2026-03-25",source:"Energy Fuels 官方公告",url:"https://investors.energyfuels.com/2026-03-25-Energy-Fuels-Announces-First-U-S-Primary-Production-of-Critical-Heavy-Rare-Earth-Material-in-Decades",status:"已核验 · 重稀土为试产/小批量，规模化待验证"},
  "eVAC Magnetics":{date:"—",source:"企业项目页",url:"https://evacmagnetics.com/",status:"待补充核验 · 需补入最新投产与认证公告"},
  "Neo Performance Narva":{date:"2026-05-12",source:"Neo Performance Materials 一季度公告",url:"https://www.neomaterials.com/neo-performance-materials-reports-first-quarter-2026-results/",status:"已核验 · 认证产品出货与客户导入并行，商业化爬坡中"},
  "SRC Saskatchewan":{date:"2025-12-08",source:"萨斯喀彻温省政府公告",url:"https://www.saskatchewan.ca/government/news-and-media/2025/december/08/saskatchewan-research-council-and-realloys-sign-historic-rare-earth-partnership-agreements-advancing",status:"已核验 · 承购已签，全面投运目标为2027年初"},
  "Solvay La Rochelle":{date:"2025-04-08",source:"Solvay 官方公告",url:"https://www.solvay.com/en/press-release/solvay-advances-european-rare-earths-production-through-capacity-expansion",status:"已核验 · 永磁材料稀土产线已启动商业生产"},
  "Nolans / Arafura":{date:"2026-05-21",source:"澳大利亚出口融资机构",url:"https://www.exportfinance.gov.au/newsroom/strategic-reserve-supporting-arafura-final-investment-decision/",status:"已核验 · 已作出投资决定，尚未形成供给"},
  "Wagerup / Alcoa—Sojitz":{date:"2026-07-15",source:"JOGMEC",url:"https://www.jogmec.go.jp/news/release/release_01306.html",status:"已核验 · 已作最终投资决定，尚未投产"},
  "Trail / Teck":{date:"2026-07-07",source:"加拿大自然资源部",url:"https://www.canada.ca/en/natural-resources-canada/news/2026/07/canada-announces-first-agreement-under-new-canada-critical-minerals-accelerator.html",status:"已核验 · 扩展协议与投资框架，非已完成扩产"},
  "美国关键矿产回收试点":{date:"2026-05-19",source:"美国能源部",url:"https://www.energy.gov/cmei/articles/does-office-critical-minerals-and-energy-innovation-announces-over-45-million-support",status:"已核验 · 试点/示范资助，非商业供给"},
  "Songwe Hill":{date:"—",source:"Mkango 项目页",url:"https://mkango.ca/",status:"待补充核验 · 工程与融资状态需以公司最新公告确认"},
  "Longonjo":{date:"2026-06-08",source:"Pensana 官方运营更新",url:"https://pensana.co.uk/operational-update-8th-june-2026/",status:"已核验 · 项目推进中，商业供给尚待确认"},
  "Phalaborwa":{date:"2026-07-01",source:"伦敦证券交易所公司公告",url:"https://www.londonstockexchange.com/news-article/ECOR/update-on-the-phalaborwa-rare-earths-project-dfs/17667420",status:"已核验 · 可研/工程阶段，目标不等于已投产"},
  "Sangdong":{date:"2026-03-16",source:"Almonty 一期完工公告",url:"https://almonty.com/almonty-completes-phase-1-of-sangdong/",status:"已核验 · 一期已完成调试并开始生产，处于达产爬坡"},
  "北美石墨项目群":{date:"—",source:"聚合观察项",url:"https://www.novonixgroup.com/",status:"待拆分核验 · 不作为单一项目或已形成供应能力"},
  "副产镓锗回收项目":{date:"—",source:"聚合观察项",url:"https://www.alcoa.com/",status:"待拆分核验 · 各项目工艺、规模与投产状态不同"},
  "Matawinie / Nouveau Monde":{date:"2026-05-19",source:"加拿大政府重大项目办公室",url:"https://www.canada.ca/en/privy-council/major-projects-office/projects/national/nouveau-monde.html",status:"已核验 · 已启动建设并形成承购安排，尚未商业交付"},
  "INL锑分离试验厂":{date:"2026-07-30",source:"Idaho National Laboratory",url:"https://inl.gov/news-release/inl-hosts-ribbon-cutting-for-pilot-plant-supporting-domestic-antimony-production/",status:"已核验 · 试验运行，不计入商业供给"},
  "Keliber":{date:"2026-05-04",source:"芬兰政府",url:"https://valtioneuvosto.fi/en/-/state-to-inject-eur-40-million-in-capital-into-finnish-minerals-group-for-ramp-up-of-keliber-lithium-project",status:"已核验 · 项目爬坡，产量待运营披露"},
  "NorthMet / NewRange":{date:"2026-07-29",source:"Minnesota DNR",url:"https://www.dnr.state.mn.us/lands_minerals/new-range/index.html",status:"已核验 · 设计调整与许可推进，尚未形成供给"}
};

// 项目方公开图片，仅用于辅助识别设施外观；点击图片可回到对应公开项目页。
const alternativeProjectPhotos = {
  "Mountain Pass / MP Materials":{src:"https://mpmaterials.com/images/arial-mountain-pass.webp",alt:"Mountain Pass 稀土矿及加工设施航拍图",source:"MP Materials 项目页",url:"https://mpmaterials.com/mountain-pass"},
  "Lynas · Mt Weld—Malaysia":{src:"https://lynasrareearths.com/wp-content/uploads/2024/04/Lynas-Malaysia-Gebeng_sml-1024x683.jpg",alt:"Lynas Malaysia Gebeng 稀土分离工厂",source:"Lynas 项目页",url:"https://lynasrareearths.com/kuantan-malaysia-2/"},
  "Sangdong":{src:"https://almonty.com/wp-content/uploads/2024/08/Almonty-to-Lead-Global-Supply-Chain-Re-entry-of-Tungsten-in-South-Korea.webp",alt:"韩国 Sangdong 钨矿加工设施",source:"Almonty 项目页",url:"https://almonty.com/almonty-completes-phase-1-of-sangdong/"}
};

// 国别行动以一项代表性公开项目作核验锚点；不据此推定该国全部替代能力已落地。
const alternativeCountryVerification = {
  US:"美国关键矿产回收试点", AU:"Nolans / Arafura", FR:"Solvay La Rochelle", EE:"Neo Performance Narva", CA:"Trail / Teck", JP:"Caremag Lacq", KR:"Sangdong", BR:"Serra Verde", MY:"Lynas · Mt Weld—Malaysia", IN:null, MW:"Songwe Hill", AO:"Longonjo", ZA:"Phalaborwa", EU:null
};

const alternativeCountryEvidence = {
  US:{date:"2026-05-19",source:"美国能源部",url:"https://www.energy.gov/cmei/articles/does-office-critical-minerals-and-energy-innovation-announces-over-45-million-support",status:"已核验"},
  AU:{date:"2026-05-21",source:"澳大利亚出口融资机构",url:"https://www.exportfinance.gov.au/newsroom/strategic-reserve-supporting-arafura-final-investment-decision/",status:"已核验"},
  FR:{date:"2025-04-08",source:"Solvay 官方公告",url:"https://www.solvay.com/en/press-release/solvay-advances-european-rare-earths-production-through-capacity-expansion",status:"已核验"},
  EE:{date:"2025-09-19",source:"Neo Performance Materials 官方公告",url:"https://www.neomaterials.com/estonia/2/",status:"已核验"},
  CA:{date:"2026-07-07",source:"加拿大自然资源部",url:"https://www.canada.ca/en/natural-resources-canada/news/2026/07/canada-announces-first-agreement-under-new-canada-critical-minerals-accelerator.html",status:"已核验"},
  JP:{date:"2026-05-26",source:"Quad关键矿产框架",url:"https://www.foreignminister.gov.au/minister/penny-wong/media-release/quad-critical-minerals-initiative-framework-among-united-states-japan-australia-and-india",status:"已核验"},
  KR:{date:"2026-03-16",source:"Almonty 一期完工公告",url:"https://almonty.com/almonty-completes-phase-1-of-sangdong/",status:"已核验"},
  BR:{date:"2026-04-20",source:"Serra Verde 官方公告",url:"https://www.serraverde.com/2026/04/serra-verde-announces-agreed-combination-with-usa-rare-earth-to-create-global-rare-earths-leader-and-a-15-year-offtake-with-guaranteed-floor-prices/",status:"已核验"},
  MY:{date:"2026-03-02",source:"马来西亚许可续期报道",url:"https://apnews.com/article/a9e3f931987ca2011133fee15f666fac",status:"已核验"},
  IN:{date:"2026-05-26",source:"Quad关键矿产框架",url:"https://www.foreignminister.gov.au/minister/penny-wong/media-release/quad-critical-minerals-initiative-framework-among-united-states-japan-australia-and-india",status:"已核验"},
  MW:{date:"2025-12-01",source:"世界银行马拉维国别报告",url:"https://documents1.worldbank.org/curated/en/099120725140521030/pdf/P501730-eb5acf1a-8ebe-45d8-847c-7c2bd17a2e52.pdf",status:"已核验"},
  AO:{date:"2026-06-08",source:"Pensana 官方运营更新",url:"https://pensana.co.uk/operational-update-8th-june-2026/",status:"已核验"},
  ZA:{date:"2026-07-01",source:"伦敦证券交易所公司公告",url:"https://www.londonstockexchange.com/news-article/ECOR/update-on-the-phalaborwa-rare-earths-project-dfs/17667420",status:"已核验"},
  EU:{date:"2026-05-26",source:"欧盟 EISMEA",url:"https://eismea.ec.europa.eu/news/i3-instrument-funded-projects-help-strengthen-europes-critical-raw-materials-value-chains-2026-05-26_en",status:"已核验"}
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
  "global-situation":{title:"全球态势",icon:"◎",desc:"综合政策、情报、案例、贸易路线和替代项目，对重点国家和地区进行核查优先级分层。",items:["全球地图","国家分级","风险线索"]},
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

const yixunRiskReports = [
  {mineral:"全部矿产",term:"26类关键矿产/相关物项",hits:8638,reviewed:6118,high:4,medium:337,monitor:501,status:"综合分析",coverage:"钨类全量；其他矿种按页面可见范围披露",conclusion:"现有数据形成4条高优先和337条中优先核查线索；均属于核查排序，不等同于已证实第三国绕道。",html:"./reports/yixun-risk/index.html",docx:"./reports/yixun-risk/documents/关键矿产易迅数据第三国绕道风险综合分析报告.docx"},
  {mineral:"镓",term:"GALLIUM",hits:96,reviewed:96,high:0,medium:5,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"存在5条中等核验线索，主要目的地为越南、墨西哥和印度尼西亚。",html:"./reports/yixun-risk/镓.html",docx:"./reports/yixun-risk/documents/镓_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"锗",term:"GERMANIUM",hits:42,reviewed:42,high:0,medium:5,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"存在5条中等核验线索，需核对技术形态、最终用户及后续流向。",html:"./reports/yixun-risk/锗.html",docx:"./reports/yixun-risk/documents/锗_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"石墨",term:"NATURAL FLAKE GRAPHITE",hits:75,reviewed:75,high:1,medium:5,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"形成1条高优先第一程候选和5条中等线索，需调取第三国后续再出口材料。",html:"./reports/yixun-risk/石墨.html",docx:"./reports/yixun-risk/documents/石墨_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"锑",term:"ANTIMONY TRIOXIDE",hits:152,reviewed:152,high:1,medium:18,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"越南节点集中，形成1条高优先和18条中优先线索，需核验实际加工能力。",html:"./reports/yixun-risk/锑.html",docx:"./reports/yixun-risk/documents/锑_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"金刚石",term:"SYNTHETIC DIAMOND POWDER",hits:600,reviewed:200,high:0,medium:0,monitor:195,status:"暂停/监测",coverage:"页面可见前200条",conclusion:"作为暂停期供应链基线监测，不按现行未许可违规判断。",html:"./reports/yixun-risk/金刚石.html",docx:"./reports/yixun-risk/documents/金刚石_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"钨",term:"TUNGSTEN CARBIDE",hits:5084,reviewed:5084,high:2,medium:288,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"形成2条高优先、288条中优先核查线索；重点核验牌号、HS、第三国节点和后续再出口。",html:"./reports/yixun-risk/钨.html",docx:"./reports/yixun-risk/documents/钨_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"碲",term:"TELLURIUM METAL",hits:6,reviewed:6,high:0,medium:0,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"当前记录未形成明确绕道指向。",html:"./reports/yixun-risk/碲.html",docx:"./reports/yixun-risk/documents/碲_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"铋",term:"BISMUTH METAL",hits:12,reviewed:12,high:0,medium:0,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"当前记录未形成明确绕道指向。",html:"./reports/yixun-risk/铋.html",docx:"./reports/yixun-risk/documents/铋_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"钼",term:"MOLYBDENUM POWDER",hits:1,reviewed:1,high:0,medium:0,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"当前样本较少，尚未形成明确绕道指向。",html:"./reports/yixun-risk/钼.html",docx:"./reports/yixun-risk/documents/钼_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"铟",term:"INDIUM PHOSPHIDE",hits:0,reviewed:0,high:0,medium:0,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"代表性关键词未命中，不能据此认定不存在贸易活动。",html:"./reports/yixun-risk/铟.html",docx:"./reports/yixun-risk/documents/铟_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"钐",term:"SAMARIUM OXIDE",hits:3,reviewed:3,high:0,medium:2,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"3条样本均进入越南，其中2条列为中等核验线索。",html:"./reports/yixun-risk/钐.html",docx:"./reports/yixun-risk/documents/钐_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"钆",term:"GADOLINIUM OXIDE",hits:10,reviewed:10,high:0,medium:1,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"形成1条中等核验线索。",html:"./reports/yixun-risk/钆.html",docx:"./reports/yixun-risk/documents/钆_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"铽",term:"TERBIUM OXIDE",hits:0,reviewed:0,high:0,medium:0,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"代表性关键词未命中，建议补充牌号、化合物和HS组合检索。",html:"./reports/yixun-risk/铽.html",docx:"./reports/yixun-risk/documents/铽_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"镝",term:"DYSPROSIUM OXIDE",hits:4,reviewed:4,high:0,medium:3,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"4条样本均进入越南，其中3条列为中等核验线索。",html:"./reports/yixun-risk/镝.html",docx:"./reports/yixun-risk/documents/镝_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"镥",term:"LUTETIUM OXIDE",hits:21,reviewed:20,high:0,medium:0,monitor:0,status:"现行",coverage:"页面可见20条",conclusion:"当前可见记录未形成明确绕道指向。",html:"./reports/yixun-risk/镥.html",docx:"./reports/yixun-risk/documents/镥_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"钪",term:"SCANDIUM OXIDE",hits:0,reviewed:0,high:0,medium:0,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"代表性关键词未命中，建议补充合金、靶材及牌号检索。",html:"./reports/yixun-risk/钪.html",docx:"./reports/yixun-risk/documents/钪_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"钇",term:"YTTRIUM OXIDE",hits:105,reviewed:105,high:0,medium:10,monitor:0,status:"现行",coverage:"页面结果全量",conclusion:"形成10条中等核验线索，越南为主要目的地。",html:"./reports/yixun-risk/钇.html",docx:"./reports/yixun-risk/documents/钇_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"钬",term:"HOLMIUM OXIDE",hits:7,reviewed:7,high:0,medium:0,monitor:7,status:"暂停/监测",coverage:"页面结果全量",conclusion:"作为暂停期供应链监测样本。",html:"./reports/yixun-risk/钬.html",docx:"./reports/yixun-risk/documents/钬_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"铒",term:"ERBIUM OXIDE",hits:7,reviewed:7,high:0,medium:0,monitor:7,status:"暂停/监测",coverage:"页面结果全量",conclusion:"作为暂停期供应链监测样本。",html:"./reports/yixun-risk/铒.html",docx:"./reports/yixun-risk/documents/铒_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"铥",term:"THULIUM OXIDE",hits:1,reviewed:1,high:0,medium:0,monitor:1,status:"暂停/监测",coverage:"页面结果全量",conclusion:"作为暂停期供应链监测样本。",html:"./reports/yixun-risk/铥.html",docx:"./reports/yixun-risk/documents/铥_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"铕",term:"EUROPIUM OXIDE",hits:23,reviewed:23,high:0,medium:0,monitor:23,status:"暂停/监测",coverage:"页面结果全量",conclusion:"越南记录较集中，作为暂停期供应链基线监测。",html:"./reports/yixun-risk/铕.html",docx:"./reports/yixun-risk/documents/铕_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"镱",term:"YTTERBIUM OXIDE",hits:20,reviewed:20,high:0,medium:0,monitor:19,status:"暂停/监测",coverage:"页面结果全量",conclusion:"以美国流向为主，作为暂停期供应链监测样本。",html:"./reports/yixun-risk/镱.html",docx:"./reports/yixun-risk/documents/镱_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"锂",term:"LITHIUM IRON PHOSPHATE",hits:2319,reviewed:200,high:0,medium:0,monitor:200,status:"暂停/监测",coverage:"页面可见前200条",conclusion:"当前样本全部显示美国目的地，作为产业链和政策恢复监测基线。",html:"./reports/yixun-risk/锂.html",docx:"./reports/yixun-risk/documents/锂_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"镍",term:"NICKEL COBALT MANGANESE HYDROXIDE",hits:50,reviewed:50,high:0,medium:0,monitor:49,status:"暂停/监测",coverage:"页面结果全量",conclusion:"印度尼西亚记录集中，作为前驱体供应链监测。",html:"./reports/yixun-risk/镍.html",docx:"./reports/yixun-risk/documents/镍_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"钴",term:"NICKEL COBALT ALUMINUM HYDROXIDE",hits:0,reviewed:0,high:0,medium:0,monitor:0,status:"暂停/监测",coverage:"页面结果全量",conclusion:"代表性关键词未命中，建议扩展同义词及HS组合。",html:"./reports/yixun-risk/钴.html",docx:"./reports/yixun-risk/documents/钴_易迅数据第三国绕道风险专项分析.docx"},
  {mineral:"锰",term:"LITHIUM RICH MANGANESE CATHODE",hits:0,reviewed:0,high:0,medium:0,monitor:0,status:"暂停/监测",coverage:"页面结果全量",conclusion:"代表性关键词未命中，建议扩展材料牌号与正极材料描述。",html:"./reports/yixun-risk/锰.html",docx:"./reports/yixun-risk/documents/锰_易迅数据第三国绕道风险专项分析.docx"}
];
var yixunReportState={mineral:"全部矿产"};

const root = document.getElementById("pageRoot");
const dialog = document.getElementById("detailDialog");
const commandMask = document.getElementById("commandMask");
const commandInput = document.getElementById("commandInput");
let state = {status:"all",year:"all",query:"",page:1,pageSize:12};
let marketState = {query:"",type:"all"};
let marketSituationState = {view:"alternatives",projectPage:1};
let announcementState = {query:"",status:"all",notice:"all",controlType:"all",page:1,pageSize:12};
let entityState = {query:"",controlType:"all",country:"all",page:1,pageSize:10};
const controlTypeMeta = {
  unreliable_entity:{label:"不可靠实体",className:"unreliable"},
  control_list:{label:"出口管制管控名单",className:"controlled"},
  watch_list:{label:"关注名单",className:"watch"},
  item_control:{label:"物项管制",className:"item"},
  technology_control:{label:"技术管制",className:"technology"},
  entity_measure:{label:"实体措施",className:"entity"},
  status_adjustment:{label:"状态调整",className:"adjustment"}
};
function controlTypeBadge(type){const meta=controlTypeMeta[type]||{label:type||"未分类",className:"other"};return `<span class="control-type-badge ${meta.className}">${meta.label}</span>`;}
let intelligenceState = {mineral:"tungsten",snapshotPage:1,collectionStatus:"",collectionRequestedAt:"",collectionItems:[],collectionRunIds:[],collectionError:"",collectionLoaded:false};
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
  {id:"gallium",name:"镓",symbol:"Ga",ready:true},
  {id:"germanium",name:"锗",symbol:"Ge",ready:true},
  {id:"graphite",name:"石墨",symbol:"C",ready:true},
  {id:"antimony",name:"锑",symbol:"Sb",ready:true},
  {id:"diamond",name:"金刚石",symbol:"C◆",ready:true},
  {id:"tellurium",name:"碲",symbol:"Te",ready:true},
  {id:"bismuth",name:"铋",symbol:"Bi",ready:true},
  {id:"molybdenum",name:"钼",symbol:"Mo",ready:true},
  {id:"indium",name:"铟",symbol:"In",ready:true},
  {id:"samarium",name:"钐",symbol:"Sm",ready:true},
  {id:"gadolinium",name:"钆",symbol:"Gd",ready:true},
  {id:"terbium",name:"铽",symbol:"Tb",ready:true},
  {id:"dysprosium",name:"镝",symbol:"Dy",ready:true},
  {id:"lutetium",name:"镥",symbol:"Lu",ready:true},
  {id:"scandium",name:"钪",symbol:"Sc",ready:true},
  {id:"yttrium",name:"钇",symbol:"Y",ready:true},
  {id:"holmium",name:"钬",symbol:"Ho",ready:true},
  {id:"erbium",name:"铒",symbol:"Er",ready:true},
  {id:"thulium",name:"铥",symbol:"Tm",ready:true},
  {id:"europium",name:"铕",symbol:"Eu",ready:true},
  {id:"ytterbium",name:"镱",symbol:"Yb",ready:true},
  {id:"lithium",name:"锂",symbol:"Li",ready:true},
  {id:"nickel",name:"镍",symbol:"Ni",ready:true},
  {id:"cobalt",name:"钴",symbol:"Co",ready:true},
  {id:"manganese",name:"锰",symbol:"Mn",ready:true}
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
    status:"已处罚",sourceGrade:"A",sourceGradeNote:"官方合规案例",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1291.html"
  },
  {
    country:"中国",agency:"长沙黄花机场海关、威海海关",date:"2021—2025",collectedAt:"2026-07-02",mineral:"钨、铋、钴等金属粉末",direction:"中国 → 美国、印度、马来西亚等",
    title:"金属粉末被伪报为其他品名并通过快件出口",
    finding:"官方合规案例梳理显示，相关公司未取得许可证，存在伪报品名及商品编号等违法行为，关联货代已被刑事立案。",
    status:"行政处罚 / 刑事立案",sourceGrade:"A",sourceGradeNote:"官方合规案例",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1291.html"
  },
  {
    country:"中国",agency:"广东省高级人民法院",date:"2009—2023",collectedAt:"2026-07-02",mineral:"钇、氧化钪等稀土",direction:"中国 → 境外",
    title:"稀土产品长期伪报为“金属靶材样品”出口",
    finding:"该关联战略矿产案例经二审维持原判，企业及负责人因无证出口、伪报品名和低报价格被判处罚金及有期徒刑。",
    status:"刑事判决",sourceGrade:"A",sourceGradeNote:"省级商务主管部门转载裁判案例",source:"https://swt.fujian.gov.cn/xxgk/jgzn/jgcs/myycyaqc/gzdt_475/202512/t20251223_7049515.htm"
  },
  {
    country:"美国",agency:"美国司法部、HSI、DCIS",date:"2022-06",collectedAt:"2026-07-02",mineral:"钨重粉相关受控技术",direction:"美国 → 中国、印度等",
    title:"钨重粉企业前负责人承认非法输出受控技术",
    finding:"该案方向与中国战略矿产外流相反，作为境外出口管制执法参照：涉案人员在未获许可情况下向境外提供受ITAR管制的技术资料。",
    status:"认罪",sourceGrade:"A",sourceGradeNote:"美国司法部公告",source:"https://www.justice.gov/usao-sdca/pr/former-tungsten-heavy-powder-parts-ceo-pleads-guilty-conspiring-export-united-states"
  },
  {
    country:"中国",agency:"北京大兴国际机场海关",date:"2026-06",collectedAt:"2026-07-15",mineral:"三氧化钨",direction:"中国 → 沙特阿拉伯",
    title:"旅客携带三氧化钨经无申报通道出境",finding:"公开案例梳理称，企业指派员工携带两瓶三氧化钨出境，因未提交许可证受到行政处罚；该条目已与6月案例梳理交叉核对，仍待补原始处罚决定书。",
    status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:"https://wtt6.com/93306.html"
  }
];
const sourceGradeLabels={
  A:"A 级 · 官方/原始披露",
  B:"B 级 · 公开转载交叉核验",
  C:"C 级 · 单一公开线索待补证"
};
const enforcementCaseSources={
  march:"https://www.sohu.com/a/1002914721_122654573",
  june:"https://wtt6.com/93306.html",
  pouNai:"https://pdf.dfcfw.com/pdf/H2_AN202605061821987046_1.pdf",
  gaGe:"https://www.guandian.cn/m/show/569230",
  zhaoSheng:"https://pdf.dfcfw.com/pdf/H2_AN202603271820805761_1.pdf?1774638021000.pdf=",
  ceratizit:"https://www.justice.gov/opa/pr/ceratizit-usa-llc-agrees-pay-544m-settle-false-claims-act-allegations-relating-evaded-0",
  dubaiGraphite:"https://gulfnews.com/uae/crime/merchant-seeks-acquittal-in-trial-over-nuclear-quality-graphite-1.882262",
  hongKongAntimony:"https://www.customs.gov.hk/hcms/filemanager/en/content_13/CSF-3-18-25.pdf"
};
const verifiedEnforcementCases={
  bismuth:[
    {country:"中国",agency:"漳州海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"金属铋",direction:"中国 → 目的地未披露",title:"跨境电商申报“装饰玩具”夹带高纯金属铋",finding:"厦门云鸿以跨境电商方式申报“装饰玩具”，实际含纯度99.999%的金属铋0.7千克、货值174.4元；公开转载载有处罚决定书要素，罚款1000元。",status:"行政处罚",sourceGrade:"A",sourceGradeNote:"处罚决定书转载·可回溯案号",source:"https://www.jitinfo.net/Service/Detail?detail=69b18de9-36e8-91fc-00c9-87134f47f95e"},
    {country:"中国",agency:"漳州/泉州海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"金属铋",direction:"中国 → 目的地未披露",title:"9610清单申报“零配件/玩具”实际为铋块及铋晶体",finding:"公开3月案例梳理记载：厦门绿芮两案以9610方式申报“零配件”或“玩具”，实际为铋块/铋晶体，货值分别为172元和26元，均被罚款1000元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march},
    {country:"中国",agency:"漳州海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"金属铋",direction:"中国 → 目的地未披露",title:"“适配器/水袋”等品名夹带金属铋块",finding:"公开3月案例梳理记载，深圳得优贸易申报“适配器”“水袋”“保鲜盒”等，实际夹带金属铋块1000克、货值134元，罚款1000元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march},
    {country:"中国",agency:"北仑海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"含铋银焊条",direction:"中国 → 目的地未披露",title:"申报银焊条的货物检出高比例铋",finding:"公开3月案例梳理记载，弘硕科技（宁波）申报出口银焊条，经检测铋含量91.4%，违法经营额78.47万元；因配合调查、主动删单退关等情节，减轻处罚23.55万元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march}
  ],
  antimony:[
    {country:"中国香港",agency:"香港海关",date:"2025-03",collectedAt:"2026-07-15",mineral:"疑似锑锭",direction:"香港 → 目的地未披露",title:"香港内河码头出境货柜查扣约25.17吨疑似锑锭",finding:"香港海关扣押公告显示，2025年3月13日在屯门内河码头一只40英尺出境货柜内查获25,171.85千克疑似锑锭。公开公告未披露原产地、起运地及最终目的地；媒体仅将案件置于中国锑出口管制背景下，故不按“已证实中国来源”表述。",status:"扣押调查",sourceGrade:"C",sourceGradeNote:"境外海关公告·中国内地来源待核",source:enforcementCaseSources.hongKongAntimony}
  ],
  germanium:[
    {country:"中国",agency:"首都机场海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"锗镜片/测试片",direction:"中国 → 目的地未披露",title:"锗制品伪报“光学玻璃”并通过快件出境",finding:"公开3月案例梳理记载，北京晶世博将锗光学镜片申报为“光学玻璃”，并将测试片经DHL伪报为“文件”邮寄；被按走私行为处罚，罚款15.43万元并没收违法所得。",status:"行政处罚（走私定性）",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march},
    {country:"中国",agency:"长春兴隆海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"锗窗口片",direction:"中国 → 美国、立陶宛",title:"无证出口锗窗口片10030个",finding:"公开3月案例梳理记载，长春恒润光电三次出口锗窗口片共10030个，未取得许可证；公开信息称不涉及伪报，按减轻处罚罚款5.4万元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march},
    {country:"中国",agency:"榕城海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"锗光学透镜",direction:"中国 → 目的地未披露",title:"无证出口金属锗材质光学透镜",finding:"公开3月案例梳理记载，福州阿尔发光学出口243片锗光学透镜，违法经营额14.51万元；没收违法所得并处罚款5万元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march},
    {country:"中国",agency:"榕城海关",date:"2026-06",collectedAt:"2026-07-15",mineral:"锗镜片",direction:"中国 → 目的地未披露",title:"两家关联企业瞒报锗镜片材质出口",finding:"公开6月案例梳理记载，福州光宏光电子、福州宏振光电将1016个金属锗材质镜片申报为普通“光学镜片”；没收违法所得6.5万元，合计罚款50万元。",status:"行政处罚（走私定性）",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.june},
    {country:"中国",agency:"杭州市人民检察院",date:"2026-03",collectedAt:"2026-07-15",mineral:"锗镜片",direction:"中国 → 目的地未披露",title:"兆晟科技涉锗镜片出口案被提起公诉",finding:"公司公告披露，检察机关认为公司及两名直接责任人员涉嫌将受许可证管理的锗镜片走私出口。案件处于起诉阶段，页面不将其表述为生效判决。",status:"刑事起诉",sourceGrade:"A",sourceGradeNote:"公司原始信息披露",source:enforcementCaseSources.zhaoSheng}
  ],
  graphite:[
    {country:"中国",agency:"营口市人民检察院",date:"2026-04",collectedAt:"2026-07-15",mineral:"天然鳞片石墨",direction:"中国 → 境外全资子公司",title:"濮耐股份涉无证出口天然鳞片石墨案被起诉",finding:"公司披露及公开报道显示，检方指控涉案主体以其他粉末状天然石墨税号2504109900申报，2024年4月至2025年3月出口天然鳞片石墨1243.55吨。案件处于起诉后程序，不作为生效定罪展示。",status:"刑事起诉",sourceGrade:"A",sourceGradeNote:"上市公司原始信息披露",source:enforcementCaseSources.pouNai},
    {country:"中国",agency:"上海外高桥港区海关",date:"2026-06",collectedAt:"2026-07-15",mineral:"石墨模具",direction:"中国 → 印度",title:"申报钢铁“模具”的货物实际为高固定碳石墨模具",finding:"公开6月案例梳理记载，北京霍兰德贸易出口的300支货物实际为固定碳99.97%的石墨模具，需领许可证；违法经营额9119.5元，罚款1万元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.june},
    {country:"阿联酋",agency:"杰贝阿里港海关",date:"2018-09",collectedAt:"2026-07-15",mineral:"天然石墨粉",direction:"中国 → 伊朗（经阿联酋）",title:"杰贝阿里港查扣自中国发往伊朗的石墨粉货物",finding:"当地媒体援引迪拜法院记录称，一批自中国发往伊朗、后转入杰贝阿里港的天然石墨粉被海关扣押；报道所述纯度为87.3%、重量8250千克。案件当时仍在审理，页面仅作为境外媒体线索，不对石墨属性、违法性或最终裁判作结论。",status:"法院审理线索",sourceGrade:"C",sourceGradeNote:"境外媒体援引法院记录·待补裁判结果",source:enforcementCaseSources.dubaiGraphite}
  ],
  "rare-earth-magnets":[
    {country:"中国",agency:"首都机场海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"含镝钕铁硼永磁材料",direction:"中国 → 菲律宾",title:"来料加工方式无证出口含镝钕铁硼",finding:"公开3月案例梳理记载，三环永磁以加工贸易方式出口393.92千克含镝钕铁硼永磁材料，违法经营额39.59万元，减轻处罚19.8万元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march},
    {country:"中国",agency:"宁波机场海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"含铽钕铁硼磁钢",direction:"中国 → 目的地未披露",title:"申报“磁铁”检出铽元素",finding:"公开3月案例梳理记载，宁波为正磁业两票“磁铁”经检测含铽0.2%和0.11%，涉案10470个、货值2187.96元，罚款1万元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march},
    {country:"中国",agency:"湾仔海关",date:"2026-03",collectedAt:"2026-07-15",mineral:"钐钴永磁材料",direction:"中国 → 目的地未披露",title:"进料料件复出方式出口钐钴永磁材料",finding:"公开3月案例梳理记载，珠海琦乐电子出口0.501千克“磁铁”，鉴定为钴48.5%、钐25.4%的钐钴永磁材料，货值9243.45元，罚款1万元。",status:"行政处罚",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.march},
    {country:"中国",agency:"鄞州海关",date:"2026-06",collectedAt:"2026-07-15",mineral:"含镝/含钐磁钢",direction:"中国 → 台湾地区",title:"邮寄伪报“布料/铁片”出口磁钢",finding:"公开6月案例梳理记载，宁波金域磁业多次以邮寄方式将受管制磁钢伪报为“布料”“铁片”出口，违法经营额3.65万元，按走私行为罚款50万元。",status:"行政处罚（走私定性）",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.june},
    {country:"中国",agency:"鄞州海关",date:"2026-06",collectedAt:"2026-07-15",mineral:"钐钴永磁体",direction:"中国 → 台湾地区",title:"快件伪瞒报出口钐钴永磁体",finding:"公开6月案例梳理记载，宁波罗氏磁业经快件伪瞒报出口钐钴永磁体3.5万个，违法经营额7.95万元，按走私行为罚款50万元。",status:"行政处罚（走私定性）",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.june},
    {country:"中国",agency:"宁波机场海关",date:"2026-06",collectedAt:"2026-07-15",mineral:"含镝磁钢",direction:"中国 → 目的地未披露",title:"含镝磁钢混入非管制货物出口",finding:"公开6月案例梳理记载，宁波亚特磁业将含镝3.15%的磁钢混入非管制货物出口；走私部分违法经营额1.34万元，罚款8万元，另有申报不实处罚。",status:"行政处罚（走私定性）",sourceGrade:"B",sourceGradeNote:"行业平台案例梳理·待补原始决定书",source:enforcementCaseSources.june}
  ],
  "ga-ge":[
    {country:"中国",agency:"广州市中级人民法院",date:"2026-06-25",collectedAt:"2026-07-15",mineral:"镓、锗",direction:"中国 → 日本",title:"安徽光智科技走私镓、锗案一审宣判",finding:"公开媒体交叉报道：涉案企业2023—2024年以伪报品名等方式走私镓、锗9377千克，货值5676万元；一审判处罚金及相关责任人员刑罚。尚待补广州中院原始发布页或裁判文书。",status:"一审判决",sourceGrade:"B",sourceGradeNote:"多家公开媒体交叉报道·待补法院原文",source:enforcementCaseSources.gaGe}
  ],
  tungsten:[
    {country:"美国",agency:"美国司法部、美国海关与边境保护局",date:"2025-12",collectedAt:"2026-07-15",mineral:"碳化钨制品",direction:"中国 → 台湾地区 → 美国",title:"美国对经台湾转运的中国制造碳化钨制品追缴关税",finding:"美国司法部公告称，Ceratizit USA同意支付5440万美元以解决民事索赔：其被指明知产品在中国制造、经台湾转运后向美国海关申报为台湾原产，并以错误税号降低税负。该和解明确不构成责任承认或责任认定。",status:"民事和解",sourceGrade:"A",sourceGradeNote:"美国司法部原始公告",source:enforcementCaseSources.ceratizit}
  ]
};
const tungstenRiskSignals = [
  {level:"高",title:"申报品名或税号与实物特征不一致",analysis:"合同、发票、检测报告与报关品名之间出现明显差异，或管制属性判定材料缺失。",check:"核验成分、粒度、形态、用途、税号及许可证的一致性。"},
  {level:"高",title:"普通货物中出现高密度金属粉末或异常夹带",analysis:"包装物、样品或普通低值货物与扫描、称重、材质检测结果不匹配。",check:"结合机检图像、重量偏差、取样检测和装箱记录开展复核。"},
  {level:"高",title:"韩国采购放量与对日再出口同步",analysis:"对韩碳化钨或钨粉出口短期高增，且韩国本土产能、库存消化和对日出口数据无法解释全部增量。",check:"比对中国出口、韩国进口、韩国对日出口、日本进口和买方产能，核验最终用户及再出口承诺。"},
  {level:"中高",title:"短期多批次、小批量或简易渠道集中出口",analysis:"同一主体、收货人或关联货代通过快件、市场采购等渠道连续拆分出货。",check:"穿透关联企业、地址、电话、付款人与物流轨迹，按时间窗口聚合研判。"},
  {level:"中高",title:"第三国中转与最终用户信息不匹配",analysis:"合同目的国、物流中转地、付款来源和最终用途说明存在矛盾或频繁变化。",check:"核验最终用户、最终用途、转运路径及第三方付款的合理性。"},
  {level:"中",title:"技术资料或远程访问替代实物交付",analysis:"受控工艺、参数、图纸可能通过邮件、云盘、远程账号等非货物渠道向境外传输。",check:"审查数据分级、境外访问日志、技术服务合同和许可范围。"}
];
const intelProfileKeys={
  gallium:"ga-ge",germanium:"ga-ge",graphite:"graphite",antimony:"antimony",diamond:"diamond",
  tellurium:"five-metals",bismuth:"five-metals",molybdenum:"five-metals",indium:"five-metals",
  samarium:"seven-ree",gadolinium:"seven-ree",terbium:"seven-ree",dysprosium:"seven-ree",lutetium:"seven-ree",scandium:"seven-ree",yttrium:"seven-ree",
  holmium:"five-ree",erbium:"five-ree",thulium:"five-ree",europium:"five-ree",ytterbium:"five-ree",
  lithium:"battery",nickel:"battery",cobalt:"battery",manganese:"battery"
};
const SYSTEM_DATA_DATE="2026.08.08";
const MINERAL_BASELINE_SOURCE="https://pubs.usgs.gov/publication/mcs2026";
const mineralAnalysisBlueprints={
  tungsten:{form:"仲钨酸铵、氧化钨、未烧结碳化钨及特定钨合金",use:"硬质合金、切削工具、热喷涂、军工高密度部件",chain:"钨精矿 → APT/氧化钨 → 钨粉/碳化钨 → 工具与部件",risk:"粉末、混合料与已烧结制品边界混淆，或经贸易商改变品名和目的地",check:"逐票核对CAS、粒度、烧结状态、成分、许可证、最终用户与再出口承诺",outlook:"海外重点补矿山与中游转化能力，短期仍受制于APT、粉末和客户认证。"},
  gallium:{form:"金属镓、氮化镓、氧化镓、磷化镓、砷化镓等",use:"功率半导体、射频芯片、光电子和高频器件",chain:"铝土矿/锌冶炼副产 → 高纯镓 → 化合物/晶圆 → 芯片器件",risk:"以普通化工品或半导体材料申报而缺少纯度、化学式和晶体形态",check:"核对化学式、纯度、衬底/外延属性、最终用户晶圆能力及许可证",outlook:"西澳Wagerup项目已于2026年7月作出最终投资决定，但投产前不能计入稳定供给。"},
  germanium:{form:"金属锗、区熔锗锭、二氧化锗、四氯化锗及特定衬底",use:"红外光学、光纤、太阳能电池、半导体与量子技术",chain:"铅锌冶炼副产 → 高纯锗/锗锭 → 镜片/衬底 → 红外与半导体终端",risk:"以光学玻璃、镜片或样品等功能名称掩盖锗材质与技术参数",check:"核对材质证明、光谱/成分检测、产品图纸、快件运单和最终用途",outlook:"加拿大Trail扩建及美国锗同位素能力推进，均不能替代常规高纯锗全链条供给。"},
  graphite:{form:"高纯高强高密人造石墨、天然鳞片石墨及其制品",use:"锂电负极、半导体热场、核工业、耐火与电极",chain:"矿石/石油焦 → 提纯与石墨化 → 模具/电极/负极 → 电池和高温工业",risk:"以模具、耐火材料或普通石墨制品申报，缺少纯度、密度和强度参数",check:"核对固定碳、粒度、密度、抗折强度、生产工艺、用途和许可证",outlook:"加拿大Matawinie已启动建设并有政府承购，但矿端投产不等同于负极材料全链条成熟。"},
  antimony:{form:"锑矿、金属锑、高纯氧化物、有机锑化合物及氢化物",use:"阻燃剂、铅酸电池、半导体、弹药与合金",chain:"锑矿 → 冶炼/精炼 → 氧化物/合金 → 阻燃与国防终端",risk:"矿、锭、氧化物或含锑合金之间品名切换，实际出口人与经营资质不一致",check:"核对成分形态、国营贸易资格、供货与收款主体、最终用户和许可证",outlook:"美国2026年7月启用锑分离试验厂，仍属工艺验证而非规模化替代供应。"},
  diamond:{form:"金刚石窗口材料及现行有效范围内的设备、部件和技术",use:"超硬切削、光学窗口、半导体散热与高压实验",chain:"合成设备/工艺 → 单晶/微粉 → 线锯/砂轮/窗口 → 工业终端",risk:"把设备、关键部件、工艺服务拆分签约，或缺失粒径、晶型与用途",check:"合并核对设备清单、技术附件、粒径晶型、远程服务和最终用户",outlook:"新增扩围措施处暂停状态，必须先区分既有有效范围和暂停范围。"},
  tellurium:{form:"金属碲、碲化镉、碲化镉锌、碲化镉汞及相关技术",use:"薄膜光伏、红外探测、热电材料和合金",chain:"铜冶炼副产 → 高纯碲 → 碲化物 → 光伏/红外器件",risk:"以光伏材料、靶材或普通化合物申报，未说明化学计量和纯度",check:"核对化学式、纯度、靶材形态、终端产线、用途与许可证",outlook:"海外增量主要依赖铜冶炼副产回收，产量受主金属冶炼节奏约束。"},
  bismuth:{form:"金属铋及制品、锗酸铋和特定有机铋化合物",use:"医药、低熔点合金、焊料、晶体和电子材料",chain:"铅钨冶炼副产 → 精炼铋 → 合金/化合物 → 医药与电子终端",risk:"跨境电商以玩具、装饰品、零配件夹带铋块或铋晶体",check:"聚合9610清单，核对平台商品页、材质、重量、寄件主体和许可证",outlook:"供给高度依赖铅锌钨冶炼副产，回收和替代可缓冲但难快速形成大规模新增。"},
  molybdenum:{form:"高纯细颗粒钼粉及合金颗粒和相关生产技术",use:"高温合金、钢铁、电子、催化和航空航天",chain:"钼矿 → 氧化钼/钼铁 → 高纯粉末/合金颗粒 → 高温部件",risk:"普通钼粉与高纯细颗粒受控物项混报，粒度和纯度字段缺失",check:"核对纯度、粒径分布、合金成分、生产工艺、用途与许可证",outlook:"全球矿端较分散，但高纯粉末和先进合金制备仍是供应链瓶颈。"},
  indium:{form:"磷化铟、三甲基铟、三乙基铟及相关技术",use:"显示面板、光通信、化合物半导体和光伏",chain:"锌冶炼副产 → 精炼铟 → 磷化铟/有机铟 → 显示与光通信",risk:"以靶材、电子材料或化学试剂申报而弱化化合物和技术属性",check:"核对化学式、纯度、包装、终端外延/显示能力、用途和许可证",outlook:"海外扩产依赖锌冶炼副产和回收，精炼与化合物环节的认证周期较长。"},
  samarium:{form:"金属钐、含钐合金、靶材、氧化物、化合物及钐钴磁材",use:"高温永磁、电机、传感器、航空航天和国防",chain:"稀土矿 → 分离氧化物 → 金属/合金 → 钐钴磁体",risk:"以磁铁、磁性组件或加工贸易复出方式申报但未披露钐含量",check:"核对成分检测、磁体牌号、加工贸易手册、许可证和最终用途",outlook:"海外项目正在补分离和磁材能力，高温钐钴磁体的合金与认证仍是短板。"},
  gadolinium:{form:"金属钆、含钆合金、靶材、氧化物和化合物",use:"磁共振、核技术、磁制冷、光学与特种合金",chain:"稀土矿 → 钆分离 → 金属/氧化物 → 医疗与核技术终端",risk:"混合稀土或医疗材料申报缺少钆比例、同位素或最终用途说明",check:"核对成分、同位素/纯度要求、医疗或核终端资质、许可与流向",outlook:"海外具备少量分离基础，但高纯产品和特定同位素供应仍集中。"},
  terbium:{form:"金属铽、合金、靶材、氧化物、化合物及含铽永磁材料",use:"高矫顽力磁体、照明荧光、传感与国防电子",chain:"稀土矿 → 铽分离 → 晶界扩散/磁材 → 电机与军工终端",risk:"申报磁铁或磁性组件时未披露微量铽掺杂和晶界扩散工艺",check:"核对元素检测、牌号、扩散工艺、客户认证、许可证及再出口",outlook:"海外重稀土分离尚在试产或建设阶段，短期可交付量有限。"},
  dysprosium:{form:"金属镝、合金、靶材、氧化物、化合物及含镝永磁材料",use:"高温钕铁硼、电动车、风电、机器人和国防",chain:"中重稀土矿 → 镝分离 → 晶界扩散/磁材 → 高温电机",risk:"磁钢混入非管制货物或以普通磁铁申报，镝含量与牌号未披露",check:"抽样检测镝含量，核对牌号、BOM、混装记录、许可和最终用户",outlook:"Serra Verde提供矿端增量，分离、金属和磁体环节仍需跨国衔接。"},
  lutetium:{form:"金属镥、镱镥合金、镥靶、氧化物及化合物",use:"PET闪烁晶体、催化、激光、核医学和特种合金",chain:"稀土矿 → 镥分离 → 高纯氧化物/靶材 → 医疗与科研终端",risk:"以科研样品、晶体原料或混合稀土申报，实际高纯镥含量不明",check:"核对纯度、批次重量、科研合同、终端设备能力、许可与付款",outlook:"需求量小但纯化难度高，海外扩产难通过规模效应快速降本。"},
  scandium:{form:"金属钪、含钪合金、钪靶、氧化物及化合物",use:"铝钪合金、固体氧化物燃料电池、激光与航空航天",chain:"镍钴/钛锆副产 → 氧化钪 → 铝钪母合金 → 航空与能源",risk:"以铝合金添加剂、靶材样品或普通氧化物申报，钪含量不明",check:"核对成分、母合金牌号、最终用户研发/产线能力、许可和用途",outlook:"澳大利亚Syerston计划2026年下半年开工，预计供给仍有建设与认证周期。"},
  yttrium:{form:"金属钇、含钇合金、靶材、氧化物及化合物",use:"陶瓷、激光、荧光体、超导、涂层和电子材料",chain:"稀土矿 → 氧化钇分离 → 陶瓷/靶材 → 光电与高温终端",risk:"以金属靶材样品、陶瓷原料或混合物申报并低报价格",check:"核对成分纯度、靶材规格、历史同类价格、许可证和最终用途",outlook:"部分海外矿可伴生钇，但高纯分离和稳定规格交付仍需爬坡。"},
  holmium:{form:"金属钬、含钬合金及相关材料、氧化物和化合物",use:"激光、磁通集中器、核技术和医疗",chain:"稀土矿 → 钬分离 → 高纯材料 → 激光与科研终端",risk:"暂停范围被误当现行管制，或科研样品缺少成分与用途证明",check:"先核对交易时点与政策状态，再核对纯度、科研合同和最终用户",outlook:"小众需求使海外项目更依赖多元素联产，单一钬项目经济性弱。"},
  erbium:{form:"金属铒、含铒合金及相关材料、氧化物和化合物",use:"光纤放大器、激光、玻璃着色和医疗",chain:"稀土矿 → 铒分离 → 掺铒材料 → 光通信与激光",risk:"以光纤添加剂或科研化学品申报，未说明铒含量与材料形态",check:"先核对暂停状态，再核对配方、纯度、终端光纤/激光能力和用途",outlook:"光通信需求稳定，但高纯分离与掺杂材料认证构成进入门槛。"},
  thulium:{form:"金属铥、靶材及相关材料、氧化物和化合物",use:"医用激光、便携X射线源、科研和特种光纤",chain:"稀土矿 → 铥分离 → 激光材料 → 医疗与科研终端",risk:"极小批量高价值样品频繁快件出口，申报资料无法解释用途",check:"先核对暂停状态，聚合同址快件并核对医院/实验室终端和付款",outlook:"市场规模小、分离成本高，海外供应多依附综合稀土项目。"},
  europium:{form:"金属铕、含铕合金及相关材料、氧化物和化合物",use:"荧光粉、防伪、核技术和显示材料",chain:"稀土矿 → 铕分离 → 荧光材料 → 显示与防伪终端",risk:"以颜料、荧光粉或混合稀土申报，铕价态、含量和用途不清",check:"先核对暂停状态，再核对配方、价态、光谱检测、客户产线和用途",outlook:"回收旧荧光粉可补充少量供给，但纯化与经济性限制扩张。"},
  ytterbium:{form:"金属镱、靶材及相关材料、氧化物和化合物",use:"光纤激光、特种合金、原子钟和科研",chain:"稀土矿 → 镱分离 → 掺镱材料/靶材 → 激光与科研",risk:"以激光耗材、靶材样品或普通化合物申报，纯度与用途缺失",check:"先核对暂停状态，再核对纯度、产品型号、终端激光能力和用途",outlook:"高功率光纤激光拉动高纯需求，海外供应仍依赖综合分离设施。"},
  lithium:{form:"暂停措施涉及的高能量密度电池、特定正极材料、设备和技术",use:"动力电池、储能、消费电子和电池制造装备",chain:"锂矿/盐湖 → 锂盐 → 正极/电芯 → 汽车与储能",risk:"把原矿、锂盐、正极材料、电池和设备混为同一政策范围",check:"先核对暂停状态，再核对能量密度、配方、设备型号、技术附件和用途",outlook:"Keliber等项目进入爬坡，但矿山、精炼和电池材料各环节成熟度不同。"},
  nickel:{form:"暂停措施涉及的镍钴锰/镍钴铝前驱体，并非镍矿全面管制",use:"不锈钢、高镍电池、合金和电镀",chain:"镍矿 → 镍中间品/一级镍 → 前驱体 → 电池与合金",risk:"镍矿、MHP、硫酸镍和NCM前驱体概念混用导致政策误判",check:"核对化学组成、镍钴锰比例、产品阶段、暂停状态和技术附件",outlook:"NorthMet等项目继续调整方案，矿端增量到电池级材料仍需精炼转换。"},
  cobalt:{form:"暂停措施涉及的含钴前驱体，并非钴矿或一般钴产品全面管制",use:"电池、高温合金、硬质合金、催化和磁材",chain:"铜钴矿/镍副产 → 中间品 → 硫酸钴/前驱体 → 电池与合金",risk:"钴粉、合金粉与电池前驱体使用宽泛品名，成分和最终用途缺失",check:"核对形态、粒度、NCM比例、终端行业、暂停状态及其他管制规则",outlook:"供应多集中于铜钴矿和镍项目副产，精炼地域集中度仍高。"},
  manganese:{form:"暂停措施涉及富锂锰基正极和特定前驱体，并非锰矿全面管制",use:"钢铁、电池正极、化工和合金",chain:"锰矿 → 电解锰/高纯硫酸锰 → 正极材料 → 电池",risk:"锰矿、普通硫酸锰和电池级高纯材料混报，配方与纯度不清",check:"核对纯度杂质、粒径、正极配方、暂停状态、设备与技术附件",outlook:"矿端较分散，但电池级高纯硫酸锰和客户认证是新增供应瓶颈。"}
};
const strategicMineralCampaign={
  country:"中国",agency:"国家出口管制工作协调机制办公室",date:"2025-05-09",mineral:"战略矿产",direction:"—",status:"专项部署",title:"多部门部署打击战略矿产走私出口专项行动",
  finding:"公开部署将伪报瞒报、夹藏走私和经第三国转口列为重点打击的规避手法；该信息是监管关注方向，不等同于对具体企业或交易的违法认定。",
  source:"https://exportcontrol.mofcom.gov.cn/article/gndt/202505/1136.html"
};
const intelProfiles={
  "ga-ge":{updates:[
    {date:"2023-07-03",type:"物项管制",title:"镓、锗相关物项出口管制持续适用",summary:"筛查应以物项技术指标、形态和用途为核心，不能仅凭商品名称或税号判断是否受控。",sourceName:"商务部、海关总署",source:"https://dcj.mofcom.gov.cn/article/zcfb/zcblgg/202307/20230703419666.shtml"}
  ],cases:[],signals:[
    {level:"高",title:"高纯材料以普通金属或化工品申报",analysis:"品名、纯度证明、检测报告与最终用途说明不能相互印证时，应关注物项识别偏差或申报失实风险。",check:"核验纯度、晶体/粉末形态、检测报告、最终用户和许可证。"},
    {level:"中高",title:"第三国贸易商代替真实终端采购",analysis:"贸易商无相应加工能力、却采购异常规格或数量时，仅构成进一步核查信号。",check:"调取终端用户声明、再出口安排、付款路径和后续进口记录。"}
  ]},
  graphite:{updates:[
    {date:"2026-05",type:"公开合规案例",title:"特定石墨制品无证出口风险被官方案例提示",summary:"公开案例提示：高纯、高强、高密人造石墨及特定天然石墨制品应先完成技术参数判定和许可核验。",sourceName:"中国出口管制信息网",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1289.html"},
    {date:"2023-10-20",type:"物项管制",title:"石墨物项临时出口管制措施优化调整",summary:"申报与合规审查应保留技术说明或检测报告，避免以“普通石墨制品”等笼统品名替代参数判断。",sourceName:"商务部、海关总署",source:"https://interview.mofcom.gov.cn/mofcom_interview/front/opdata/downlodePdf?id=20231003447368"}
  ],cases:[{country:"中国",agency:"公开合规案例",date:"2026-05",mineral:"石墨制品",direction:"目的地未披露",title:"特定石墨制品未经许可出口的合规案例",finding:"官方案例指出企业未完成属性判定、未申请许可及未如实申报的风险；公开内容未披露企业名称。",status:"公开案例",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1289.html"}],signals:[
    {level:"高",title:"以“普通石墨制品”笼统申报",analysis:"未提供纯度、抗折强度、密度等参数或检测报告，可能导致受控属性无法核验。",check:"比对技术规格、检测报告、合同用途与许可状态。"},
    {level:"中高",title:"耐火材料、模具材料与石墨制品描述不一致",analysis:"货物形态、用途和申报品名明显不匹配时，应作为查验与归类复核信号。",check:"核查产品图片、材质证明、生产工艺和最终用户。"}
  ]},
  antimony:{updates:[
    {date:"2025-10-30",type:"贸易管理",title:"钨、锑出口国营贸易企业申报条件更新",summary:"出口经营主体资格、实绩和合规能力仍是锑相关交易的基础核验要素。",sourceName:"商务部",source:"https://wms.mofcom.gov.cn/zcfb/wmgl/art/2025/art_f2e90ff3e6964eb295059c17501b9bd4.html"}
  ],cases:[],signals:[
    {level:"高",title:"品名、化学形态与成分检测不一致",analysis:"锑金属、氧化物、硫化物及含锑制品的申报材料互相矛盾时，需要排除规避物项识别的可能。",check:"核验成分、形态、规格、归类依据和许可证件。"},
    {level:"中高",title:"国营贸易资格与实际出口人不匹配",analysis:"合同主体、报关主体、供货方和收款方分离且缺少合理商业解释时，应提高核验优先级。",check:"穿透核验经营资质、委托关系、资金流和货物流。"}
  ]},
  diamond:{updates:[
    {date:"2025-10-09",type:"政策状态",title:"人造金刚石扩围措施及既有超硬材料管制需区分核验",summary:"页面研判应区分仍有效的既有措施与已暂停的扩围措施，不能将暂停范围直接作为当前违规判断依据。",sourceName:"商务部、海关总署",source:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_628491c002b940ad906efc445b1ee260.html"},
    {date:"2024-08",type:"许可提示",title:"锑及超硬材料相关物项出口许可要求持续适用",summary:"超硬材料交易应关注粒径、单晶/微粉形态、设备和工艺技术等边界信息。",sourceName:"商务部",source:"https://www.mofcom.gov.cn/cms_files/filemanager/1077459795/attach/20248/11e73e55f0f549fc9922625a0c046f38.pdf"}
  ],cases:[{country:"公开信息",agency:"资料核验",date:"2026-07",mineral:"人造金刚石",direction:"—",title:"当前采集批次未检索到可核验的矿种定向查发公告",finding:"该状态不代表不存在风险，仅表示本批次已纳入页面的公开来源未发现可直接归属于人造金刚石的执法个案。",status:"待持续采集",source:"https://www.mofcom.gov.cn/zcfb/blgg/gg/2025/index.html"}],signals:[
    {level:"中高",title:"粒径、晶型或用途描述缺失",analysis:"微粉、单晶、线锯和砂轮等形态混用且技术指标缺失时，难以完成物项边界判断。",check:"补充粒径、晶型、用途、产品图纸和检测材料。"},
    {level:"中",title:"设备、耗材与工艺服务拆分交易",analysis:"设备、部件、耗材和技术服务拆分签约时，应合并评估是否落入当前有效管制范围。",check:"关联核验订单、发票、技术附件和交付安排。"}
  ]},
  "five-metals":{updates:[
    {date:"2025-02-04",type:"物项管制",title:"碲、铋、钼、铟相关物项实施出口管制",summary:"相关物项的判断须结合公告管制编码、技术参数、物质形态及用途；参考税号不替代物项识别。",sourceName:"商务部、海关总署",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/lywxcx/gzqd/202502/1102.html"},
    {date:"2025-03",type:"物项识别",title:"碲、铋、钼、铟相关物项识别口径公开答复",summary:"出口前应结合物质成分、技术参数、形态与用途完成管制属性判断；无法判断时可向主管部门申请业务咨询。",sourceName:"中国出口管制信息网",source:"https://exportcontrol.mofcom.gov.cn/article/cjwt/202503/1112.html"}
  ],cases:[{country:"中国",agency:"长沙黄花机场海关、威海海关",date:"2021—2025",mineral:"钨、铋、钴等金属粉末",direction:"中国 → 美国、印度、马来西亚等",title:"金属粉末被伪报为其他品名并通过快件出口",finding:"官方案例梳理提及铋等金属粉末的伪报品名及商品编号情形；页面不据此推定其他矿种存在同类违法。",status:"行政处罚 / 刑事立案",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1291.html"}],signals:[
    {level:"高",title:"金属粉末、氧化物与普通化工品描述混用",analysis:"成分、纯度、粒度、用途与申报品名之间存在矛盾时，需要优先排除伪报或错误归类。",check:"核验检测报告、包装标签、MSDS、税号和许可证。"},
    {level:"中高",title:"小批量快件与第三方付款组合出现",analysis:"简易渠道、拆分发运和付款方与收货方不一致仅构成异常信号，仍需单证和交易背景佐证。",check:"按主体、地址、货代及时间窗口聚合核查。"}
  ]},
  "seven-ree":{updates:[
    {date:"2025-04-04",type:"物项管制",title:"七类中重稀土相关物项实施出口管制",summary:"钐、钆、铽、镝、镥、钪、钇的金属、特定合金、靶材、氧化物、化合物及部分永磁材料进入管制范围。",sourceName:"商务部、海关总署",source:"https://www.mofcom.gov.cn/zwgk/zcfb/art/2025/art_9c2108ccaf754f22a34abab2fedaa944.html"},
    {date:"2025-10-09",type:"技术与服务边界",title:"稀土相关技术及服务链条的合规边界进一步明确",summary:"开采、分离、金属冶炼、磁材和二次资源相关技术及实质性支持需结合公告及当前政策状态进行核验。",sourceName:"商务部",source:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_1d675441e55d43af97d8b4371081a778.html"}
  ],cases:[{country:"中国",agency:"广东省高级人民法院",date:"2009—2023",mineral:"钇、氧化钪等稀土",direction:"中国 → 境外",title:"稀土产品长期伪报为“金属靶材样品”出口",finding:"公开报道显示案件涉及无证出口、伪报品名和低报价格；具体责任以生效裁判文书为准。",status:"刑事判决",source:"https://swt.fujian.gov.cn/xxgk/jgzn/jgcs/myycyaqc/gzdt_475/202512/t20251223_7049515.htm"}],signals:[
    {level:"高",title:"稀土氧化物、靶材与“样品”用途不匹配",analysis:"异常小批量高价值样品、重复拆分或用途说明无法支持采购规模时，应优先核验实际物项及最终用途。",check:"核验成分、磁材/靶材规格、客户资质、最终用户及许可证。"},
    {level:"中高",title:"金属、合金、氧化物和混合物之间形态转换",analysis:"交易链中多次改变品名或形态、但缺少加工能力和工艺记录时，可能影响物项识别。",check:"核验加工记录、收发存、检测报告、物流和再出口安排。"}
  ]},
  "five-ree":{updates:[
    {date:"2025-10-09",type:"政策状态",title:"五类中重稀土相关物项措施需关注暂停状态",summary:"钬、铒、铥、铕、镱相关扩围措施应按公告及暂停公告核验；暂停期间不得将该暂停措施作为单独的违法判定依据。",sourceName:"商务部、海关总署",source:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_b9cf403808634a649ce8b3f921f4dcf3.html"},
    {date:"2025-10-09",type:"技术边界",title:"稀土技术、设备与原辅料的关联风险持续需要识别",summary:"货物、设备、技术服务及境外支持活动的合规性应分别判断，并留存物项和技术边界材料。",sourceName:"商务部",source:"https://www.mofcom.gov.cn/zfxxgk/gkml/art/2025/art_1d675441e55d43af97d8b4371081a778.html"}
  ],cases:[{country:"公开信息",agency:"资料核验",date:"2026-07",mineral:"钬、铒、铥、铕、镱",direction:"—",title:"当前采集批次未检索到可核验的矿种定向查发公告",finding:"页面保留政策状态和通用异常核验项；未检索到公开案例不等于不存在违法风险。",status:"待持续采集",source:"https://www.mofcom.gov.cn/zcfb/blgg/gg/2025/index.html"}],signals:[
    {level:"中高",title:"将已暂停措施与现行措施混同适用",analysis:"政策状态识别错误会造成误判；风险筛查必须以交易时间、物项参数和当期有效规则为前提。",check:"先核验交易日期、公告生效与暂停节点，再开展单证和用途核验。"},
    {level:"中",title:"稀土化合物或混合物缺少成分证明",analysis:"成分边界不清会影响归类和监管属性判断，但不能据此直接推定存在违规。",check:"补充检测报告、配方、生产记录及最终用途说明。"}
  ]},
  battery:{updates:[
    {date:"2025-10-09",type:"政策状态",title:"锂电池和人造石墨负极材料相关措施需按当前状态核验",summary:"相关措施针对特定下游材料、设备和技术，并非对锂、镍、钴、锰原矿的一般性全面管制；页面筛查需避免扩大解释。",sourceName:"商务部、海关总署",source:"https://interview.mofcom.gov.cn/mofcom_interview/front/opdata/downlodePdfNew?id=ea1c3c25d9094e40a70c9c2d887953f8"},
    {date:"2025-11-07",type:"政策状态",title:"涉及暂停事项的交易须以交易时点和具体物项为准",summary:"风险研判先确认所涉是否为特定正负极材料、设备或技术，再核验公告当期效力，避免将原矿或非受控货物误判。",sourceName:"商务部、海关总署",source:"https://www.mofcom.gov.cn/zfxxgk/fdzdgknr/ztfl/dwmygl/art/2025/art_00667414c0524b018985abd28b8847a5.html"}
  ],cases:[{country:"公开信息",agency:"资料核验",date:"2026-07",mineral:"锂、镍、钴、锰下游材料",direction:"—",title:"当前采集批次未检索到可核验的矿种定向查发公告",finding:"当前页面仅展示与特定下游材料、设备和技术有关的政策状态；不将其延伸为原矿走私结论。",status:"待持续采集",source:"https://www.mofcom.gov.cn/zcfb/blgg/gg/2025/index.html"}],signals:[
    {level:"中高",title:"原矿、前驱体、正负极材料与设备概念混用",analysis:"物项层级混同会造成政策适用错误，也可能掩盖真实产品形态。",check:"核验化学配方、能量密度、粒度、用途、设备型号与技术附件。"},
    {level:"中",title:"政策生效或暂停期间判断缺失",analysis:"不先核验交易时点与规则状态，不能将异常贸易直接标注为违规。",check:"建立“交易日期—物项参数—规则状态—许可材料”四步复核。"}
  ]}
};
const exportLicenseDirectory2026={date:"2026-01-01",type:"年度贸易管理",title:"《出口许可证管理货物目录（2026年）》实施",summary:"2026年目录继续覆盖稀土、钨及钨制品、钼及钼制品、锑及锑制品、铟及铟制品等；如同时落入两用物项清单，仍须依法申请两用物项和技术出口许可证。",sourceName:"商务部、海关总署",source:"https://www.mofcom.gov.cn/zwgk/zcfb/art/2025/art_0ac7e2005ff04c488daa3add8972ea36.html"};
const currentCaseReference2026={date:"2026-05",type:"公开合规案例",title:"两用物项申报不实与参数瞒报的执法参照",summary:"公开案例梳理提及特种石墨、锗镜片和锂电池等达到技术参数的物项；伪报税号、低报货值、瞒报规格或拆分货物会触发许可与申报核验。内容未披露适用于所有矿种的定向企业名单。",sourceName:"中国出口管制信息网",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1290.html"};
const galliumRecoveryUpdate2026={date:"2026-07-14",type:"海外供应链",title:"美澳日与 Alcoa 对西澳镓项目作出最终投资决定",summary:"Alcoa 公布美澳日三方支持西澳镓项目的最终投资决定，项目旨在新增可靠的镓供应来源；页面将其作为海外替代供应链建设进展，不将其表述为已形成商业产量。",sourceName:"Alcoa 官方公告",source:"https://news.alcoa.com/press-releases/press-release-details/2026/Australia-Japan-the-United-States-and-Alcoa-Announce-Final-Investment-Decision-for-Gallium-Project-in-Western-Australia/default.aspx"};
const usByproductRecoveryUpdate2026={date:"2026-07-01",type:"海外供应链",title:"美国能源部资助煤基原料副产关键矿产回收项目",summary:"美国能源部宣布 7500 万美元支持 5 个试点项目，从煤炭及煤基原料中回收稀土及镓、锗等副产关键材料；该信息反映海外正在推进副产物回收路线，项目产能和投产进度仍需持续核验。",sourceName:"美国能源部",source:"https://www.energy.gov/cmei/articles/does-office-critical-minerals-and-energy-innovation-awards-75-million-accelerate"};
const teckGeSbUpdate2026={date:"2026-07-07",type:"海外供应链",title:"加拿大支持 Trail 冶炼体系关键矿产加工能力扩展",summary:"加拿大自然资源部披露，Teck Trail Operations 的扩展计划可增强关键矿产加工能力，并可能使锗、锑产能翻倍、增加镓生产能力；属于项目与投资安排，实际扩产结果仍待后续建设与运营核验。",sourceName:"加拿大自然资源部",source:"https://www.canada.ca/en/natural-resources-canada/news/2026/07/canada-announces-first-agreement-under-new-canada-critical-minerals-accelerator.html"};
const euBatteryProjectsUpdate2026={date:"2025-12-03",type:"海外供应链",title:"欧盟提出 2026—2027 年关键原材料与电池材料投资安排",summary:"欧盟委员会文件提出通过 InvestEU、创新基金和 Battery Booster 支持关键原材料供应链，其中电池价值链项目覆盖锂、钴、镍、锰和石墨；该信息属于政策与融资安排，不代表单个项目已投产。",sourceName:"欧盟委员会",source:"https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=celex%3A52025DC0945"};
const euStrategicProjectUpdate2025={date:"2025-06-04",type:"代表性项目",title:"欧盟战略项目名单纳入石墨、锂、镍和钴相关项目",summary:"欧盟委员会战略项目决定列出乌克兰 Balakhivka 石墨、挪威/格陵兰石墨、加拿大 Dumont 镍钴、塞尔维亚 Jadar 锂等项目；项目为获认定的战略项目，并不等于全部已建成投产。",sourceName:"EUR-Lex",source:"https://eur-lex.europa.eu/legal-content/en/ALL/?uri=CELEX%3A32025D1174"};
const usRareEarthUpdate2026={date:"2026-01-26",type:"海外供应链",title:"美国推进覆盖多种中重稀土的矿山—磁材一体化布局",summary:"美国商务部 CHIPS 项目意向书披露，USA Rare Earth 的德州项目规划处理混合稀土碳酸盐、重稀土和关键矿物氧化物，公开列及钇、镝、铽、钬、镥、铒、铥、镱、钆等；项目进度仍须以许可、融资和建设披露为准。",sourceName:"美国商务部 NIST",source:"https://www.nist.gov/news-events/news/2026/01/department-commerces-chips-program-announces-letter-intent-usa-rare-earth"};
const scandiumProjectUpdate2026={date:"2026-07-04",type:"代表性项目",title:"澳大利亚 Syerston 钪项目获特许费递延支持",summary:"新南威尔士州政府称 Syerston Scandium Project 预计 2026 年下半年开工、2028 年中开始生产；该信息是政府公布的项目时间表，后续应结合实际建设节点持续核验。",sourceName:"新南威尔士州政府",source:"https://www.nsw.gov.au/ministerial-releases/two-major-nsw-critical-minerals-projects-to-benefit-from-australia-first-royalty-deferral-scheme"};
const antimonyProjectUpdate2026={date:"2026-04-07",type:"海外供应链",title:"美国 Antimony Ridge 项目获得 FAST-41 透明度项目资格",summary:"美国联邦许可改进委员会将 Antimony Ridge Project 纳入 FAST-41 透明度项目，公开说明该项目面向锑资源开发；该资格旨在提升许可过程透明度，不代表已投产或已形成替代供给。",sourceName:"美国联邦许可改进委员会",source:"https://www.permitting.gov/newsroom/press-releases/antimony-ridge-project-gains-fast-41-transparency-project-status"};
const galliumFidUpdate2026={date:"2026-07-15",type:"代表性项目",title:"西澳Wagerup镓回收项目作出最终投资决定",summary:"JOGMEC披露，与双日、美澳政府机构及Alcoa共同推进的西澳Wagerup氧化铝精炼厂镓生产项目已作出最终投资决定；项目仍须经历建设、调试和产品认证。",sourceName:"JOGMEC",source:"https://www.jogmec.go.jp/news/release/release_01306.html"};
const germaniumIsotopeUpdate2026={date:"2026-07-16",type:"技术与供应",title:"美国能源部披露锗同位素生产能力取得进展",summary:"美国能源部披露ORNL与PNNL在高纯锗烷及稳定锗同位素供应方面取得进展；这是量子科研所需的特定同位素能力，不等同于常规金属锗或红外锗材料产能。",sourceName:"美国能源部",source:"https://www.energy.gov/science/articles/silencing-noise-doe-unveils-breakthrough-domestic-silicon-and-germanium-isotope"};
const antimonyPilotUpdate2026={date:"2026-07-30",type:"代表性项目",title:"美国爱达荷国家实验室启用锑分离试验厂",summary:"INL启用试验设施，计划处理Stibnite Gold Project矿石并形成锑分离运行数据；当前属于工艺验证节点，不能按稳定商业供应计入。",sourceName:"Idaho National Laboratory",source:"https://inl.gov/news-release/inl-hosts-ribbon-cutting-for-pilot-plant-supporting-domestic-antimony-production/"};
const graphiteMatawinieUpdate2026={date:"2026-05-19",type:"代表性项目",title:"加拿大Matawinie石墨矿启动建设并形成政府承购安排",summary:"加拿大重大项目办公室披露Matawinie项目启动建设，政府承购安排为每年3万吨石墨精矿；矿山建设和承购不等同于电池级负极材料已形成商业交付。",sourceName:"加拿大政府",source:"https://www.canada.ca/en/privy-council/major-projects-office/projects/national/nouveau-monde.html"};
const lithiumKeliberUpdate2026={date:"2026-05-04",type:"代表性项目",title:"芬兰追加资本支持Keliber锂项目爬坡",summary:"芬兰政府决定向Finnish Minerals Group注资4000万欧元，用于Keliber一体化锂矿—精炼项目爬坡；实际产量仍需以项目运营披露核验。",sourceName:"芬兰政府",source:"https://valtioneuvosto.fi/en/-/state-to-inject-eur-40-million-in-capital-into-finnish-minerals-group-for-ramp-up-of-keliber-lithium-project"};
const nickelCobaltNorthMetUpdate2026={date:"2026-07-29",type:"代表性项目",title:"NorthMet镍钴项目提交设计调整",summary:"明尼苏达自然资源部门披露NewRange对NorthMet铜镍钴项目提出设计调整；项目仍处许可与方案调整阶段，不能计为新增商业供给。",sourceName:"Minnesota DNR",source:"https://www.dnr.state.mn.us/lands_minerals/new-range/index.html"};
function currentIntelUpdates(selected,profile){
  if(selected.id==="tungsten") return [];
  const additions=[];
  if(selected.id==="gallium") additions.push(galliumFidUpdate2026,galliumRecoveryUpdate2026,usByproductRecoveryUpdate2026);
  if(selected.id==="germanium") additions.push(germaniumIsotopeUpdate2026,teckGeSbUpdate2026,usByproductRecoveryUpdate2026);
  if(selected.id==="antimony") additions.push(antimonyPilotUpdate2026,teckGeSbUpdate2026,antimonyProjectUpdate2026,exportLicenseDirectory2026);
  if(selected.id==="graphite") additions.push(graphiteMatawinieUpdate2026,euBatteryProjectsUpdate2026,euStrategicProjectUpdate2025);
  if(selected.id==="lithium") additions.push(lithiumKeliberUpdate2026,euBatteryProjectsUpdate2026,euStrategicProjectUpdate2025);
  if(["nickel","cobalt"].includes(selected.id)) additions.push(nickelCobaltNorthMetUpdate2026,euBatteryProjectsUpdate2026,euStrategicProjectUpdate2025);
  if(selected.id==="manganese") additions.push(euBatteryProjectsUpdate2026,euStrategicProjectUpdate2025);
  if(["samarium","gadolinium","terbium","dysprosium","lutetium","yttrium","holmium","erbium","thulium","europium","ytterbium"].includes(selected.id)) additions.push(usRareEarthUpdate2026);
  if(selected.id==="scandium") additions.push(scandiumProjectUpdate2026,usRareEarthUpdate2026);
  if(["tellurium","bismuth","molybdenum","indium"].includes(selected.id)) additions.push(exportLicenseDirectory2026);
  if(["samarium","gadolinium","terbium","dysprosium","lutetium","scandium","yttrium"].includes(selected.id)) additions.push(exportLicenseDirectory2026);
  if(["germanium","graphite","lithium"].includes(selected.id)) additions.push(currentCaseReference2026);
  return additions;
}
function noDirectMineralCase(selected){return {country:"公开信息",agency:"资料核验",date:"2026-07",mineral:selected.name,direction:"—",title:`当前采集批次未检索到可核验的${selected.name}定向查发公告`,finding:"本页面仅展示与该矿种直接关联的公开案例。未检索到不代表不存在风险，后续将继续按官方执法、司法和海关公开信息补充。",status:"待持续采集",source:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1290.html"};}
function enforcementCasesForMineral(selected,profile){
  if(selected.id==="tungsten") return [...tungstenCases,...verifiedEnforcementCases.tungsten];
  if(selected.id==="bismuth") return verifiedEnforcementCases.bismuth;
  if(selected.id==="antimony") return verifiedEnforcementCases.antimony;
  if(selected.id==="graphite") return verifiedEnforcementCases.graphite;
  if(selected.id==="gallium") return verifiedEnforcementCases["ga-ge"];
  if(selected.id==="germanium") return [...verifiedEnforcementCases.germanium,...verifiedEnforcementCases["ga-ge"]];
  const rareEarthKeywords={samarium:"钐",terbium:"铽",dysprosium:"镝"};
  if(rareEarthKeywords[selected.id]){
    const cases=verifiedEnforcementCases["rare-earth-magnets"].filter(item=>item.mineral.includes(rareEarthKeywords[selected.id]));
    if(cases.length) return cases;
  }
  return profile?.cases||[];
}

// 总览和文件库使用同一份已归档案例集合，避免只统计钨矿数组而遗漏其他矿种。
function allArchivedEnforcementCases(){
  const grouped=Object.values(verifiedEnforcementCases).flat();
  const seen=new Set();
  return [...tungstenCases,...grouped].filter(item=>{
    const key=[item.title,item.date,item.country,item.agency].join("|");
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
}
// 总览统计一律从已归档的数据集合计算：避免新增快照或案例后仍显示旧的固定数字。
function allArchivedIntelligenceSnapshots(){
  const profileUpdates=Object.values(intelProfiles||{}).flatMap(profile=>profile.updates||[]);
  const records=[...(window.intelligenceSnapshots||[]),...profileUpdates];
  const seen=new Set();
  return records.filter(item=>{
    const key=[item.titleZh||item.title,item.sourceUrl||item.source,item.sourcePublished||item.date].join("|");
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
}
const aiFocusedMineralResearch={
  germanium:{
    title:"锗产品出口风险专题",boundary:"仅将 2023 年 8 月 1 日后、可经成分、形态或技术参数确认属于镓锗公告范围的交易纳入许可与申报核验。普通光学成品不能仅因含“锗”字样被判定受控。",
    tradeQuery:"建议商业数据检索：GERMANIUM / GERMANIUM LENS / GERMANIUM INGOT；结合 HS 811292、282739 及原产地中国；期间 2026-01-01 至今。",
    findings:[
      {tag:"公开执法参照",title:"2026 年公开合规案例提及锗镜片",body:"官方案例梳理将锗镜片列为达到技术参数后可能受控的典型物项，并提示伪报税号、低报货值、瞒报规格或拆分货物的核验风险。公开页面未披露涉案企业、提单或具体货运链条。",url:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1290.html"},
      {tag:"监管动态",title:"2026 年战略矿产违规举报范围明确覆盖拆分与虚假申报",body:"最新公告将未经许可、超许可、以改造或拆分为部件/组件规避许可等列为可举报的战略矿产两用物项违法违规情形。该规则用于完善核查口径，并不指向任何具体企业。",url:"https://exportcontrol.mofcom.gov.cn/article/zcfg/gnzcfg/zcfggzqd/202606/1299.html"},
      {tag:"物项边界",title:"锗金属、区熔锗锭与特定化合物需逐项识别",body:"出口管制判断以物项形态、技术说明和检测报告为基础，不能以“光学产品”“镜片”“半导体材料”等商业名称代替属性判断。",url:"https://www.mofcom.gov.cn/zcfb/blgg/art/2023/art_ca2e9d349361441f847bdabac5d8331b.html"},
      {tag:"贸易数据状态",title:"2026 年商业数据待完成有效筛选",body:"仅在“产品/HS、日期、原产地或中国供应商、目的地”至少两项筛选信号回显且首批记录字段匹配后，才会将外贸公社记录写入研判；当前没有已核验的企业、提单或集装箱记录。",url:""}
    ],
    chain:["锗金属/锗锭供应商","光学件或红外器件加工方","境外贸易商或进口商","红外光学、半导体等最终用户"],
    signals:[
      {level:"高",title:"“锗镜片/光学件”缺少材质与技术参数",body:"商业品名与成分、波段、尺寸或检测报告不一致时，无法完成受控属性判定。",check:"调取检测报告、技术规格、产品图纸、合同用途与许可证。"},
      {level:"中高",title:"贸易商替代终端用户且用途说明笼统",body:"收货人没有光学加工能力或采购规模明显超出经营范围时，仅构成最终用户核验信号。",check:"核验境外加工能力、最终用户声明、再出口安排和付款路径。"},
      {level:"中",title:"拆分为镜片、碎料或样品发运",body:"拆分本身不等于违规，但当同一主体持续小批量发运并伴随规格缺失时，应聚合复核。",check:"按企业、地址、货代和时间窗口汇总，核对装箱单与报关记录。"}
    ]
  },
  graphite:{
    title:"石墨产品出口风险专题",boundary:"仅将符合石墨公告技术参数或天然鳞片石墨及其制品范围、且处于当期有效政策窗口的交易纳入核验。贸易救济调查不等同于走私或出口管制违法。",
    tradeQuery:"建议商业数据检索：GRAPHITE / GRAPHITE ELECTRODE / NATURAL FLAKE GRAPHITE；结合产品参数、原产地中国及 2026-01-01 至今日期。不可仅按“石墨”关键词判定受控。",
    findings:[
      {tag:"公开执法参照",title:"2026 年公开案例提示特种石墨无证出口风险",body:"官方案例指出，高纯、高强、高密人造石墨及特定天然石墨制品须完成技术参数判定、许可核验和如实申报。公开材料未点名企业或具体境外收货人。",url:"https://exportcontrol.mofcom.gov.cn/article/hgfw/hgal/202605/1289.html"},
      {tag:"监管动态",title:"拆分、虚假申报与第三方转移均需纳入单证核查",body:"2026 年战略矿产监管公告将拆分规避许可、虚假申报及违规转移列为重点关注情形。石墨记录应同时核对产品参数、许可证、原产地、收货人和最终用途，不能仅按品名判断。",url:"https://exportcontrol.mofcom.gov.cn/article/zcfg/gnzcfg/zcfggzqd/202606/1299.html"},
      {tag:"供应链外部信号",title:"美国 2026 年对大直径石墨电极继续贸易调查",body:"USITC 公开信息涉及来自中国和印度的大直径石墨电极产业损害调查；这属于贸易救济程序，可用于观察市场与客户风险，不能据此认定中国企业存在走私或违规。",url:"https://www.usitc.gov/press_room/news_release/2026/er0409_68417.htm"},
      {tag:"贸易数据状态",title:"2026 年商业数据待完成有效筛选",body:"天然鳞片石墨、人造石墨、石墨电极和负极材料须分别检索；仅在筛选条件回显、结果字段匹配并完成技术参数核对后，才会写入企业或路线线索。当前没有已核验的企业、提单或集装箱记录。",url:""}
    ],
    chain:["石墨原料/人造石墨生产方","电极、模具或负极材料加工方","境外贸易商/仓储节点","钢铁、电池、半导体或军工相关终端"],
    signals:[
      {level:"高",title:"以“普通石墨制品/耐火材料”替代技术参数申报",body:"缺少纯度、抗折强度、密度或形态说明时，可能掩盖受控属性，也可能只是归类资料不完整。",check:"核验检测报告、产品规格、合同用途、生产工艺和许可证。"},
      {level:"中高",title:"石墨电极、负极材料与特种石墨混合检索或申报",body:"不同产品对应不同技术边界；混合描述会放大误判并掩盖实际货物形态。",check:"拆分核验产品型号、HS、用途、客户行业及材料参数。"},
      {level:"中",title:"贸易救济涉案市场与第三国转运路径叠加",body:"贸易救济本身不是违规事实；若同时存在中转、短期换收货人或单证字段矛盾，才形成优先调单线索。",check:"核对原产地、装运港、最终目的地、提单收货人及再出口单证。"}
    ]
  }
};
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

// === Tactical research tools: relationship graph, supply-chain path and Ollama Q&A ===
const tacticalResearchData={
  tungsten:{name:"钨",symbol:"W",basis:"2025年第10号公告自2025-02-04起实施",confidence:"已核验交易+官方规则",nodes:[
    {id:"cn",type:"country",label:"中国",sub:"原产国",x:8,y:48,details:["原产国字段：中国","中国实际出口主体：当前记录未披露，待反查"]},
    {id:"wc",type:"product",label:"碳化钨粉 GWC200H",sub:"CAS 12070-12-1 · 99.98%",x:27,y:20,details:["HS 28499000","20千克 · 1,028.40美元","用于工业生产锯片"]},
    {id:"policy",type:"policy",label:"2025年第10号公告",sub:"成分、粒度、形态和用途判定",x:27,y:72,details:["管制判断不能只看六位税号","交易发生日应与政策生效日联合校验"],url:policyGroups.find(p=>p.id==="five-metals").url},
    {id:"unknown",type:"company",label:"中国出口主体待反查",sub:"供应商字段未在当前记录展示",x:49,y:20,details:["需调取中国出口报关单、合同、发票和付款主体","不能以原产国字段替代出口主体认定"]},
    {id:"air",type:"route",label:"AIR · CIP",sub:"中国 → 越南海阳",x:49,y:72,details:["运输方式：航空","成交方式：CIP","进口类型：E11 生产原料"]},
    {id:"ehwa",type:"company",label:"EHWA GLOBAL",sub:"越南税号 0801227806",x:71,y:20,details:["地址：海阳省锦田—良田工业区 IN8.1","主营刀具、锯片、钻头等","登记为外商投资企业"]},
    {id:"doc",type:"document",label:"进口报关单",sub:"108256803100 · 2026-05-19",x:71,y:72,details:["越南进口数据来源","国家字段同时出现韩国，需要核对字段定义"]},
    {id:"use",type:"use",label:"锯片/切割刀具生产",sub:"工业终端用途",x:90,y:48,details:["商品描述与企业产品线具有表面一致性","仍需以最终用户、库存和实际投料记录核验"]}
  ],edges:[
    {from:"cn",to:"wc",label:"原产"},{from:"wc",to:"unknown",label:"出口申报",risk:"high"},{from:"policy",to:"wc",label:"物项判定"},{from:"unknown",to:"air",label:"承运"},{from:"air",to:"doc",label:"进口申报"},{from:"doc",to:"ehwa",label:"收货"},{from:"ehwa",to:"use",label:"加工用途"},{from:"policy",to:"unknown",label:"许可核验",risk:"high"}
  ],facts:["2026-05-19越南进口记录明确商品为碳化钨粉、CAS 12070-12-1、纯度99.98%","记录明确原产地和出口国家均为中国，目的地为越南","进口商、税号、报关单号、数量和金额可回溯"],risks:[
    {level:"高",title:"中国实际出口主体缺口",why:"进口侧记录不能回答由哪家中国企业办理出口及是否取得许可。",check:"以报关单108256803100、付款流水、空运单和供应商代码反查中国出口人及许可证号。"},
    {level:"中高",title:"国家字段口径不一致",why:"记录同时出现中国原产/出口与韩国国家代码，可能是供应商注册国、集团国别或数据映射。",check:"核对原始字段定义、商业发票抬头、贸易中间人和实际发货机场；仅凭该字段不能认定绕道。"},
    {level:"中",title:"单票小批量航空运输需聚合观察",why:"当前仅确认一票20千克交易，单票小批量本身不构成异常；只有聚合后发现连续小批次等附加信号时才提高优先级。",check:"按收发货人、CAS、牌号、地址和付款人聚合90天交易，核实是否存在重复批次及累计总量。"}
  ],sources:[{label:"越南进口报关单 108256803100",note:"商业数据库原始记录·需与海关单证复核"},{label:"商务部、海关总署2025年第10号公告",url:policyGroups.find(p=>p.id==="five-metals").url,note:"官方政策原文"}]},
  germanium:{name:"锗",symbol:"Ge",basis:"2023年第23号公告自2023-08-01起实施",confidence:"官方政策+公开处罚/起诉材料",nodes:[
    {id:"cn",type:"country",label:"中国",sub:"生产与出口端",x:8,y:48,details:["受控对象覆盖金属锗、区熔锗锭、二氧化锗、四氯化锗及特定衬底"]},
    {id:"prod",type:"product",label:"锗镜片/窗口片",sub:"易以功能品名替代材质",x:29,y:20,details:["公开案件常见申报：光学玻璃、光学镜片、文件","需要成分、基底和镀膜前后材质说明"]},
    {id:"case1",type:"company",label:"北京晶世博",sub:"公开处罚案例主体",x:50,y:12,details:["公开梳理称锗镜片申报为光学玻璃、测试片以文件寄递","来源等级B：待补原始处罚决定书"]},
    {id:"case2",type:"company",label:"福州光宏/宏振",sub:"公开处罚案例主体",x:50,y:48,details:["公开梳理称1016个锗镜片瞒报材质","来源等级B：待补原始处罚决定书"]},
    {id:"case3",type:"company",label:"兆晟科技",sub:"公司披露：刑事起诉阶段",x:50,y:82,details:["不得表述为已定罪","应跟踪裁判结果和涉案交易链"]},
    {id:"express",type:"route",label:"快件/航空口岸",sub:"DHL、机场等场景",x:72,y:25,details:["低重量、高价值光学元件适合快件运输","渠道属性不等同违法，但需材质穿透"]},
    {id:"dest",type:"country",label:"美国/立陶宛等",sub:"公开案件披露目的地",x:91,y:48,details:["最终用户和最终用途是许可证审查核心","目的地变化需与合同和付款路径核对"]},
    {id:"policy",type:"policy",label:"2023年第23号公告",sub:"许可与最终用途审查",x:28,y:77,details:["时间边界：2023-08-01","不能把生效前交易直接纳入违规判断"],url:policyGroups.find(p=>p.id==="ga-ge").url}
  ],edges:[{from:"cn",to:"prod",label:"生产"},{from:"policy",to:"prod",label:"材质判定"},{from:"prod",to:"case1",label:"案例关联",risk:"high"},{from:"prod",to:"case2",label:"案例关联",risk:"high"},{from:"prod",to:"case3",label:"起诉线索",risk:"medium"},{from:"case1",to:"express",label:"快件"},{from:"case2",to:"express",label:"出口"},{from:"express",to:"dest",label:"跨境"}],facts:["公开案件呈现高度一致的材质隐瞒模式：功能名称与真实锗材质分离","已有无证出口、申报不实、走私定性及刑事起诉等不同程序状态","案件信息的证据等级不同，需分别展示"],risks:[{level:"高",title:"功能品名掩盖受控材质",why:"“光学镜片/窗口片/测试片”不能体现锗含量和受控属性。",check:"将产品BOM、材质证明、红外光谱/成分检测、商品编码和许可证逐票匹配。"},{level:"高",title:"快件品名与包装用途失真",why:"申报“文件”等非货物品名会使材质审核失效。",check:"联查寄件账户、同址企业、DHL运单、样品合同和收款记录，按90天合并同类寄递。"},{level:"中高",title:"关联主体分单出口",why:"同一控制人或同一客户通过多主体出货可能割裂风险画像。",check:"以股东、电话、邮箱、地址、报关代理和境外收货人构建关联网络。"}],sources:[{label:"2023年第23号公告",url:policyGroups.find(p=>p.id==="ga-ge").url,note:"官方政策原文"},{label:"兆晟科技公司信息披露",url:enforcementCaseSources.zhaoSheng,note:"A等级·起诉阶段"},{label:"2026年公开处罚案例梳理",url:enforcementCaseSources.march,note:"B等级·待补原始决定书"}]},
  graphite:{name:"石墨",symbol:"C",basis:"2023年第39号公告自2023-12-01起实施",confidence:"官方政策+上市公司披露+境外媒体线索",nodes:[
    {id:"cn",type:"country",label:"中国",sub:"出口端",x:8,y:48,details:["技术参数决定是否列管：纯度、强度、密度、形态"]},
    {id:"prod",type:"product",label:"天然鳞片石墨",sub:"涉案指控1243.55吨",x:29,y:20,details:["公开披露称申报税号2504109900","案件处于起诉后程序"]},
    {id:"punai",type:"company",label:"濮耐股份相关主体",sub:"上市公司披露·刑事起诉",x:51,y:20,details:["指控涉及向境外全资子公司出口","关联交易不豁免许可证义务","不得表述为已生效定罪"]},
    {id:"sub",type:"company",label:"境外全资子公司",sub:"最终收货/关联主体",x:74,y:20,details:["需核验最终用户、再销售、库存和用途","关联关系是核查维度，不是违法证明"]},
    {id:"mold",type:"product",label:"高固定碳石墨模具",sub:"公开处罚梳理：申报为钢铁模具",x:29,y:76,details:["固定碳99.97%","中国 → 印度","来源等级B"]},
    {id:"uae",type:"route",label:"中国→阿联酋→伊朗",sub:"2018年境外媒体法院线索",x:58,y:78,details:["报道涉及8250千克、纯度87.3%天然石墨粉","时间早于2023年政策，不能按现行管制倒推违法"]},
    {id:"policy",type:"policy",label:"2023年第39号公告",sub:"参数化物项识别",x:91,y:52,details:["一般品名和六位税号不足以完成列管判断","需保留检测与技术说明"],url:policyGroups.find(p=>p.id==="graphite").url}
  ],edges:[{from:"cn",to:"prod",label:"出口"},{from:"prod",to:"punai",label:"案件指控",risk:"high"},{from:"punai",to:"sub",label:"关联交易",risk:"high"},{from:"cn",to:"mold",label:"制品出口"},{from:"mold",to:"policy",label:"参数判定"},{from:"cn",to:"uae",label:"历史路线"},{from:"uae",to:"policy",label:"时间隔离"}],facts:["天然石墨与人造石墨均需按公告参数而非名称单独判断","公开信息同时存在官方/公司披露、行业梳理和境外媒体三类证据层级","2018年路线线索早于现行管制生效，不能直接作为现行违规样本"],risks:[{level:"高",title:"税号替换与参数缺失",why:"使用宽泛税号或“其他石墨”描述可能绕开参数审核。",check:"比对原矿来源、粒度、固定碳/纯度、形态、合同用途、归类依据与许可证。"},{level:"高",title:"关联公司交易弱化最终用户审查",why:"境外子公司可能被误当作集团内部调拨而简化许可判断。",check:"核验关联公司加工能力、库存去向、再销售客户、最终用途承诺和资金回流。"},{level:"中",title:"历史中转路线误用",why:"旧案件可提示路线模式，但政策时间不同。",check:"仅将其用于路线布控；必须另找生效后同主体、同商品或同路线交易支撑。"}],sources:[{label:"2023年第39号公告",url:policyGroups.find(p=>p.id==="graphite").url,note:"官方政策原文"},{label:"濮耐股份公司信息披露",url:enforcementCaseSources.pouNai,note:"A等级·起诉阶段"},{label:"杰贝阿里港境外媒体线索",url:enforcementCaseSources.dubaiGraphite,note:"C等级·历史线索"}]}
};
let tacticalGraphState={mineral:"tungsten",node:null,type:"all"};
function riskClass(level){return level.indexOf('高')>=0?'high':level.indexOf('中')>=0?'medium':'low';}
function renderRelationshipGraphPage(){
  const data=tacticalResearchData[tacticalGraphState.mineral];
  root.innerHTML=`<div class="page relationship-page"><header class="page-heading"><div><p class="page-kicker">ENTITY · PRODUCT · ROUTE · DOCUMENT</p><h1>关系图谱分析</h1><p>把企业、商品、政策、税号、单证和物流路线放在同一视图中，定位可以继续核查的关系缺口。</p></div><span class="kg-boundary">${data.basis}</span></header>
  <section class="tactical-toolbar"><label>矿产<select id="kgMineral">${Object.entries(tacticalResearchData).map(([k,v])=>`<option value="${k}" ${k===tacticalGraphState.mineral?'selected':''}>${v.name}</option>`).join('')}</select></label><label>实体类型<select id="kgType"><option value="all">全部实体</option>${[['company','企业'],['product','商品'],['policy','政策'],['country','国家/地区'],['route','路线'],['document','单证']].map(x=>`<option value="${x[0]}" ${x[0]===tacticalGraphState.type?'selected':''}>${x[1]}</option>`).join('')}</select></label><span>资料状态：${data.confidence}</span></section>
  <section class="kg-metrics"><article><span>实体节点</span><strong>${data.nodes.length}</strong></article><article><span>关系边</span><strong>${data.edges.length}</strong></article><article><span>高/中高风险</span><strong>${data.risks.filter(r=>riskClass(r.level)!=='low').length}</strong></article><article><span>来源材料</span><strong>${data.sources.length}</strong></article></section>
  <section class="kg-layout"><div class="kg-canvas-wrap"><div class="panel-head"><div><h2>${data.name}监管关系网络</h2><p>点击节点查看可核验字段；红色虚线表示需要优先穿透的关系。</p></div><span class="panel-tag">${data.symbol}</span></div><div class="kg-canvas" id="kgCanvas"><div class="kg-edge-layer" id="kgEdges"></div>${data.nodes.map(n=>`<button class="kg-node type-${n.type} ${tacticalGraphState.type!=='all'&&tacticalGraphState.type!==n.type?'dimmed':''}" data-node="${n.id}" style="--node-x:${n.x}%;left:${n.x}%;top:${n.y}%"><small>${n.type.toUpperCase()}</small><b>${n.label}</b><span>${n.sub}</span></button>`).join('')}</div></div><aside class="kg-inspector" id="kgInspector">${graphInspectorHtml(data,tacticalGraphState.node)}</aside></section>
  <section class="risk-workbench"><div class="panel-head"><div><h2>风险指向与后续核查</h2><p>风险信号用于排序，不等同于违法认定。</p></div></div><div class="risk-workbench-grid">${data.risks.map((r,i)=>`<article class="risk-${riskClass(r.level)}"><header><b>${String(i+1).padStart(2,'0')}</b><span>${r.level}</span></header><h3>${r.title}</h3><p>${r.why}</p><div><strong>下一步核查</strong>${r.check}</div></article>`).join('')}</div></section>
  <section class="kg-source-strip">${data.sources.map((s,i)=>`<${s.url?'a':'div'} ${s.url?`href="${s.url}" target="_blank" rel="noreferrer"`:''}><b>[${i+1}] ${s.label}</b><span>${s.note}</span></${s.url?'a':'div'}>`).join('')}</section></div>`;
  document.getElementById('kgMineral').addEventListener('change',e=>{tacticalGraphState.mineral=e.target.value;tacticalGraphState.node=null;renderRelationshipGraphPage();decorateRenderedPage('relationship-graph');});
  document.getElementById('kgType').addEventListener('change',e=>{tacticalGraphState.type=e.target.value;renderRelationshipGraphPage();decorateRenderedPage('relationship-graph');});
  root.querySelectorAll('.kg-node').forEach(btn=>btn.addEventListener('click',()=>{tacticalGraphState.node=btn.dataset.node;document.getElementById('kgInspector').innerHTML=graphInspectorHtml(data,tacticalGraphState.node);root.querySelectorAll('.kg-node').forEach(n=>n.classList.toggle('selected',n===btn));}));
  requestAnimationFrame(()=>drawGraphEdges(data));window.addEventListener('resize',()=>drawGraphEdges(data),{once:true});
}
function graphInspectorHtml(data,nodeId){const n=data.nodes.find(x=>x.id===nodeId)||data.nodes[0];const linked=data.edges.filter(e=>e.from===n.id||e.to===n.id);return `<p class="page-kicker">NODE INSPECTOR</p><span class="kg-type type-${n.type}">${n.type}</span><h2>${n.label}</h2><p>${n.sub}</p><ul>${n.details.map(d=>`<li>${d}</li>`).join('')}</ul><h3>关联关系</h3>${linked.map(e=>{const other=data.nodes.find(x=>x.id===(e.from===n.id?e.to:e.from));return `<div class="kg-linked ${e.risk||''}"><b>${e.label}</b><span>${other.label}</span></div>`}).join('')}${n.url?`<a class="button" href="${n.url}" target="_blank">查看来源</a>`:''}`;}
function drawGraphEdges(data){const canvas=document.getElementById('kgCanvas'),layer=document.getElementById('kgEdges');if(!canvas||!layer)return;layer.innerHTML='';const cr=canvas.getBoundingClientRect();data.edges.forEach(e=>{const a=canvas.querySelector(`[data-node="${e.from}"]`),b=canvas.querySelector(`[data-node="${e.to}"]`);if(!a||!b)return;const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),x1=ar.left+ar.width/2-cr.left,y1=ar.top+ar.height/2-cr.top,x2=br.left+br.width/2-cr.left,y2=br.top+br.height/2-cr.top,len=Math.hypot(x2-x1,y2-y1),angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI;const line=document.createElement('i');line.className=e.risk?'risk-edge '+e.risk:'';line.style.cssText=`left:${x1}px;top:${y1}px;width:${len}px;transform:rotate(${angle}deg)`;line.title=e.label;layer.appendChild(line);});}

let supplyPathState={mineral:'tungsten',scenario:'all'};
function supplyStages(data){if(data===tacticalResearchData.tungsten)return [{k:'origin',t:'原产与供货',n:'中国',d:'实际出口主体待反查',risk:'high',checks:['出口报关单','供应商代码','许可证']},{k:'product',t:'商品识别',n:'GWC200H碳化钨粉',d:'HS 28499000 · CAS 12070-12-1 · 99.98%',risk:'medium',checks:['粒度/形态','成分检测','管制编码']},{k:'logistics',t:'物流运输',n:'AIR · CIP',d:'中国 → 越南海阳',risk:'medium',checks:['空运单','起飞机场','货代与付款人']},{k:'customs',t:'境外申报',n:'报关单108256803100',d:'E11生产原料 · 20kg · USD1,028.40',risk:'low',checks:['原始申报字段','国家代码口径','批次聚合']},{k:'buyer',t:'进口与加工',n:'EHWA GLOBAL',d:'税号0801227806 · 锯片/刀具生产',risk:'medium',checks:['投料记录','库存去向','最终用户']},{k:'end',t:'终端用途',n:'工业锯片/切割刀具',d:'用途与产品线表面匹配',risk:'low',checks:['成品型号','销售客户','再出口记录']}];if(data===tacticalResearchData.germanium)return [{t:'生产端',n:'锗光学材料企业',d:'镜片、窗口片、测试片',risk:'medium',checks:['BOM','材质证明']},{t:'申报端',n:'光学镜片/光学玻璃',d:'功能品名可能掩盖锗材质',risk:'high',checks:['成分检测','许可证']},{t:'渠道端',n:'机场快件/DHL',d:'小件高值、易拆分',risk:'high',checks:['寄件账户','90天聚合']},{t:'目的地',n:'美国/立陶宛等',d:'公开案件披露',risk:'medium',checks:['最终用户','付款路径']},{t:'处置状态',n:'处罚/起诉分级',d:'不得混同为生效定罪',risk:'low',checks:['原始决定书','裁判进度']}];return [{t:'生产端',n:'天然鳞片/高规格石墨',d:'参数决定受控属性',risk:'medium',checks:['纯度','强度','密度']},{t:'归类端',n:'其他石墨/模具等',d:'宽泛品名与税号替换风险',risk:'high',checks:['税号依据','检测报告']},{t:'出口主体',n:'生产企业/贸易企业',d:'关联主体可能分散申报',risk:'high',checks:['股权','代理','收款人']},{t:'中转路线',n:'第三国港口或贸易商',d:'仅中转本身不等于规避',risk:'medium',checks:['转运单','原产地证明']},{t:'境外关联方',n:'子公司/加工厂',d:'需穿透最终用途及再销售',risk:'high',checks:['产能','库存','客户']}];}
function renderSupplyChainPathPage(){const data=tacticalResearchData[supplyPathState.mineral],stages=supplyStages(data),visible=supplyPathState.scenario==='all'?stages:stages.filter(s=>s.risk===supplyPathState.scenario);root.innerHTML=`<div class="page supply-path-page"><header class="page-heading"><div><p class="page-kicker">END-TO-END TRACEABILITY</p><h1>供应链路径分析</h1><p>沿“原产—商品—申报—物流—进口—最终用途”逐节点核查，识别路线断点和单证矛盾。</p></div><span class="kg-boundary">${data.basis}</span></header><section class="tactical-toolbar"><label>矿产<select id="scMineral">${Object.entries(tacticalResearchData).map(([k,v])=>`<option value="${k}" ${k===supplyPathState.mineral?'selected':''}>${v.name}</option>`).join('')}</select></label><label>风险筛选<select id="scScenario"><option value="all">全部节点</option><option value="high" ${supplyPathState.scenario==='high'?'selected':''}>高风险</option><option value="medium" ${supplyPathState.scenario==='medium'?'selected':''}>中风险</option><option value="low" ${supplyPathState.scenario==='low'?'selected':''}>已匹配/低风险</option></select></label><span>路径不完整时，系统只输出核查建议，不下违法结论</span></section><section class="sc-path-map">${visible.map((s,i)=>`<article class="sc-stage risk-${s.risk}"><header><span>${String(i+1).padStart(2,'0')}</span><i>${s.t}</i></header><h2>${s.n}</h2><p>${s.d}</p><div>${s.checks.map(c=>`<b>${c}</b>`).join('')}</div></article>${i<visible.length-1?'<em>→</em>':''}`).join('')}</section><section class="sc-analysis-grid"><article><p class="page-kicker">CONFIRMED</p><h2>已确认事实</h2><ol>${data.facts.map(f=>`<li>${f}</li>`).join('')}</ol></article><article><p class="page-kicker">PRIORITY CHECK</p><h2>优先核查清单</h2>${data.risks.map(r=>`<div class="sc-check"><span class="risk-${riskClass(r.level)}">${r.level}</span><div><b>${r.title}</b><p>${r.check}</p></div></div>`).join('')}</article><article><p class="page-kicker">DOCUMENT MATCH</p><h2>五流一致性</h2>${['货物流：品名、数量、路线','单证流：合同、发票、报关单','资金流：付款人、币种、金额','信息流：邮件、最终用户声明','关系流：股权、地址、代理、收货人'].map((x,i)=>`<div class="sc-meter"><span>${x}</span><i><b style="width:${[82,64,48,42,56][i]}%"></b></i><em>${[82,64,48,42,56][i]}%</em></div>`).join('')}<small>完成度为当前系统已掌握字段比例，不代表合规评分。</small></article></section></div>`;document.getElementById('scMineral').addEventListener('change',e=>{supplyPathState.mineral=e.target.value;renderSupplyChainPathPage();decorateRenderedPage('supply-chain-path');});document.getElementById('scScenario').addEventListener('change',e=>{supplyPathState.scenario=e.target.value;renderSupplyChainPathPage();decorateRenderedPage('supply-chain-path');});}

const smartQaV2State={messages:[],mineral:'all',model:'gpt-oss:20b-cloud',models:['gpt-oss:20b-cloud','deepseek-v4-pro:cloud','qwen3.6:latest','gemma4:latest'],status:'checking',sources:{policy:true,intelligence:true,enforcement:true,market:true,library:true,announcement:true,knowledge:true}};
function smartQaV2Keywords(q){const dict=['钨','碳化钨','氧化钨','锗','锗镜片','石墨','镓','锑','铋','稀土','磁材','钐','铽','镝','钇','出口','进口','管制','许可','税号','海关','申报','伪报','瞒报','第三国','转运','最终用户','企业','案例','处罚','价格','供应链','暂停','公告'];const ks=dict.filter(k=>q.includes(k));q.split(/[\s，。！？、；：]+/).filter(k=>k.length>=2&&k.length<20).forEach(k=>{if(!ks.includes(k))ks.push(k)});if(smartQaV2State.mineral!=='all'&&!ks.includes(smartQaV2State.mineral))ks.unshift(smartQaV2State.mineral);return ks.length?ks:[q.slice(0,12)];}
function smartQaV2Search(q){const ks=smartQaV2Keywords(q),active=smartQaV2State.sources,out=[];function score(text){text=String(text||'').toLowerCase();return ks.reduce((n,k)=>n+(text.includes(k.toLowerCase())?(k===smartQaV2State.mineral?3:1):0),0)}function add(source,title,body,detail,date,url,label,s=1){if(s>0)out.push({source,title,body,detail,date,url:url||'#',label,score:s})}if(active.policy)policies.forEach(p=>{let s=score([p.name,p.scope,p.method,p.source].join(' '));if(s)add('policy',p.name,p.scopeShort,p.method,p.date,p.url,p.source,s)});if(active.intelligence&&typeof intelligenceSnapshots!=='undefined')intelligenceSnapshots.forEach(x=>{let s=score([x.titleZh,x.summaryZh].concat(x.factsZh||[]).join(' '));if(s)add('intelligence',x.titleZh,x.summaryZh,(x.factsZh||[]).slice(0,2).join('；'),x.sourcePublished,x.sourceUrl,x.sourceName,s)});if(active.enforcement)allArchivedEnforcementCases().forEach(c=>{let s=score([c.mineral,c.title,c.finding,c.agency,c.direction].join(' '));if(s)add('enforcement',c.title,c.finding,[c.agency,c.direction,c.status,'来源等级'+(c.sourceGrade||'待评')].filter(Boolean).join(' · '),c.date,c.source,c.agency,s+1)});if(active.market)mineralMarketData.forEach(m=>{let s=score([m.name,m.product,m.type].join(' '));if(s)add('market',m.name+'市场态势',m.product,'出口指数 '+m.exports.join('→')+'；页面展示价格 '+m.price+m.unit,'', '#/minerals','态势数据',s)});if(active.library&&typeof importedLibraryIndex!=='undefined')importedLibraryIndex.forEach(x=>{let s=score([x.name,x.mineral,x.category,x.content].join(' '));if(s)add('library',x.name,x.typeName,x.mineral,x.date,x.downloadUrl||'#/countries',x.sourceName,s)});if(active.announcement&&typeof announcementDefinitions!=='undefined')announcementDefinitions.forEach(a=>{let s=score([a.notice].concat((a.items||[]).flat()).join(' '));if(s)add('announcement',a.notice,(a.items||[]).slice(0,4).map(x=>x[0]).join('、'),a.statusText,a.date,a.source,'公告原文',s)});return out.sort((a,b)=>b.score-a.score).slice(0,16);}
function qaV2MessageHtml(m){if(m.role==='user')return `<div class="qa-message qa-user"><div class="qa-avatar">U</div><div class="qa-bubble">${m.text}</div></div>`;return `<div class="qa-message qa-assistant"><div class="qa-avatar">AI</div><div class="qa-bubble">${m.text}</div>${m.sources?.length?`<div class="qa-sources">${m.sources.map(s=>`<a class="qa-source-link" href="${escapeT(s.url)}" target="_blank" rel="noreferrer">[${s.id}] ${escapeT(s.label)}</a>`).join('')}</div>`:''}</div>`;}
function renderSmartQaPageV2(){const st=smartQaV2State;root.innerHTML=`<div class="page smart-qa-page"><header class="page-heading"><div><p class="page-kicker">OLLAMA · RETRIEVAL-AUGMENTED Q&amp;A</p><h1>智能问答</h1><p>系统先检索政策、公告、案件与文件，再由 Ollama 形成区分事实、研判和待核查事项的回答。</p></div><div class="qa-model-health"><i class="${st.status}"></i><span>${st.status==='online'?'Ollama 已连接':st.status==='offline'?'Ollama 未连接':'正在检测'}</span></div></header><section class="qa-control-bar"><label>矿产范围<select id="qaV2Mineral">${['all','钨','锗','石墨','镓','锑','铋','钐','铽','镝','钇'].map(x=>`<option value="${x}" ${x===st.mineral?'selected':''}>${x==='all'?'全部矿产':x}</option>`).join('')}</select></label><label>Ollama 模型<select id="qaV2Model">${st.models.map(x=>`<option value="${x}" ${x===st.model?'selected':''}>${x}</option>`).join('')}</select></label><button id="qaV2Clear" class="button">清空对话</button><span>仅发送当前问题命中的系统资料</span></section><section class="qa-sources-bar"><span>检索范围：</span>${[['policy','政策管制'],['intelligence','情报快照'],['enforcement','执法案例'],['market','态势数据'],['library','文件库'],['announcement','公告税号']].map(x=>`<button class="qa-source-chip ${st.sources[x[0]]?'active':''}" data-source="${x[0]}">${x[1]}</button>`).join('')}</section><section class="qa-quick-questions">${smartQaQuickQuestions.map(q=>`<button class="qa-quick-btn" data-q="${escapeT(q.q)}"><span>${q.q}</span><small>${q.desc}</small></button>`).join('')}</section><section class="qa-chat-area" id="qaV2Chat">${st.messages.length?st.messages.map(qaV2MessageHtml).join(''):'<div class="qa-empty-state"><span>◉</span><h3>询问具体监管问题</h3><p>例如：某商品是否落入管制参数、某条路线缺少哪些单证、公开案件能形成什么核查规则。</p></div>'}</section><div class="qa-input-bar"><input id="qaV2Input" placeholder="输入关键矿产、企业、商品、税号、路线或案件问题…"><button id="qaV2Send">分析</button></div></div>`;const ask=()=>{const i=document.getElementById('qaV2Input'),q=i.value.trim();if(q){i.value='';askSmartQaV2(q)}};document.getElementById('qaV2Send').onclick=ask;document.getElementById('qaV2Input').onkeydown=e=>{if(e.key==='Enter')ask()};document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>askSmartQaV2(b.dataset.q));document.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{st.sources[b.dataset.source]=!st.sources[b.dataset.source];b.classList.toggle('active')});document.getElementById('qaV2Mineral').onchange=e=>st.mineral=e.target.value;document.getElementById('qaV2Model').onchange=e=>st.model=e.target.value;document.getElementById('qaV2Clear').onclick=()=>{st.messages=[];renderSmartQaPageV2()};checkOllamaV2();const c=document.getElementById('qaV2Chat');c.scrollTop=c.scrollHeight;}
async function checkOllamaV2(){try{const r=await fetch('/_ollama-api/api/tags');if(!r.ok)throw 0;const d=await r.json(),ms=(d.models||[]).map(x=>x.name);if(ms.length){smartQaV2State.models=ms;if(!ms.includes(smartQaV2State.model))smartQaV2State.model=ms[0]}smartQaV2State.status='online'}catch(e){smartQaV2State.status='offline'}const h=document.querySelector('.qa-model-health');if(h)h.innerHTML=`<i class="${smartQaV2State.status}"></i><span>${smartQaV2State.status==='online'?'Ollama 已连接':'Ollama 未连接'}</span>`;}
function formatModelAnswer(t){return escapeT(t).replace(/^###? (.+)$/gm,'<h3>$1</h3>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/^- (.+)$/gm,'<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g,x=>'<ul>'+x+'</ul>').replace(/\n/g,'<br>')}
function sanitizeModelResponse(text,evidence){
  // Prevent a model from presenting invented HS/tax/declaration identifiers as
  // facts. Identifiers are kept only when they occur verbatim in retrieved data.
  return String(text||'').replace(/((?:HS(?:编码|代码)?|商品编号|税号|报关单号?)\s*[：:]?\s*)([0-9][0-9.]{3,14})/gi,function(all,prefix,code){
    return evidence.indexOf(code)>=0?all:prefix+'[该编号未在检索资料中核实，已隐藏]';
  });
}
async function askSmartQaV2(q){const st=smartQaV2State,results=smartQaV2Search(q);st.messages.push({role:'user',text:escapeT(q)},{role:'assistant',text:`<div class="qa-thinking"><i></i><span>已命中 ${results.length} 条资料，正在调用 ${escapeT(st.model)}…</span></div>`});renderSmartQaPageV2();let answer;try{if(!results.length)throw new Error('所选数据源未命中相关资料');const evidence=results.slice(0,12).map((r,i)=>`[${i+1}] ${r.label}｜${r.title}｜${r.date||'日期未注明'}\n${r.body}\n${r.detail||''}`).join('\n\n'),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),120000);const prompt=`你是中国海关关键矿产监管研究助手。只能依据下列资料回答，不得补造企业、交易、处罚或法律结论。请严格分为：一、直接结论；二、已确认事实（标注[编号]）；三、风险指向（明确只是研判）；四、可进一步核查事项（具体到商品参数、税号、许可证、主体关系、路线和单证）；五、信息边界。对调查、起诉、和解状态不得表述为已定罪。\n问题：${q}\n\n资料：\n${evidence}`;const r=await fetch('/_ollama-api/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:st.model,prompt,stream:false,options:{temperature:.15}}),signal:controller.signal});clearTimeout(timer);if(!r.ok)throw new Error('Ollama HTTP '+r.status);const d=await r.json();if(!d.response)throw new Error('模型未返回内容');answer={role:'assistant',text:`<div class="qa-answer"><div class="qa-model-label">${escapeT(st.model)} · 系统资料增强回答</div><div class="qa-model-response">${formatModelAnswer(d.response)}</div></div>`,sources:results.slice(0,12).map((x,i)=>({id:i+1,label:x.title,url:x.url}))}}catch(e){answer={role:'assistant',text:`<div class="qa-fallback"><strong>本次未调用模型完成回答</strong><p>${escapeT(e.message||'Ollama连接失败')}。系统已保留检索结果，请确认 Ollama 在线或调整问题。</p>${results.slice(0,6).map((r,i)=>`<div><b>[${i+1}] ${escapeT(r.title)}</b><span>${escapeT(r.body)}</span></div>`).join('')}</div>`,sources:results.slice(0,6).map((x,i)=>({id:i+1,label:x.title,url:x.url}))}}st.messages[st.messages.length-1]=answer;renderSmartQaPageV2();}

// Fast, citation-strict implementation. The later declaration intentionally
// supersedes the first implementation above while preserving existing UI hooks.
async function askSmartQaV2(q){
  const st=smartQaV2State,results=smartQaV2Search(q);
  st.messages.push(
    {role:'user',text:escapeT(q)},
    {role:'assistant',text:`<div class="qa-thinking"><i></i><span>已命中 ${results.length} 条资料，正在生成核查结论（通常数秒内完成）…</span></div>`}
  );
  renderSmartQaPageV2();
  let answer;
  try{
    if(!results.length)throw new Error('所选数据源未命中相关资料');
    const evidence=results.slice(0,10).map((r,i)=>`[${i+1}] ${r.label}｜${r.title}｜${r.date||'日期未注明'}\n${r.body}\n${r.detail||''}`).join('\n\n');
    const prompt=`你是中国海关关键矿产监管研究助手。只能依据给定资料回答。不得补造企业、交易、案件、处罚或法律结论。任何HS编码、税号、许可证名称、企业名称、金额、数量和日期，都必须在资料中逐字出现并标注[编号]；资料未提供时写“待核查”，严禁凭常识补充。对调查、起诉、和解状态不得表述为已定罪。用简明中文输出：\n一、直接结论\n二、已确认事实\n三、风险指向（明确属于研判）\n四、可进一步核查事项\n五、信息边界\n\n问题：${q}\n\n资料：\n${evidence}`;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
    let response;
    try{
      response=await fetch('/_ollama-api/api/generate',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({model:st.model,prompt,stream:false,think:false,options:{temperature:.05}}),signal:controller.signal});
    }finally{clearTimeout(timer);}
    if(!response.ok)throw new Error('Ollama HTTP '+response.status);
    const data=await response.json();
    if(!data.response)throw new Error('模型未返回正文');
    const safeText=sanitizeModelResponse(data.response,evidence);
    answer={role:'assistant',text:`<div class="qa-answer"><div class="qa-model-label">${escapeT(st.model)} · 快速核验模式</div><div class="qa-model-response">${formatModelAnswer(safeText)}</div></div>`,sources:results.slice(0,10).map((x,i)=>({id:i+1,label:x.title,url:x.url}))};
  }catch(error){
    answer={role:'assistant',text:`<div class="qa-fallback"><strong>模型回答未完成，已返回检索依据</strong><p>${escapeT(error.message||'Ollama连接失败')}</p>${results.slice(0,6).map((r,i)=>`<div><b>[${i+1}] ${escapeT(r.title)}</b><span>${escapeT(r.body)}</span></div>`).join('')}</div>`,sources:results.slice(0,6).map((x,i)=>({id:i+1,label:x.title,url:x.url}))};
  }
  st.messages[st.messages.length-1]=answer;
  renderSmartQaPageV2();
}

function systemKnowledgeRecords(){
  const records=[],push=(record)=>records.push({source:'knowledge',date:'',url:'#/ai-analysis',label:'系统知识库',...record});
  Object.entries(tacticalResearchData).forEach(([key,data])=>{
    push({title:`${data.name}关系图谱：已确认事实`,body:data.facts.join('；'),detail:`政策边界：${data.basis}`,url:'#/relationship-graph',label:'关系图谱分析',mineral:data.name,kind:'fact'});
    data.risks.forEach(r=>push({title:`${data.name}风险研判：${r.title}`,body:r.why,detail:`风险等级：${r.level}；后续核查：${r.check}`,url:'#/relationship-graph',label:'关系图谱分析',mineral:data.name,kind:'risk'}));
    data.nodes.forEach(n=>push({title:`${data.name}实体：${n.label}`,body:n.sub,detail:(n.details||[]).join('；'),url:'#/relationship-graph',label:'关系图谱分析',mineral:data.name,kind:'entity'}));
    supplyStages(data).forEach(stage=>push({title:`${data.name}供应链节点：${stage.t}—${stage.n}`,body:stage.d,detail:`风险：${stage.risk}；核查字段：${stage.checks.join('、')}`,url:'#/supply-chain-path',label:'供应链路径分析',mineral:data.name,kind:'path'}));
  });
  Object.entries(aiFocusedMineralResearch||{}).forEach(([key,topic])=>{
    const mineral=key==='germanium'?'锗':key==='graphite'?'石墨':key;
    push({title:topic.title,body:topic.boundary,detail:topic.tradeQuery,url:'#/ai-analysis',label:'AI智能分析',mineral,kind:'boundary'});
    (topic.findings||[]).forEach(f=>push({title:`${mineral}专题：${f.title}`,body:f.body,detail:`分类：${f.tag}`,url:f.url||'#/ai-analysis',label:'AI智能分析',mineral,kind:'finding'}));
    (topic.signals||[]).forEach(s=>push({title:`${mineral}风险信号：${s.title}`,body:s.body,detail:`风险等级：${s.level}；核查：${s.check}`,url:'#/ai-analysis',label:'AI智能分析',mineral,kind:'risk'}));
  });
  Object.entries(mineralAnalysisBlueprints||{}).forEach(([key,item])=>{
    const mineral=intelligenceMinerals.find(entry=>entry.id===key)?.name||key;
    push({title:`${mineral}专项分析：物项与供应链`,body:`受控或重点识别形态：${item.form}。主要用途：${item.use}。`,detail:`链条：${item.chain}；最新判断：${item.outlook}`,url:'#/ai-analysis',label:'AI智能分析',mineral,kind:'fact'});
    push({title:`${mineral}专项风险：${item.risk}`,body:`该信号用于调单排序，不直接构成违法结论。`,detail:`建议核查：${item.check}`,url:'#/ai-analysis',label:'AI智能分析',mineral,kind:'risk'});
  });
  Object.entries(intelProfiles||{}).forEach(([key,profile])=>{
    (profile.signals||[]).forEach(s=>push({title:`${key}监管信号：${s.title}`,body:s.analysis||s.body,detail:`风险等级：${s.level}；核查：${s.check}`,url:'#/intelligence-analysis',label:'开源信息情报研判',mineral:key,kind:'risk'}));
  });
  return records;
}
function smartQaKnowledgeSearch(query){
  const base=smartQaV2Search(query),keywords=smartQaV2Keywords(query),namedTokens=query.match(/[A-Za-z][A-Za-z0-9.-]{2,}|[0-9]{6,}/g)||[],riskIntent=/风险|核查|走私|违规|伪报|瞒报|转运|第三国|申报/.test(query),mineral=smartQaV2State.mineral;
  namedTokens.forEach(token=>{if(!keywords.includes(token))keywords.push(token);});
  const extra=systemKnowledgeRecords().map(record=>{
    const text=[record.title,record.body,record.detail,record.mineral,record.kind].join(' ').toLowerCase();
    let score=keywords.reduce((n,k)=>n+(text.includes(k.toLowerCase())?2:0),0);
    if(mineral!=='all'&&text.includes(mineral))score+=5;
    if(riskIntent&&record.kind==='risk')score+=4;
    if(query.length>=4&&text.includes(query.toLowerCase()))score+=6;
    if(record.title.split(/[：—]/).some(part=>part.length>=2&&query.toLowerCase().includes(part.toLowerCase())))score+=8;
    return {...record,score};
  }).filter(record=>record.score>0);
  const seen=new Set();
  return [...extra,...base].sort((a,b)=>b.score-a.score).filter(record=>{const key=[record.title,record.url].join('|');if(seen.has(key))return false;seen.add(key);return true;}).slice(0,20);
}

// Streaming version: show text as soon as the free cloud model emits it.
async function askSmartQaV2(q){
  const st=smartQaV2State,results=smartQaKnowledgeSearch(q);
  st.messages.push({role:'user',text:escapeT(q)},{role:'assistant',text:`<div class="qa-thinking"><i></i><span>正在检索 ${results.length} 条资料并生成回答…</span></div>`});
  renderSmartQaPageV2();
  let sources=results.slice(0,6).map((x,i)=>({id:i+1,label:x.title,url:x.url}));
  try{
    if(!results.length)throw new Error('所选数据源未命中相关资料');
    const evidence=results.slice(0,6).map((r,i)=>`[${i+1}] ${r.label}｜${r.title}｜${r.date||'日期未注明'}\n${String(r.body||'').slice(0,420)}\n${String(r.detail||'').slice(0,240)}`).join('\n\n');
    const prompt=`你是中国海关关键矿产监管助手。仅依据资料回答，不得补造。企业、案件、HS编码、税号、金额、数量、日期必须在资料中逐字出现并标注[编号]；未提供就写“待核查”。资料中的“可能、若、需聚合、待反查”等条件性表述只能列为风险研判或核查建议，绝不能改写成已经发生的事实。调查、起诉、和解不得写成已定罪。总字数控制在1200字内，分为：直接结论、已确认事实、风险指向（注明研判）、后续核查、信息边界。\n问题：${q}\n资料：\n${evidence}`;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
    let response;
    try{response=await fetch('/_ollama-api/api/generate',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({model:st.model,prompt,stream:true,think:false,options:{temperature:.05}}),signal:controller.signal});}
    catch(error){clearTimeout(timer);throw error;}
    if(!response.ok){clearTimeout(timer);throw new Error('Ollama HTTP '+response.status);}
    const reader=response.body.getReader(),decoder=new TextDecoder('utf-8');
    let buffer='',raw='';
    while(true){
      const part=await reader.read();
      if(part.done)break;
      buffer+=decoder.decode(part.value,{stream:true});
      const lines=buffer.split('\n');buffer=lines.pop()||'';
      lines.forEach(line=>{if(!line.trim())return;try{const packet=JSON.parse(line);if(packet.response)raw+=packet.response;if(packet.error)throw new Error(packet.error);}catch(parseError){if(parseError instanceof SyntaxError)return;throw parseError;}});
      if(raw){const safe=sanitizeModelResponse(raw,evidence);st.messages[st.messages.length-1]={role:'assistant',text:`<div class="qa-answer"><div class="qa-model-label">${escapeT(st.model)} · 流式核验回答</div><div class="qa-model-response">${formatModelAnswer(safe)}<span class="qa-stream-cursor"></span></div></div>`};const bubble=document.querySelector('.qa-message.qa-assistant:last-child .qa-bubble');if(bubble)bubble.innerHTML=st.messages[st.messages.length-1].text;}
    }
    clearTimeout(timer);
    if(buffer.trim()){try{const packet=JSON.parse(buffer);if(packet.response)raw+=packet.response;}catch(e){}}
    if(!raw)throw new Error('模型未返回正文');
    st.messages[st.messages.length-1]={role:'assistant',text:`<div class="qa-answer"><div class="qa-model-label">${escapeT(st.model)} · 流式核验回答</div><div class="qa-model-response">${formatModelAnswer(sanitizeModelResponse(raw,evidence))}</div></div>`,sources};
  }catch(error){
    st.messages[st.messages.length-1]={role:'assistant',text:`<div class="qa-fallback"><strong>模型回答未完成，已返回检索依据</strong><p>${escapeT(error.message||'Ollama连接失败')}</p>${results.slice(0,6).map((r,i)=>`<div><b>[${i+1}] ${escapeT(r.title)}</b><span>${escapeT(r.body)}</span></div>`).join('')}</div>`,sources};
  }
  renderSmartQaPageV2();
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
  "global-situation":`
    <ellipse class="mv-soft" cx="92" cy="50" rx="58" ry="30"/><path class="mv-primary mv-draw" d="M34 50h116M92 20c-20 18-20 42 0 60M92 20c20 18 20 42 0 60"/>
    <circle class="mv-node mv-pulse" cx="58" cy="43" r="5"/><circle class="mv-node" cx="119" cy="38" r="4"/><circle class="mv-secondary" cx="133" cy="61" r="5"/>`,
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
  if(route==="smart-qa"){
    const sourceBar=root.querySelector('.qa-sources-bar');
    if(sourceBar&&!sourceBar.querySelector('.qa-kb-badge')){
      const badge=document.createElement('div');
      badge.className='qa-kb-badge';
      badge.innerHTML=`<i></i><span>系统知识库</span><strong>${systemKnowledgeRecords().length}</strong><small>条研判知识</small>`;
      sourceBar.appendChild(badge);
    }
  }
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

const globalSituationCountries=[
  {code:"US",name:"美国",level:"high",score:92,x:20,y:35,minerals:["钨","石墨","镓锗","稀土"],signals:8,cases:2,projects:5,summary:"同时出现中国原产碳化钨经第三地申报争议、最终用户核验压力和大规模替代供应链投资。",basis:["Ceratizit碳化钨制品民事和解线索","石墨电极贸易救济与最终用户审查","稀土、镓、石墨等本土项目加速"],action:"优先联查原产地、实际制造地、第三国加工增值、最终用户和再出口承诺。"},
  {code:"JP",name:"日本",level:"high",score:90,x:85,y:35,minerals:["镓","锗","钨","中重稀土"],signals:7,cases:1,projects:3,summary:"镓锗公开案件流向、钨产品主要市场和重稀土长期承购三类信号叠加。",basis:["镓锗走私案公开报道指向日本","2026年初钨产品主要出口市场之一","JOGMEC长期承购与海外投资"],action:"重点核验终端半导体、光学和工具企业，穿透贸易商及日本境内再分销。"},
  {code:"KR",name:"韩国",level:"high",score:87,x:82,y:34,minerals:["钨","碳化钨","稀土磁材"],signals:8,cases:0,projects:2,summary:"对韩钨品市场集中度、韩国集团跨境供货字段和Sangdong新增矿端能力需要综合观察。",basis:["钨粉和碳化钨贸易集中信号","EHWA集团供应链字段待穿透","Sangdong钨矿进入达产爬坡"],action:"比对中国出口、韩国进口与再出口数据，核验加工能力、库存消化和最终目的地。"},
  {code:"VN",name:"越南",level:"high",score:84,x:78,y:53,minerals:["碳化钨","工具材料"],signals:6,cases:0,projects:0,summary:"系统已收录中国原产99.98%碳化钨粉进口记录，境外进口商和报关单号可回溯。",basis:["EHWA GLOBAL越南进口记录","中国原产与韩国供应商字段并存","E11生产原料进口场景"],action:"反查中国实际出口主体、许可证、空运单、投料记录、库存和成品再出口。"},
  {code:"IN",name:"印度",level:"high",score:82,x:67,y:47,minerals:["石墨","钨钴合金粉","金属粉末"],signals:6,cases:2,projects:1,summary:"公开石墨模具处罚流向印度，系统同时收录钨钴热喷涂粉末相关贸易记录。",basis:["高固定碳石墨模具处罚案例","金属粉末快件出口历史案例","钨钴热喷涂粉末贸易记录"],action:"核对材质参数、进口商产能、用途、货物形态和同一买方多品名采购。"},
  {code:"TW",name:"中国台湾地区",level:"high",score:86,x:82,y:45,minerals:["钐钴磁体","含镝磁钢","碳化钨制品"],signals:7,cases:3,projects:0,summary:"多起永磁材料邮寄或快件伪瞒报案例指向该地区，另有碳化钨制品原产地转运争议。",basis:["钐钴永磁体快件案件","含镝磁钢邮寄案件","碳化钨制品经第三地原产地争议"],action:"聚合快件寄件账户、收货人、品名变更、产地证明和后续对美出口记录。"},
  {code:"AE",name:"阿联酋",level:"medium",score:68,x:61,y:45,minerals:["石墨","转口路线"],signals:3,cases:1,projects:0,summary:"历史案件显示杰贝阿里港可成为中国石墨货物转运节点，但时间早于现行石墨措施。",basis:["杰贝阿里港历史石墨扣押线索","区域转口和保税物流功能","现行政策前后必须隔离判断"],action:"仅作为路线布控信号；核对现行措施生效后的同主体、同品名和再出口单证。"},
  {code:"IR",name:"伊朗",level:"medium",score:66,x:63,y:41,minerals:["石墨","碳化钨"],signals:4,cases:1,projects:0,summary:"系统存在历史石墨目的地线索和碳化钨进口数据字段冲突，需要先确认数据源口径。",basis:["历史中国—阿联酋—伊朗石墨路线","碳化钨记录国家字段不一致","边境小额贸易与RED通道字段"],action:"调取原始进口申报、运输单证和真实目的国，避免按聚合数据库字段直接定性。"},
  {code:"TR",name:"土耳其",level:"medium",score:62,x:57,y:36,minerals:["碳化钨","转运字段"],signals:3,cases:0,projects:1,summary:"商业数据中出现目的国土耳其与伊朗进口数据源并存的字段，需要确认是否为口岸、贸易国或最终目的国。",basis:["目的国字段与数据源不一致","供应商字段缺失","陆路运输和边境贸易场景"],action:"核对字段定义、原始报关单、陆路运单、付款人和最终收货人。"},
  {code:"PH",name:"菲律宾",level:"medium",score:61,x:83,y:54,minerals:["含镝钕铁硼"],signals:3,cases:1,projects:0,summary:"公开案例涉及加工贸易方式向菲律宾出口含镝钕铁硼永磁材料。",basis:["三环永磁相关行政处罚梳理","来料加工方式","含镝磁材成分识别"],action:"核对加工贸易手册、磁材牌号、镝含量、许可证和境外加工用途。"},
  {code:"MY",name:"马来西亚",level:"medium",score:58,x:77,y:61,minerals:["金属粉末","稀土分离"],signals:3,cases:1,projects:1,summary:"既是历史金属粉末快件流向之一，也是中国以外重要稀土分离节点。",basis:["金属粉末快件案例目的地之一","Lynas稀土分离基地","贸易与加工双重角色"],action:"区分正常加工贸易与转口，核对加工能力、产品转化和后续流向。"},
  {code:"CA",name:"加拿大",level:"medium",score:55,x:19,y:20,minerals:["石墨","镓锗锑","稀土"],signals:4,cases:0,projects:4,summary:"多个替代项目和政府承购正在推进，风险主要来自项目进度、产能兑现和原料来源变化。",basis:["Matawinie石墨项目建设","Trail镓锗锑扩建框架","SRC稀土加工设施"],action:"持续核验建设、投产、实际交付和中国原料占比，不将规划产能当作现货供应。"},
  {code:"AU",name:"澳大利亚",level:"low",score:35,x:84,y:75,minerals:["镓","稀土","锂","钪"],signals:2,cases:0,projects:5,summary:"主要信号来自矿山、精炼和副产回收项目，当前以替代供应项目进度监测为主。",basis:["Wagerup镓项目最终投资决定","Nolans稀土项目建设","Syerston钪项目计划"],action:"跟踪融资、建设、调试、认证和长期承购兑现。"},
  {code:"BR",name:"巴西",level:"low",score:28,x:34,y:66,minerals:["中重稀土"],signals:2,cases:0,projects:1,summary:"Serra Verde已形成商业生产并推进扩产和长期承购，主要关注产能兑现和分离去向。",basis:["Pela Ema商业生产","2027扩产目标","长期承购安排"],action:"监测实际产量、分离国家、物流节点和承购执行。"},
  {code:"FR",name:"法国",level:"low",score:32,x:50,y:31,minerals:["重稀土","磁材"],signals:2,cases:0,projects:2,summary:"以Solvay现有产线和Caremag建设项目为主，暂未形成系统内高优先执法路线。",basis:["La Rochelle商业生产","Caremag重稀土分离建设","法日长期承购"],action:"跟踪原料来源、设施投运、产品规格和实际客户。"},
  {code:"EE",name:"爱沙尼亚",level:"low",score:30,x:54,y:24,minerals:["稀土磁体"],signals:2,cases:0,projects:1,summary:"Narva磁体工厂处客户导入和商业爬坡阶段，当前侧重产能与认证监测。",basis:["百万块磁体生产节点","汽车项目客户导入","后续扩产工程准备"],action:"核验原料来源、批量认证、订单交付和扩产进度。"},
  {code:"ZA",name:"南非",level:"low",score:25,x:54,y:74,minerals:["稀土回收"],signals:1,cases:0,projects:1,summary:"Phalaborwa项目仍处可研和建设准备阶段，主要关注项目兑现。",basis:["磷石膏回收路线","DFS和融资推进","尚未商业生产"],action:"跟踪融资、建设、工艺放大和实际产品交付。"},
  {code:"MW",name:"马拉维",level:"low",score:22,x:57,y:66,minerals:["稀土"],signals:1,cases:0,projects:1,summary:"Songwe Hill属于战略项目和融资推进阶段，系统未发现高优先执法路线。",basis:["欧盟战略项目定位","工程研究更新","融资和基础设施约束"],action:"核验融资关闭、电力交通和下游分离安排。"},
  {code:"AO",name:"安哥拉",level:"low",score:24,x:49,y:65,minerals:["稀土"],signals:1,cases:0,projects:1,summary:"Longonjo仍处工程推进阶段，重点是项目建设与Lobito走廊物流。",basis:["Longonjo项目推进","Lobito走廊物流","尚未形成商业分离供应"],action:"跟踪工程进度、融资、混合产品外运和后续分离目的地。"}
];
let globalSituationState={level:"all",country:"US"};
const globalRiskMeta={high:{label:"最高核查优先级",short:"高",color:"红色"},medium:{label:"中等核查优先级",short:"中",color:"橙色"},low:{label:"一般关注优先级",short:"低",color:"黄色"}};
const globalCountryCoordinates={US:[39,-98],JP:[36.2,138.3],KR:[36.5,127.8],VN:[16,108],IN:[21,78],TW:[23.7,121],AE:[24.3,54.4],IR:[32,53],TR:[39,35],PH:[12.8,122],MY:[4.2,102],CA:[56,-106],AU:[-25,133],BR:[-14,-51],FR:[46,2],EE:[58.6,25],ZA:[-30,25],MW:[-13.2,34.3],AO:[-12.5,18.5]};
const globalCountryIso3={US:"USA",JP:"JPN",KR:"KOR",VN:"VNM",IN:"IND",TW:"TWN",AE:"ARE",IR:"IRN",TR:"TUR",PH:"PHL",MY:"MYS",CA:"CAN",AU:"AUS",BR:"BRA",FR:"FRA",EE:"EST",ZA:"ZAF",MW:"MWI",AO:"AGO"};
const globalRiskColors={high:"#ff5f68",medium:"#ff9f43",low:"#ffd45a",other:"#46d7a2"};
let globalSituationMap=null;
let globalSituationMarkers={};
let globalOtherCountryLayers=[];
function renderGlobalCountryDetail(){
  const target=document.getElementById("globalCountryDetail");
  const item=globalSituationCountries.find(country=>country.code===globalSituationState.country)||globalSituationCountries[0];
  if(!target)return;
  const meta=globalRiskMeta[item.level];
  target.innerHTML=`<div class="global-detail-top"><span class="global-country-code">${item.code}</span><div><p>${meta.label}</p><h2>${item.name}</h2></div><b class="global-risk-tag ${item.level}">${meta.short}</b></div><div class="global-score"><span>综合核查指数</span><strong>${item.score}</strong><i><b style="width:${item.score}%"></b></i></div><p class="global-summary">${item.summary}</p><div class="global-detail-metrics"><span><b>${item.signals}</b>风险信号</span><span><b>${item.cases}</b>案例关联</span><span><b>${item.projects}</b>项目节点</span></div><h3>主要依据</h3><ul>${item.basis.map(value=>`<li>${value}</li>`).join("")}</ul><div class="global-action"><span>建议动作</span><p>${item.action}</p></div><div class="global-minerals">${item.minerals.map(value=>`<b>${value}</b>`).join("")}</div>`;
  document.querySelectorAll("[data-global-country]").forEach(button=>button.classList.toggle("active",button.dataset.globalCountry===item.code));
  Object.entries(globalSituationMarkers).forEach(([code,layer])=>{
    const country=globalSituationCountries.find(value=>value.code===code);
    layer.setStyle?.(globalCountryAreaStyle(country,code===item.code));
    layer.getElement()?.classList.toggle("active",code===item.code);
  });
}
function bindGlobalSituation(){
  document.querySelectorAll("[data-global-level]").forEach(button=>button.addEventListener("click",()=>{
    globalSituationState.level=button.dataset.globalLevel;
    document.querySelectorAll("[data-global-level]").forEach(item=>item.classList.toggle("active",item===button));
    document.querySelectorAll(".global-map-marker[data-global-country]").forEach(item=>item.hidden=globalSituationState.level!=="all"&&item.dataset.level!==globalSituationState.level);
    const current=globalSituationCountries.find(item=>item.code===globalSituationState.country);
    if(globalSituationState.level!=="all"&&current?.level!==globalSituationState.level){globalSituationState.country=globalSituationCountries.find(item=>item.level===globalSituationState.level)?.code||"US";renderGlobalCountryDetail();}
  }));
  document.querySelectorAll("[data-global-country]").forEach(button=>button.addEventListener("click",()=>{globalSituationState.country=button.dataset.globalCountry;renderGlobalCountryDetail();}));
  renderGlobalCountryDetail();
}
function renderGlobalSituationPage(){
  const counts=Object.fromEntries(Object.keys(globalRiskMeta).map(level=>[level,globalSituationCountries.filter(item=>item.level===level).length]));
  root.innerHTML=`<div class="page global-situation-page"><header class="page-heading"><div><p class="page-kicker">GLOBAL INTELLIGENCE SITUATION</p><h1>全球态势</h1><p>综合政策、执法案例、贸易路线、企业关联和替代项目，对重点国家和地区进行海关核查优先级分层。</p></div><span class="demo-badge">动态研判 · ${SYSTEM_DATA_DATE}</span></header>
  <section class="global-risk-metrics"><article class="high"><span>最高核查优先级</span><strong>${counts.high}</strong><small>重点调单与穿透核验</small></article><article class="medium"><span>中等核查优先级</span><strong>${counts.medium}</strong><small>路线与字段交叉验证</small></article><article class="low"><span>常规跟踪优先级</span><strong>${counts.low}</strong><small>项目进度与供应监测</small></article><article><span>已纳入国家和地区</span><strong>${globalSituationCountries.length}</strong><small>系统多模块综合生成</small></article></section>
  <section class="global-workspace"><div class="global-map-panel"><div class="global-map-head"><div><h2>全球核查优先级地图</h2><p>颜色表示当前系统中的核查排序，不代表国家违法、制裁或信用评级。</p></div><div class="global-level-filter"><button class="active" data-global-level="all">全部</button><button data-global-level="high"><i></i>红色</button><button data-global-level="medium"><i></i>黄色</button><button data-global-level="low"><i></i>绿色</button></div></div><div class="global-map-stage"><svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="worldLand" x1="0" x2="1"><stop stop-color="#173453"/><stop offset="1" stop-color="#0e2844"/></linearGradient><filter id="mapGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="global-map-grid"><path d="M0 100H1000M0 200H1000M0 300H1000M0 400H1000M200 0V500M400 0V500M600 0V500M800 0V500"/></g><g class="global-land"><path d="M65 110L130 65l105 8 82 44-15 58-42 36-24 70-54 42-51-58-54-28-30-72Z"/><path d="M244 282l62 28 41 59-12 85-42 38-29-85-42-63Z"/><path d="M445 105l84-42 77 19 46 37 88 4 113 58-27 46-87 14-42 53-88-13-33 50-59-38-38-62-51-47Z"/><path d="M510 252l83 9 48 83-24 108-67 24-39-71-35-87Z"/><path d="M769 329l84-19 87 58-26 77-97 12-58-62Z"/><path d="M879 225l36-23 35 16-14 31-42 5Z"/></g><g class="global-route-lines"><path d="M200 175Q520 25 820 170"/><path d="M820 170Q795 210 780 265"/><path d="M670 235Q720 285 835 270"/><path d="M610 225Q470 170 200 175"/></g></svg><div class="global-scanline"></div>${globalSituationCountries.map((item,index)=>`<button class="global-map-marker ${item.level}" style="left:${item.x}%;top:${item.y}%;--marker-delay:${(index%7)*.14}s" data-global-country="${item.code}" data-level="${item.level}" aria-label="${item.name}，${globalRiskMeta[item.level].label}"><i></i><span>${item.name}</span></button>`).join("")}<div class="global-map-caption"><span>数据更新时间 ${SYSTEM_DATA_DATE}</span><b>● LIVE ANALYSIS</b></div></div></div><aside class="global-country-detail" id="globalCountryDetail"></aside></section>
  <section class="global-risk-board">${Object.entries(globalRiskMeta).map(([level,meta])=>`<article class="${level}"><header><i></i><div><span>${meta.color}</span><h2>${meta.label}</h2></div><strong>${counts[level]}</strong></header><div>${globalSituationCountries.filter(item=>item.level===level).map(item=>`<button data-global-country="${item.code}" data-level="${item.level}"><b>${item.code}</b><span>${item.name}</span><small>${item.minerals.slice(0,2).join(" · ")}</small></button>`).join("")}</div></article>`).join("")}</section><p class="global-disclaimer">分级依据为系统当前已归档信息的数量、关联强度、时间新鲜度和可核验程度。颜色用于安排核查资源，不构成对任何国家、地区、企业或交易的违法认定。</p></div>`;
  bindGlobalSituation();
}

function disposeGlobalSituationMap(){
  if(globalSituationMap){globalSituationMap.remove();globalSituationMap=null;globalSituationMarkers={};globalOtherCountryLayers=[];}
}
function globalCountryAreaStyle(item,active=false){
  const color=globalRiskColors[item?.level]||"#4b7795";
  if(item?.level==="other")return{className:"global-risk-area other",color,fillColor:color,fillOpacity:.035,weight:.65,opacity:.42,interactive:false};
  const baseOpacity=item?.level==="high"?.20:item?.level==="medium"?.15:.11;
  return{className:`global-risk-area ${item?.level||""}`,color,fillColor:color,fillOpacity:active?Math.min(baseOpacity+.17,.38):baseOpacity,weight:active?2.5:1.35,opacity:active?1:.92};
}
function focusGlobalCountry(code,{zoom=true}={}){
  const item=globalSituationCountries.find(country=>country.code===code);
  if(!item)return;
  globalSituationState.country=code;
  renderGlobalCountryDetail();
  const layer=globalSituationMarkers[code];
  if(globalSituationMap&&zoom){
    if(layer?.getBounds)globalSituationMap.flyToBounds(layer.getBounds(),{maxZoom:4,padding:[36,36],duration:.65});
    else globalSituationMap.flyTo(globalCountryCoordinates[code],Math.max(globalSituationMap.getZoom(),4),{duration:.65});
  }
  if(layer){layer.openTooltip();setTimeout(()=>layer.closeTooltip(),1600);}
}
function applyGlobalLevelFilter(level){
  globalSituationState.level=level;
  document.querySelectorAll("[data-global-level]").forEach(button=>button.classList.toggle("active",button.dataset.globalLevel===level));
  if(globalSituationMap)Object.entries(globalSituationMarkers).forEach(([code,marker])=>{
    const country=globalSituationCountries.find(item=>item.code===code);
    const show=level==="all"||country.level===level;
    if(show&&!globalSituationMap.hasLayer(marker))marker.addTo(globalSituationMap);
    if(!show&&globalSituationMap.hasLayer(marker))globalSituationMap.removeLayer(marker);
  });
  const current=globalSituationCountries.find(item=>item.code===globalSituationState.country);
  if(level!=="all"&&current?.level!==level){focusGlobalCountry(globalSituationCountries.find(item=>item.level===level)?.code||"US",{zoom:false});}
}
async function initGlobalSituationMap(){
  const container=document.getElementById("globalLeafletMap");
  if(!container)return;
  disposeGlobalSituationMap();
  if(!window.L){container.innerHTML='<div class="global-map-error"><b>地图服务加载失败</b><span>请检查网络连接后刷新页面</span></div>';return;}
  const homeZoom=container.clientWidth>=900?2:container.clientWidth>=600?1.5:1;
  globalSituationMap=L.map(container,{zoomControl:false,minZoom:1,maxZoom:7,zoomSnap:.25,zoomDelta:.5,worldCopyJump:false,maxBounds:[[-85,-180],[85,180]],maxBoundsViscosity:.85,scrollWheelZoom:true,preferCanvas:false,attributionControl:true}).setView([15,15],homeZoom);
  L.control.zoom({position:"topright",zoomInTitle:"放大",zoomOutTitle:"缩小"}).addTo(globalSituationMap);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{subdomains:"abcd",maxZoom:19,noWrap:true,bounds:[[-85,-180],[85,180]],attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'}).addTo(globalSituationMap);
  const loading=document.createElement("div");loading.className="global-area-loading";loading.innerHTML="<i></i><span>正在加载国家风险分区</span>";container.parentElement.appendChild(loading);
  const countryByIso3=Object.fromEntries(globalSituationCountries.map(item=>[globalCountryIso3[item.code],item]));
  let worldData=null;
  for(const url of ["https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json","https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"]){
    try{const response=await fetch(url);if(response.ok){worldData=await response.json();break;}}catch(error){/* try fallback */}
  }
  if(worldData&&globalSituationMap){
    L.geoJSON(worldData,{filter:feature=>feature.id!=="ATA",style:feature=>globalCountryAreaStyle(countryByIso3[feature.id]||{level:"other"}),onEachFeature:(feature,layer)=>{
      const item=countryByIso3[feature.id]||{code:null,name:feature.properties?.name||feature.id,level:"other",score:0};
      if(item.level==="other"){globalOtherCountryLayers.push(layer);return;}
      globalSituationMarkers[item.code]=layer;
      layer.on("add",()=>{const element=layer.getElement();if(element){element.dataset.globalCountry=item.code;element.setAttribute("role","button");element.setAttribute("tabindex","0");element.setAttribute("aria-label",`${item.name}，${globalRiskMeta[item.level].label}，核查指数${item.score}`);}});
      layer.bindTooltip(`<b>${item.name}</b><span>${globalRiskMeta[item.level].label} · 核查指数 ${item.score}</span>`,{sticky:true,direction:"top",offset:[0,-8],className:"global-map-tooltip"});
      layer.on("click",()=>focusGlobalCountry(item.code,{zoom:true}));
      layer.on("mouseover",()=>layer.setStyle({...globalCountryAreaStyle(item,item.code===globalSituationState.country),fillOpacity:.34,weight:2.2}));
      layer.on("mouseout",()=>layer.setStyle(globalCountryAreaStyle(item,item.code===globalSituationState.country)));
    }}).addTo(globalSituationMap);
    applyGlobalLevelFilter(globalSituationState.level);
    renderGlobalCountryDetail();
    const otherCount=document.getElementById("globalOtherCount");if(otherCount)otherCount.textContent=String(globalOtherCountryLayers.length);
    loading.remove();
  }else{loading.classList.add("error");loading.innerHTML="<span>国家边界数据加载失败，请检查网络后刷新</span>";}
  globalSituationMap.on("zoomend",()=>{const target=document.getElementById("globalMapZoom");if(target)target.textContent=`ZOOM ${globalSituationMap.getZoom()}`;});
  const zoomLabel=document.getElementById("globalMapZoom");if(zoomLabel)zoomLabel.textContent=`ZOOM ${homeZoom}`;
  document.getElementById("globalMapReset")?.addEventListener("click",()=>globalSituationMap.flyTo([15,15],homeZoom,{duration:.7}));
  setTimeout(()=>globalSituationMap?.invalidateSize(),80);
}
function bindGlobalSituationMap(){
  document.querySelectorAll("[data-global-level]").forEach(button=>button.addEventListener("click",()=>applyGlobalLevelFilter(button.dataset.globalLevel)));
  document.querySelectorAll(".global-risk-board [data-global-country]").forEach(button=>button.addEventListener("click",()=>focusGlobalCountry(button.dataset.globalCountry,{zoom:true})));
  document.getElementById("globalMapDown")?.addEventListener("click",()=>document.getElementById("globalSituationContent")?.scrollIntoView({behavior:"smooth",block:"start"}));
  requestAnimationFrame(initGlobalSituationMap);
}
function renderGlobalSituationMapPage(){
  disposeGlobalSituationMap();
  const counts=Object.fromEntries(Object.keys(globalRiskMeta).map(level=>[level,globalSituationCountries.filter(item=>item.level===level).length]));
  root.innerHTML=`<div class="page global-situation-page"><header class="page-heading"><div><p class="page-kicker">GLOBAL INTELLIGENCE SITUATION</p><h1>全球态势</h1><p>综合政策、执法案例、贸易路线、企业关联和替代项目，对重点国家和地区进行海关核查优先级分层。</p></div><span class="demo-badge">动态研判 · ${SYSTEM_DATA_DATE}</span></header>
  <section class="global-risk-metrics"><article class="high"><span>最高核查优先级</span><strong>${counts.high}</strong><small>重点调单与穿透核验</small></article><article class="medium"><span>中等核查优先级</span><strong>${counts.medium}</strong><small>路线与字段交叉验证</small></article><article class="low"><span>常规跟踪优先级</span><strong>${counts.low}</strong><small>项目进度与供应监测</small></article><article><span>已纳入国家和地区</span><strong>${globalSituationCountries.length}</strong><small>系统多模块综合生成</small></article></section>
  <section class="global-workspace"><div class="global-map-panel"><div class="global-map-head"><div><h2>全球核查优先级地图</h2><p>滚轮缩放、拖拽浏览，点击光点查看国家详情。</p></div><div class="global-map-tools"><div class="global-level-filter"><button class="${globalSituationState.level==="all"?"active":""}" data-global-level="all">全部</button><button class="${globalSituationState.level==="high"?"active":""}" data-global-level="high"><i></i>红色</button><button class="${globalSituationState.level==="medium"?"active":""}" data-global-level="medium"><i></i>黄色</button><button class="${globalSituationState.level==="low"?"active":""}" data-global-level="low"><i></i>绿色</button></div><button class="global-map-reset" id="globalMapReset" type="button">◎ 全球视角</button></div></div><div class="global-map-stage"><div id="globalLeafletMap" class="global-leaflet-map" aria-label="可缩放全球风险态势地图"></div><div class="global-map-grid-overlay" aria-hidden="true"></div><div class="global-map-hud"><span id="globalMapZoom">ZOOM 1</span><b>● LIVE ANALYSIS</b></div><div class="global-map-caption"><span>数据更新时间 ${SYSTEM_DATA_DATE}</span><span>拖拽地图 · 滚轮缩放 · 点击国家</span></div></div></div><aside class="global-country-detail" id="globalCountryDetail"></aside></section>
  <section class="global-risk-board">${Object.entries(globalRiskMeta).map(([level,meta])=>`<article class="${level}"><header><i></i><div><span>${meta.color}</span><h2>${meta.label}</h2></div><strong>${counts[level]}</strong></header><div>${globalSituationCountries.filter(item=>item.level===level).map(item=>`<button data-global-country="${item.code}" data-level="${item.level}"><b>${item.code}</b><span>${item.name}</span><small>${item.minerals.slice(0,2).join(" · ")}</small></button>`).join("")}</div></article>`).join("")}</section><p class="global-disclaimer">分级依据为系统当前已归档信息的数量、关联强度、时间新鲜度和可核验程度。颜色用于安排核查资源，不构成对任何国家、地区、企业或交易的违法认定。</p></div>`;
  bindGlobalSituationMap();
}

function renderGlobalSituationFullscreenPage(){
  disposeGlobalSituationMap();
  const counts=Object.fromEntries(Object.keys(globalRiskMeta).map(level=>[level,globalSituationCountries.filter(item=>item.level===level).length]));
  root.innerHTML=`<div class="page global-situation-page global-situation-fullscreen">
  <section class="global-map-panel global-map-fullscreen"><div class="global-map-head global-map-floating-head"><div class="global-map-title"><p class="page-kicker">GLOBAL INTELLIGENCE SITUATION</p><h1>全球态势</h1><p>综合政策、执法案例、贸易路线、企业关联和替代项目，对重点国家和地区进行海关核查优先级分层。</p></div><div class="global-map-tools"><div class="global-level-filter"><button class="${globalSituationState.level==="all"?"active":""}" data-global-level="all">全部</button><button class="${globalSituationState.level==="high"?"active":""}" data-global-level="high"><i></i>红色</button><button class="${globalSituationState.level==="medium"?"active":""}" data-global-level="medium"><i></i>橙色</button><button class="${globalSituationState.level==="low"?"active":""}" data-global-level="low"><i></i>黄色</button><span class="global-other-country-key"><i></i>绿色 · 其他国家</span></div><button class="global-map-reset" id="globalMapReset" type="button">◎ 全球视角</button></div></div><div class="global-map-stage"><div id="globalLeafletMap" class="global-leaflet-map" aria-label="可缩放全球风险态势地图"></div><div class="global-map-grid-overlay" aria-hidden="true"></div><div class="global-map-hud"><span id="globalMapZoom">ZOOM 1</span><b>● LIVE ANALYSIS</b></div><div class="global-map-caption"><span>数据更新时间 ${SYSTEM_DATA_DATE}</span><span>拖拽地图 · 滚轮缩放 · 点击国家</span></div><button class="global-map-down" id="globalMapDown" type="button"><span>查看分析</span><i>⌄</i></button></div></section>
  <div class="global-content-below" id="globalSituationContent"><header class="global-content-heading"><div><p class="page-kicker">COUNTRY RISK OVERVIEW</p><h2>国家分级与核查线索</h2></div><span class="demo-badge">动态研判 · ${SYSTEM_DATA_DATE}</span></header><section class="global-risk-metrics"><article class="high"><span>红色 · 最高核查优先级</span><strong>${counts.high}</strong><small>重点调单与穿透核验</small></article><article class="medium"><span>橙色 · 中等核查优先级</span><strong>${counts.medium}</strong><small>路线与字段交叉验证</small></article><article class="low"><span>黄色 · 一般关注优先级</span><strong>${counts.low}</strong><small>项目进度与供应监测</small></article><article class="other"><span>绿色 · 其他国家</span><strong id="globalOtherCount">—</strong><small>当前未纳入三级重点名单</small></article></section><aside class="global-country-detail" id="globalCountryDetail"></aside>
  <section class="global-risk-board">${Object.entries(globalRiskMeta).map(([level,meta])=>`<article class="${level}"><header><i></i><div><span>${meta.color}</span><h2>${meta.label}</h2></div><strong>${counts[level]}</strong></header><div>${globalSituationCountries.filter(item=>item.level===level).map(item=>`<button data-global-country="${item.code}" data-level="${item.level}"><b>${item.code}</b><span>${item.name}</span><small>${item.minerals.slice(0,2).join(" · ")}</small></button>`).join("")}</div></article>`).join("")}</section><p class="global-disclaimer">红、橙、黄用于安排三级核查资源；绿色表示当前未纳入三级重点名单，并不等同于绝对安全。所有分级均不构成对任何国家、地区、企业或交易的违法认定。</p></div></div>`;
  bindGlobalSituationMap();
}

function render(){
  const route=routeName();
  if(route!=="global-situation")disposeGlobalSituationMap();
  setActiveNav(route);
  if(route==="export-controls") renderExportPage();
  else if(route==="minerals") renderMineralMarketPage();
  else if(route==="global-situation") renderGlobalSituationFullscreenPage();
  else if(route==="intelligence-analysis") renderIntelligenceAnalysisPage();
  else if(route==="countries") renderFileLibraryPage();
  else if(route==="settings") renderSettingsPage();
  else if(route==="ai-analysis") renderAiAnalysisPage();
  else if(route==="ai-deep-research") renderAiDeepResearchPage();
  
  else if(route==="ai-report") renderAiReportPage();
  else if(route==="smart-qa") renderSmartQaPageV2();
  else if(route==="relationship-graph") renderRelationshipGraphPage();
  else if(route==="supply-chain-path") renderSupplyChainPathPage();
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
        <span class="demo-badge">综合研判 · 更新至 ${SYSTEM_DATA_DATE}</span>
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
          <span class="panel-tag">数据核验至 ${SYSTEM_DATA_DATE}</span>
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
        <div><strong>数据口径</strong><span>出口量采用指数化展示，便于跨矿种比较；海外价格对应代表性产品，并非所有品级成交价。</span></div>
        <div><strong>已核验基线</strong><span>USGS《Mineral Commodity Summaries 2026》2026年5月修订版；政策和项目进度核验至 ${SYSTEM_DATA_DATE}。</span></div>
        <div><strong>使用提示</strong><span>未接入授权实时行情的品种明确标记“待接行情”；参考指标不用于交易、估值或直接执法定性。</span></div>
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
  const projectPageSize=5;
  const projectPageCount=Math.max(1,Math.ceil(alternativeSupplyProjects.length/projectPageSize));
  marketSituationState.projectPage=Math.min(Math.max(1,marketSituationState.projectPage||1),projectPageCount);
  const pagedProjects=alternativeSupplyProjects.slice((marketSituationState.projectPage-1)*projectPageSize,marketSituationState.projectPage*projectPageSize);
  panel.innerHTML=`
    <section class="cm-country-action-section">
      <div class="cm-subsection-head"><div><h3>各国替代行动与投资建厂</h3><p>按国家梳理政策投入、在建工厂、海外投资和长期承购安排 · 核验更新至 ${SYSTEM_DATA_DATE}</p></div><span>${alternativeCountryActions.length} ECONOMIES</span></div>
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
        <div class="cm-subsection-head"><div><h3>代表性替代供应项目</h3><p>仅把商业交付视为有效供应；建设、试产和规划产能分别标识 · 核验更新至 ${SYSTEM_DATA_DATE}。</p></div><span>${alternativeSupplyProjects.length} PROJECTS</span></div>
        <div class="cm-project-list">
          ${pagedProjects.map((item,index)=>{const verification=alternativeProjectVerification[item.name];const photo=alternativeProjectPhotos[item.name];return `
            <article class="cm-project-card" style="--cm-delay:${index*.045}s">
              <div class="cm-project-mark ${item.stageKey}"><i></i><span>${item.mineral}</span></div>
              ${photo?`<a class="cm-project-photo" data-label="项目实景" href="${photo.url}" target="_blank" rel="noreferrer" title="图片来源：${photo.source}"><img src="${photo.src}" alt="${photo.alt}" loading="lazy" onerror="this.closest('.cm-project-photo').classList.add('is-broken');this.remove()"/></a>`:""}
              <div class="cm-project-main"><header><h4>${item.name}</h4><span>${item.region}</span></header><p>${item.progress}</p><small>${item.chain}</small><div class="cm-project-proof"><span class="cm-proof-status ${verification.status.startsWith("已核验")?"verified":"pending"}">${verification.status}</span><a href="${verification.url}" target="_blank" rel="noreferrer">来源：${verification.source}</a><time>发布：${verification.date}</time></div></div>
              <div class="cm-project-stage"><strong>${item.stage}</strong><span>瓶颈：${item.bottleneck}</span></div>
            </article>`;}).join("")}
        </div>
        ${projectPageCount>1?`<nav class="snapshot-pagination cm-project-pagination" aria-label="代表性替代供应项目分页"><button type="button" data-project-page="${marketSituationState.projectPage-1}" ${marketSituationState.projectPage===1?"disabled":""}>上一页</button>${Array.from({length:projectPageCount},(_,index)=>`<button type="button" data-project-page="${index+1}" class="${index+1===marketSituationState.projectPage?"active":""}">${index+1}</button>`).join("")}<button type="button" data-project-page="${marketSituationState.projectPage+1}" ${marketSituationState.projectPage===projectPageCount?"disabled":""}>下一页</button></nav>`:""}
      </section>
      <section class="cm-readiness-section">
        <div class="cm-subsection-head"><div><h3>矿种替代成熟度</h3><p>资源端、中游加工与技术替代分开判断</p></div></div>
        <div class="cm-readiness-horizon cm-horizon-grid">
          ${alternativeTimeHorizons.map(item=>`
            <article class="${item.tone}"><span>${item.range}</span><h3>${item.title}</h3><div>${item.items.map(value=>`<b>${value}</b>`).join("")}</div></article>`).join("")}
        </div>
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
  panel.querySelectorAll("[data-project-page]").forEach(button=>button.addEventListener("click",()=>{
    marketSituationState.projectPage=Number(button.dataset.projectPage)||1;
    renderCriticalMineralSituationPanel();
  }));
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
          <td>${item.dataStatus?`<span class="price-change pending">待接入</span><small>${item.dataStatus}</small>`:`<span class="price-change ${item.change>=0?"up":"down"}">${item.change>=0?"+":""}${item.change.toFixed(1)}%</span>`}</td>
        </tr>`;
      }).join("")}</tbody>
    </table>`:`<div class="empty">没有符合当前筛选条件的矿产。</div>`;
}

function quarterlyPolicySeries(){
  const latestDate=new Date("2026-08-08T00:00:00");
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
        <div class="panel-head"><div><h2>管制政策清单</h2><p>点击记录查看物项范围、管制手段和官方来源</p></div><span class="panel-tag">核验至 ${SYSTEM_DATA_DATE}</span></div>
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

      <section class="panel catalog-panel entity-catalog" id="entityCatalog">
        <div class="panel-head"><div><h2>管制企业清单</h2><p>按公告明示类型区分不可靠实体、出口管制管控名单和关注名单</p></div><span class="panel-tag">OFFICIAL ENTITY LISTS</span></div>
        <div class="catalog-toolbar entity-toolbar">
          <label class="search-field"><span>⌕</span><input id="entitySearch" placeholder="搜索企业中英文名称、公告或措施…" value="${entityState.query}"/></label>
          <select class="year-select" id="entityType">${[["all","全部管制类型"],["unreliable_entity","不可靠实体"],["control_list","出口管制管控名单"],["watch_list","关注名单"]].map(([value,label])=>`<option value="${value}" ${entityState.controlType===value?"selected":""}>${label}</option>`).join("")}</select>
          <select class="year-select" id="entityCountry"><option value="all">全部国家/地区</option>${[...new Set((window.controlledEntities||[]).map(item=>item.country))].map(country=>`<option value="${country}" ${entityState.country===country?"selected":""}>${country}</option>`).join("")}</select>
        </div>
        <div class="table-meta"><span>共找到 <strong id="entityResultCount">0</strong> 家实体</span><span>不同名单具有不同法律状态，不作合并定性</span></div>
        <div id="entityTableWrap"></div>
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
          <select class="year-select" id="hsControlType">${[["all","全部管制类型"],["item_control","物项管制"],["technology_control","技术管制"],["entity_measure","实体措施"],["status_adjustment","状态调整"]].map(([value,label])=>`<option value="${value}" ${announcementState.controlType===value?"selected":""}>${label}</option>`).join("")}</select>
        </div>
        <div class="table-meta"><span>共整理 <strong id="hsResultCount">0</strong> 项公告物项</span><span>税号仅供识别参考，以最新税则及主管部门解释为准</span></div>
        <div class="hs-table-wrap" id="hsTableWrap"></div>
      </section>
    </div>`;
  bindExportControls();
  renderTable();
  bindEntityCatalog();
  renderEntityTable();
  bindAnnouncementCatalog();
  renderAnnouncementTable();
}

function filteredPolicies(){
  const q=state.query.trim().toLowerCase();
  return policies.filter(p=>(state.status==="all"||p.status===state.status)&&(state.year==="all"||p.year===state.year)&&(!q||[p.name,p.type,p.scopeShort,p.scope,p.method].join(" ").toLowerCase().includes(q)));
}

function renderTable(){
  const rows=filteredPolicies();
  const pageCount=Math.max(1,Math.ceil(rows.length/state.pageSize));
  state.page=Math.min(Math.max(1,state.page),pageCount);
  const pageRows=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
  document.getElementById("resultCount").textContent=rows.length;
  document.getElementById("tableWrap").innerHTML=rows.length?`
    <table class="policy-table">
      <thead><tr><th>矿产 / 材料</th><th>管制类型</th><th>管制范围</th><th>实施 / 公布</th><th>政策来源</th><th>当前状态</th><th></th></tr></thead>
      <tbody>${pageRows.map(p=>`<tr tabindex="0" data-id="${p.id}">
        <td><div class="mineral-cell"><span class="element">${p.symbol}</span><div><strong>${p.name}</strong><small>${p.type}</small></div></div></td>
        <td>${controlTypeBadge(p.type==="技术"?"technology_control":"item_control")}</td>
        <td class="scope-text">${p.scopeShort}</td>
        <td class="policy-date-cell"><span>${p.date}</span>${p.pauseDate?`<small>暂停：${p.pauseDate}</small>`:""}</td>
        <td class="policy-source-cell"><span>${p.source.split("；")[0]}</span>${p.pauseNotice?`<a href="${p.pauseUrl}" target="_blank" rel="noreferrer">${p.pauseNotice} ↗</a>`:""}</td>
        <td><span class="status-pill ${p.status}">${p.statusText}</span></td><td class="row-arrow">↗</td>
      </tr>`).join("")}</tbody>
    </table>${pageCount>1?`<nav class="snapshot-pagination compact-pagination" aria-label="管制政策清单分页"><button type="button" data-policy-page="${state.page-1}" ${state.page===1?"disabled":""}>上一页</button>${Array.from({length:pageCount},(_,i)=>`<button type="button" data-policy-page="${i+1}" class="${i+1===state.page?"active":""}">${i+1}</button>`).join("")}<button type="button" data-policy-page="${state.page+1}" ${state.page===pageCount?"disabled":""}>下一页</button></nav>`:""}`:`<div class="empty">没有符合当前筛选条件的记录。</div>`;
  document.querySelectorAll("tr[data-id]").forEach(row=>{
    row.addEventListener("click",()=>openDetail(row.dataset.id));
    row.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(row.dataset.id)}});
  });
  document.querySelectorAll(".policy-source-cell a").forEach(link=>link.addEventListener("click",event=>event.stopPropagation()));
  document.querySelectorAll("[data-policy-page]").forEach(button=>button.addEventListener("click",()=>{state.page=Number(button.dataset.policyPage);renderTable();document.querySelector(".catalog-panel")?.scrollIntoView({behavior:"smooth",block:"start"});}));
}

function bindExportControls(){
  document.getElementById("policySearch").addEventListener("input",e=>{state.query=e.target.value;state.page=1;renderTable()});
  document.getElementById("yearSelect").addEventListener("change",e=>{state.year=e.target.value;state.page=1;renderTable()});
  document.querySelectorAll(".filter-chip").forEach(btn=>btn.addEventListener("click",()=>{state.status=btn.dataset.status;state.page=1;document.querySelectorAll(".filter-chip").forEach(x=>x.classList.toggle("active",x===btn));renderTable()}));
  document.getElementById("copySummary").addEventListener("click",async()=>{const text="截至2026年7月2日，中国现行关键矿产出口管制直接涉及镓、锗、石墨、锑、钨、碲、铋、钼、铟，七种中重稀土及金刚石等超硬材料。多数措施为特定物项许可，并非全面禁运。";try{await navigator.clipboard.writeText(text)}catch{window.prompt("复制摘要",text)}});
  document.getElementById("exportData").addEventListener("click",()=>downloadCSV());
  document.getElementById("openHsCatalog").addEventListener("click",()=>document.getElementById("hsCatalog").scrollIntoView({behavior:"smooth",block:"start"}));
}

function filteredEntities(){
  const q=entityState.query.trim().toLowerCase();
  return (window.controlledEntities||[]).filter(item=>(entityState.controlType==="all"||item.controlType===entityState.controlType)&&(entityState.country==="all"||item.country===entityState.country)&&(!q||[item.name,item.nameEn,item.notice,item.measure,item.country].join(" ").toLowerCase().includes(q)));
}

function bindEntityCatalog(){
  document.getElementById("entitySearch").addEventListener("input",event=>{entityState.query=event.target.value;entityState.page=1;renderEntityTable()});
  document.getElementById("entityType").addEventListener("change",event=>{entityState.controlType=event.target.value;entityState.page=1;renderEntityTable()});
  document.getElementById("entityCountry").addEventListener("change",event=>{entityState.country=event.target.value;entityState.page=1;renderEntityTable()});
}

function renderEntityTable(){
  const rows=filteredEntities(),pageCount=Math.max(1,Math.ceil(rows.length/entityState.pageSize));
  entityState.page=Math.min(Math.max(1,entityState.page),pageCount);
  const pageRows=rows.slice((entityState.page-1)*entityState.pageSize,entityState.page*entityState.pageSize);
  document.getElementById("entityResultCount").textContent=rows.length;
  document.getElementById("entityTableWrap").innerHTML=rows.length?`<table class="entity-table"><thead><tr><th>企业 / 实体</th><th>管制类型</th><th>国家/地区</th><th>列入日期</th><th>公告及措施</th><th>原文</th></tr></thead><tbody>${pageRows.map(item=>`<tr><td><strong>${item.name}</strong><small>${item.nameEn}</small></td><td>${controlTypeBadge(item.controlType)}</td><td>${item.country}</td><td>${item.date}</td><td><strong>${item.notice}</strong><small>${item.measure}</small></td><td><a class="table-source-link" href="${item.source}" target="_blank" rel="noreferrer">查看 ↗</a></td></tr>`).join("")}</tbody></table>${pageCount>1?`<nav class="snapshot-pagination compact-pagination" aria-label="管制企业清单分页"><button type="button" data-entity-page="${entityState.page-1}" ${entityState.page===1?"disabled":""}>上一页</button>${Array.from({length:pageCount},(_,i)=>`<button type="button" data-entity-page="${i+1}" class="${i+1===entityState.page?"active":""}">${i+1}</button>`).join("")}<button type="button" data-entity-page="${entityState.page+1}" ${entityState.page===pageCount?"disabled":""}>下一页</button></nav>`:""}`:`<div class="empty">当前筛选条件下没有已收录实体。</div>`;
  document.querySelectorAll("[data-entity-page]").forEach(button=>button.addEventListener("click",()=>{entityState.page=Number(button.dataset.entityPage);renderEntityTable();document.getElementById("entityCatalog")?.scrollIntoView({behavior:"smooth",block:"start"})}));
}

function filteredAnnouncementItems(){
  const q=announcementState.query.trim().toLowerCase();
  return announcementItems.filter(item=>
    (announcementState.status==="all"||item.status===announcementState.status)&&
    (announcementState.notice==="all"||item.notice===announcementState.notice)&&
    (announcementState.controlType==="all"||item.controlType===announcementState.controlType)&&
    (!q||[item.notice,item.item,item.controlCode,item.hsCode,controlTypeMeta[item.controlType]?.label].join(" ").toLowerCase().includes(q))
  );
}

function bindAnnouncementCatalog(){
  document.getElementById("hsSearch").addEventListener("input",event=>{announcementState.query=event.target.value;announcementState.page=1;renderAnnouncementTable()});
  document.getElementById("hsNotice").addEventListener("change",event=>{announcementState.notice=event.target.value;announcementState.page=1;renderAnnouncementTable()});
  document.getElementById("hsStatus").addEventListener("change",event=>{announcementState.status=event.target.value;announcementState.page=1;renderAnnouncementTable()});
  document.getElementById("hsControlType").addEventListener("change",event=>{announcementState.controlType=event.target.value;announcementState.page=1;renderAnnouncementTable()});
  document.getElementById("exportHsData").addEventListener("click",()=>downloadAnnouncementCSV());
}

function renderAnnouncementTable(){
  const rows=filteredAnnouncementItems();
  const pageCount=Math.max(1,Math.ceil(rows.length/announcementState.pageSize));
  announcementState.page=Math.min(Math.max(1,announcementState.page),pageCount);
  const pageRows=rows.slice((announcementState.page-1)*announcementState.pageSize,announcementState.page*announcementState.pageSize);
  document.getElementById("hsResultCount").textContent=rows.length;
  document.getElementById("hsTableWrap").innerHTML=rows.length?`
    <table class="hs-table">
      <thead><tr><th>公告</th><th>管制类型</th><th>商品 / 物项</th><th>管制编码</th><th>参考海关商品编号 / 税则号列</th><th>状态</th><th>原文</th></tr></thead>
      <tbody>${pageRows.map(item=>`<tr>
        <td><strong>${item.notice}</strong><small>${item.date}</small></td>
        <td>${controlTypeBadge(item.controlType)}</td>
        <td>${item.item}</td>
        <td class="control-code">${item.controlCode}</td>
        <td class="hs-code">${item.hsCode}</td>
        <td><span class="status-pill ${item.status==="active"?"active":item.status==="paused"?"paused":"info"}">${item.statusText}</span></td>
        <td><a class="table-source-link" href="${item.source}" target="_blank" rel="noreferrer">查看 ↗</a></td>
      </tr>`).join("")}</tbody>
    </table>${pageCount>1?`<nav class="snapshot-pagination compact-pagination" aria-label="公告商品与税号清单分页"><button type="button" data-hs-page="${announcementState.page-1}" ${announcementState.page===1?"disabled":""}>上一页</button>${Array.from({length:pageCount},(_,i)=>`<button type="button" data-hs-page="${i+1}" class="${i+1===announcementState.page?"active":""}">${i+1}</button>`).join("")}<button type="button" data-hs-page="${announcementState.page+1}" ${announcementState.page===pageCount?"disabled":""}>下一页</button></nav>`:""}`:`<div class="empty">没有符合当前筛选条件的公告物项。</div>`;
  document.querySelectorAll("[data-hs-page]").forEach(button=>button.addEventListener("click",()=>{announcementState.page=Number(button.dataset.hsPage);renderAnnouncementTable();document.getElementById("hsCatalog")?.scrollIntoView({behavior:"smooth",block:"start"});}));
}

function downloadAnnouncementCSV(){
  const head=["公告","发布日期","管制类型","商品/物项","两用物项管制编码","参考海关商品编号/税则号列","状态","官方原文"];
  const lines=[head,...filteredAnnouncementItems().map(item=>[item.notice,item.date,controlTypeMeta[item.controlType]?.label||item.controlType,item.item,item.controlCode,item.hsCode,item.statusText,item.source])]
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

const gatherInfoMineralTerms={
  tungsten:["钨","tungsten","wolfram","carbide"],gallium:["镓","gallium"],germanium:["锗","germanium"],graphite:["石墨","graphite"],antimony:["锑","antimony"],diamond:["金刚石","diamond"],tellurium:["碲","tellurium"],bismuth:["铋","bismuth"],molybdenum:["钼","molybdenum"],indium:["铟","indium"],samarium:["钐","samarium"],gadolinium:["钆","gadolinium"],terbium:["铽","terbium"],dysprosium:["镝","dysprosium"],lutetium:["镥","lutetium"],scandium:["钪","scandium"],yttrium:["钇","yttrium"],holmium:["钬","holmium"],erbium:["铒","erbium"],thulium:["铥","thulium"],europium:["铕","europium"],ytterbium:["镱","ytterbium"],lithium:["锂","lithium"],nickel:["镍","nickel"],cobalt:["钴","cobalt"],manganese:["锰","manganese"]
};
function collectionDateLabel(value){return String(value||"").match(/\d{4}-\d{2}-\d{2}/)?.[0]||"采集时间待补";}
function liveCollectionItemsForMineral(mineral){
  const terms=gatherInfoMineralTerms[mineral.id]||[mineral.name.toLowerCase()];
  return intelligenceState.collectionItems.filter(item=>{
    const text=`${item.title_zh||""} ${item.title||""} ${item.summary_zh||""} ${item.summary||""}`.toLowerCase();
    return terms.some(term=>text.includes(term.toLowerCase()));
  });
}
function renderCollectedCandidates(selected){
  if(!intelligenceState.collectionRequestedAt)return "";
  const items=liveCollectionItemsForMineral(selected);
  const error=intelligenceState.collectionError?`<p class="intel-collection-note error">${escapeT(intelligenceState.collectionError)}</p>`:"";
  const cards=items.slice(0,5).map(item=>`<article class="snapshot-card intel-update-card collection-candidate-card"><div class="snapshot-status"><span>新采集候选</span><b class="pending">待人工核验</b></div><div class="snapshot-heading"><div class="intel-card-meta"><span>${collectionDateLabel(item.published_at||item.collected_at)}</span><span>${escapeT(item.source_name||item.source_id||"公开网页")}</span><b>${escapeT(item.category||"公开信息")}</b></div><h3>${escapeT(item.title_zh||item.title||"未命名条目")}</h3><p>${escapeT(item.summary_zh||item.summary||item.content_zh||item.content||"该条目尚未提取摘要。").slice(0,420)}</p></div><footer><span>适用矿种：${selected.name}</span>${item.url?`<a href="${escapeT(item.url)}" target="_blank" rel="noreferrer">查看原始网页 ↗</a>`:"<span>原始链接待补</span>"}</footer></article>`).join("");
  return `<section class="panel intel-section collection-results"><div class="panel-head"><div><h2>本次采集候选</h2><p>由关键矿产独立采集后端抓取的公开网页结果；仅在人工核验通过后，才会转入“情报快照”。</p></div><span class="panel-tag">${items.length} MATCHED</span></div>${error}${cards?`<div class="snapshot-list">${cards}</div>`:`<p class="empty-state">本次采集未返回与 ${selected.name} 直接匹配的候选信息；可切换其他矿种查看。</p>`}</section>`;
}

// 自动采集的候选结果在页面打开时直接从本地后端读取；不必再等待用户点击按钮。
// 候选仍须人工核验，不能自动计入“已归档执法案例”或“已归档情报”。
function loadCollectedCandidates(){
  if(intelligenceState.collectionLoaded)return;
  intelligenceState.collectionLoaded=true;
  Promise.all([
    fetch("/_mineral-api/api/items?page=1&page_size=100").then(response=>response.ok?response.json():null),
    fetch("/_mineral-api/api/summary").then(response=>response.ok?response.json():null)
  ]).then(([itemsPayload,summary])=>{
    if(!itemsPayload)return;
    intelligenceState.collectionItems=itemsPayload.items||[];
    intelligenceState.collectionRequestedAt=summary?.last_collected_at||"历史自动采集";
    intelligenceState.collectionStatus=`自动采集候选 ${itemsPayload.total||0} 条，待人工核验后归档。`;
    if(document.getElementById("intelCollectButton"))renderIntelligenceAnalysisPage();
  }).catch(()=>{intelligenceState.collectionLoaded=false;});
}

function renderIntelligenceAnalysisPage(){
  const selected=intelligenceMinerals.find(item=>item.id===intelligenceState.mineral)||intelligenceMinerals[0];
  const allSnapshots=(window.intelligenceSnapshots||[]).filter(item=>item.mineral===selected.id&&item.translationStatus!=="人工研判");
  const latestSnapshots=latestCollectionBatch(allSnapshots);
  // 展示全部快照，避免最新一次人工研判批次遮蔽此前已核验的官方原文。
  const snapshots=allSnapshots.slice().sort((a,b)=>String(b.sourcePublished||"").localeCompare(String(a.sourcePublished||"")));
  const profile=selected.id==="tungsten"?null:intelProfiles[intelProfileKeys[selected.id]];
  const dateOrder=item=>String(item.date||item.sourcePublished||"").match(/\d{4}(?:[-.]\d{1,2})?(?:[-.]\d{1,2})?/)?.[0].replace(/[.-]/g,"").padEnd(8,"0")||"00000000";
  const updates=(selected.id==="tungsten"
    ?snapshots.map(item=>({
      date:item.sourcePublished,type:item.category,title:item.titleZh,summary:item.summaryZh,sourceName:item.sourceName,source:item.sourceUrl,
      fullText:item.fullTextZh||"",documentLabel:item.documentLabel||"",hideEvidence:item.hideEvidence||false,
      evidenceStatus:item.evidenceStatus||(item.translationStatus==="人工研判"?"人工研判·待补证据":"已核验·原始网页"),
      evidenceClass:item.evidenceClass||(item.translationStatus==="人工研判"?"derived":"native")
    }))
    :[...profile.updates,...currentIntelUpdates(selected,profile)].map(item=>({
      ...item,evidenceStatus:"预置条目·待原始网页复核",evidenceClass:"pending"
    }))
  ).slice().sort((a,b)=>dateOrder(b).localeCompare(dateOrder(a)));
  const snapshotPageSize=5;
  const snapshotPageCount=Math.max(1,Math.ceil(updates.length/snapshotPageSize));
  intelligenceState.snapshotPage=Math.min(Math.max(1,intelligenceState.snapshotPage||1),snapshotPageCount);
  const pagedUpdates=updates.slice((intelligenceState.snapshotPage-1)*snapshotPageSize,intelligenceState.snapshotPage*snapshotPageSize);
  let visibleCases=enforcementCasesForMineral(selected,profile).slice().sort((a,b)=>dateOrder(b).localeCompare(dateOrder(a)));
  if(visibleCases.length===0) visibleCases=[noDirectMineralCase(selected)];
  const signals=selected.id==="tungsten"?tungstenRiskSignals:profile.signals;
  const collectionDate=selected.id==="tungsten"?formatCollectionDate(latestSnapshots.date):{year:"2026",short:"07.15"};
  const content=`
    <section class="intel-summary-grid">
      <article class="intel-summary-card"><span>本次情报更新</span><strong>${updates.length}</strong><small>按矿种筛选展示</small></article>
      <article class="intel-summary-card"><span>本次执法案例</span><strong>${visibleCases.length}</strong><small>仅展示最新批次</small></article>
      <article class="intel-summary-card"><span>高风险信号</span><strong>${signals.filter(item=>item.level==="高").length}</strong><small>项优先复核</small></article>
      <article class="intel-summary-card"><span>最新采集</span><strong class="intel-date">${collectionDate.short}</strong><small>${collectionDate.year} 年</small></article>
    </section>

    <section class="panel intel-section">
      <div class="panel-head">
        <div><h2>情报快照</h2><p>围绕 ${selected.name} 展示最新公开政策、监管与市场情报；历史采集内容自动归档至文件库。</p></div>
        <span class="panel-tag">${updates.length} LATEST UPDATES</span>
      </div>
      <div class="snapshot-list">
        ${pagedUpdates.map(item=>`
          <article class="snapshot-card intel-update-card">
            <div class="snapshot-status"><span>公开情报</span>${item.hideEvidence?"":`<b class="${item.evidenceClass||"pending"}">${item.evidenceStatus||"待原始网页复核"}</b>`}</div>
            <div class="snapshot-heading">
              <div class="intel-card-meta"><span>${item.date}</span><span>${item.sourceName}</span><b>${item.type}</b></div>
              <h3>${item.title}</h3><p>${item.summary}</p>
              ${item.fullText?`<details class="snapshot-fulltext"><summary>${item.documentLabel||"查看全文"}</summary><pre>${escapeT(item.fullText)}</pre></details>`:""}
            </div>
            <footer><span>适用矿种：${selected.name}</span>${item.source?`<a href="${item.source}" target="_blank" rel="noreferrer">查看原始网页 ↗</a>`:"<span>本地归档材料</span>"}</footer>
          </article>`).join("")}
      </div>
      ${updates.length>snapshotPageSize?`<nav class="snapshot-pagination" aria-label="情报快照分页"><button type="button" data-snapshot-page="${intelligenceState.snapshotPage-1}" ${intelligenceState.snapshotPage===1?"disabled":""}>上一页</button>${Array.from({length:snapshotPageCount},(_,index)=>`<button type="button" data-snapshot-page="${index+1}" class="${index+1===intelligenceState.snapshotPage?"active":""}">${index+1}</button>`).join("")}<button type="button" data-snapshot-page="${intelligenceState.snapshotPage+1}" ${intelligenceState.snapshotPage===snapshotPageCount?"disabled":""}>下一页</button></nav>`:""}
    </section>

    <section class="panel intel-section">
      <div class="panel-head">
        <div><h2>执法查发案例</h2><p>展示与 ${selected.name} 直接相关或具有物项识别参考价值的公开案例；历史案例保留在文件库。</p></div>
        <span class="panel-tag">${visibleCases.length} LATEST CASES</span>
      </div>
      <div class="case-list">
        ${visibleCases.map(item=>`
          <article class="case-card">
            <div class="case-country"><strong>${item.country}</strong><span>${item.agency}</span></div>
            <div class="case-main">
              <div class="intel-card-meta"><span>${item.date}</span><b>${item.mineral}</b><em>${item.status}</em>${item.sourceGrade?`<i class="case-grade case-grade-${item.sourceGrade.toLowerCase()}" title="${item.sourceGradeNote||sourceGradeLabels[item.sourceGrade]}">${sourceGradeLabels[item.sourceGrade]}</i>`:""}</div>
              <h3>${item.title}</h3>
              <p>${item.finding}</p>
              ${item.sourceGradeNote?`<div class="case-evidence-note">来源等级：${item.sourceGradeNote}</div>`:""}
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
        ${signals.map((item,index)=>`
          <article class="risk-card">
            <div class="risk-card-head"><span>R${String(index+1).padStart(2,"0")}</span><b class="${item.level==="高"?"high":"medium"}">${item.level}风险</b></div>
            <h3>${item.title}</h3>
            <p>${item.analysis}</p>
            <div><strong>建议核查</strong><span>${item.check}</span></div>
          </article>`).join("")}
      </div>
      <p class="intel-disclaimer">分析仅用于风险筛查与合规执法辅助；案件定性应以调查证据、法定程序及主管部门认定为准。</p>
    </section>`;

  root.innerHTML=`
    <div class="page intelligence-page">
      <header class="page-heading intel-heading">
        <div>
          <p class="page-kicker">OPEN-SOURCE INTELLIGENCE</p>
          <h1>开源信息情报</h1>
          <p>围绕关键矿产建立公开情报、执法案例和风险信号的统一分析视图。</p>
        </div>
        <div class="intel-heading-actions"><span class="intel-update">公开来源 · 截至 ${SYSTEM_DATA_DATE}</span><button type="button" class="intel-collect-button" id="intelCollectButton">↻ 更新采集</button></div>
      </header>
      <div class="mineral-selector">
        <label class="mineral-select-field" for="mineralSelect">
          <span>筛选关键矿产</span>
          <select id="mineralSelect" aria-label="选择关键矿产">
            ${intelligenceMinerals.map(item=>`<option value="${item.id}" ${item.id===selected.id?"selected":""}>${item.symbol} · ${item.name}</option>`).join("")}
          </select>
          <small>已接入 ${intelligenceMinerals.length} 项</small>
        </label>
      </div>
      ${renderCollectedCandidates(selected)}
      ${content}
    </div>`;

  document.getElementById("mineralSelect")?.addEventListener("change",event=>{
    intelligenceState.mineral=event.target.value;
    intelligenceState.snapshotPage=1;
    renderIntelligenceAnalysisPage();
  });
  document.querySelectorAll("[data-snapshot-page]").forEach(button=>button.addEventListener("click",()=>{
    intelligenceState.snapshotPage=Number(button.dataset.snapshotPage)||1;
    renderIntelligenceAnalysisPage();
  }));
  document.getElementById("intelCollectButton")?.addEventListener("click",async()=>{
    const button=document.getElementById("intelCollectButton");
    button.disabled=true;
    button.textContent="正在采集公开信息…";
    intelligenceState.collectionStatus="关键矿产采集后端正在抓取公开信息、去重并归档候选结果。";
    intelligenceState.collectionRequestedAt=new Date().toLocaleString("zh-CN",{hour12:false});
    intelligenceState.collectionError="";
    try{
      const response=await fetch("/_mineral-api/api/collect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({minerals:["all"]})});
      const job=await response.json();
      if(!response.ok)throw new Error(job.detail||"采集服务返回异常");
      let completedJob=job;
      for(let attempt=0;attempt<80&&["queued","running"].includes(completedJob.status);attempt+=1){
        button.textContent=`正在采集公开信息…${Math.min((attempt+1)*3,240)} 秒`;
        await new Promise(resolve=>window.setTimeout(resolve,3000));
        const statusResponse=await fetch(`/_mineral-api/api/jobs/${encodeURIComponent(job.job_id)}`);
        completedJob=await statusResponse.json();
        if(!statusResponse.ok)throw new Error(completedJob.detail||"采集任务状态读取失败");
      }
      if(completedJob.status!=="completed")throw new Error(completedJob.error||"采集任务未在预计时间内完成");
      intelligenceState.collectionRunIds=[completedJob.job_id];
      const itemsResponse=await fetch(`/_mineral-api/api/items?job_id=${encodeURIComponent(completedJob.job_id)}&page=1&page_size=100`);
      const itemsPayload=await itemsResponse.json();
      if(!itemsResponse.ok)throw new Error(itemsPayload.detail||"采集结果读取失败");
      intelligenceState.collectionItems=itemsPayload.items||[];
      intelligenceState.collectionStatus=`本次采集完成：新增 ${Number(completedJob.items_new)||0} 条候选信息；请人工核验后转入情报快照。`;
    }catch(error){
      intelligenceState.collectionItems=[];
      intelligenceState.collectionError=`采集未完成：${error.message||"无法连接 GatherInfo 服务"}`;
      intelligenceState.collectionStatus="采集服务异常，未写入情报快照。";
    }
    renderIntelligenceAnalysisPage();
  });
  document.querySelector("[data-mineral-jump]")?.addEventListener("click",()=>{
    intelligenceState.mineral="tungsten";
    renderIntelligenceAnalysisPage();
  });
  loadCollectedCandidates();
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
  var archivedCases=allArchivedEnforcementCases();
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
  for(var i=0;i<archivedCases.length;i++){
    var c=archivedCases[i];
    events.push({date:c.collectedAt,type:"案例",text:c.title,status:"warning"});
  }
  events.sort(function(a,b){return b.date.localeCompare(a.date);});
  events=events.slice(0,8);

  // 平台矿产口径统一为 26 种重点关键矿产；态势页的数据条目会随采集范围持续补充。
  var mineralCount=26;
  var intelCount=allArchivedIntelligenceSnapshots().length;
  var caseCount=archivedCases.length;
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
    {tone:"blue",value:mineralCount,unit:"种",label:"覆盖关键矿产",note:"态势持续更新",spark:[34,46,62,78,94],icon:metricIcon("<path d=\"m12 3 8 7-8 11L4 10l8-7Z\"/><path d=\"m4 10 8 3 8-3M12 13v8\"/>")},
    {tone:"cyan",value:intelCount,unit:"条",label:"已归档情报",note:"多源开源信息",spark:[28,52,43,76,100],icon:metricIcon("<path d=\"M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z\"/><path d=\"M12 9v3l2 2M4 4l2 2M20 4l-2 2\"/>")},
    {tone:"red",value:caseCount,unit:"条",label:"已归档执法案例",note:"全矿种统一汇总",spark:[30,38,58,70,88],icon:metricIcon("<circle cx=\"11\" cy=\"11\" r=\"6\"/><path d=\"m16 16 4 4M11 8v6M8 11h6\"/>")},
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
        "<div class=\"ov-hero-tags\"><span><i class=\"live\"></i>态势持续监测</span><span id=\"overviewCollectionStatus\">采集状态读取中</span><span>最近更新 "+latestEventDate+"</span></div>"+
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
  refreshOverviewCollectionStatus();
}

function refreshOverviewCollectionStatus(){
  const status=document.getElementById("overviewCollectionStatus");
  if(!status)return;
  fetch("/_mineral-api/api/summary").then(response=>response.ok?response.json():Promise.reject()).then(summary=>{
    const time=String(summary.last_collected_at||"").replace("T"," ").slice(0,16);
    status.textContent=time?`自动采集 ${summary.total_candidates||0} 条候选 · ${time}`:"自动采集服务已启动";
  }).catch(()=>{status.textContent="自动采集服务待连接";});
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
    <label class="mineral-select-field" for="aiMineralSelect">
      <span>筛选关键矿产</span>
      <select id="aiMineralSelect" aria-label="选择 AI 分析矿产">
        ${intelligenceMinerals.map(item=>`<option value="${item.id}" ${item.id===selected.id?"selected":""}>${item.symbol} · ${item.name}</option>`).join("")}
      </select>
      <small>已接入 ${intelligenceMinerals.length} 项</small>
    </label>
 </div>`;
}

function bindAiAnalysisMineralSelector(){
  document.getElementById("aiMineralSelect")?.addEventListener("change",event=>{
    aiAnalysisState.mineral=event.target.value;
    renderAiAnalysisPage();
  });
}

function renderAiFocusedMineralPage(selected,research){
  root.innerHTML=`<div class="page ai-risk-page">
    <header class="page-heading ai-risk-heading"><div><p class="page-kicker">AI ANALYST WORKSPACE · ${selected.symbol}</p><h1>${research.title}</h1><p>围绕公开执法案例、物项边界与供应链节点形成专题研判；企业、商品和路线均按事实与待核线索分层展示。</p></div><div class="ai-analysis-meta"><span>专题矿产<strong>${selected.name} ${selected.symbol}</strong></span><span>分析日期<strong>${SYSTEM_DATA_DATE}</strong></span><span>商业数据<strong>待平台查询复核</strong></span></div></header>
    ${aiAnalysisMineralSelector(selected)}
    <section class="ai-risk-metrics"><article><span>矿种定向公开参照</span><strong>${research.findings.filter(item=>item.tag!=="贸易数据状态").length}</strong><small>已附原始链接</small></article><article><span>明确涉案企业</span><strong>0</strong><small>公开材料未披露</small></article><article><span>商业数据结论</span><strong>0</strong><small>待平台查询复核</small></article><article><span>优先核验模式</span><strong>${research.signals.filter(item=>item.level==="高").length}</strong><small>不等同违规结论</small></article></section>
    <section class="panel ai-control-panel"><div class="panel-head"><div><h2>矿种专项研判</h2><p>把公开案例拆解为物项识别、企业核验和单证调取规则。</p></div><span class="panel-tag">MINERAL-SPECIFIC</span></div><div class="ai-findings-grid">${research.findings.map(item=>`<article class="ai-finding-card"><div class="intel-card-meta"><b>${item.tag}</b></div><h3>${item.title}</h3><p>${item.body}</p>${item.url?`<a href="${item.url}" target="_blank" rel="noreferrer">查看原始网页 ↗</a>`:""}</article>`).join("")}</div></section>
    <section class="panel ai-network-panel"><div class="panel-head"><div><h2>重点供应链核验链条</h2><p>为调单和关联分析提供节点框架；并非对链条中任何主体作风险指认。</p></div><span class="panel-tag">SUPPLY CHAIN</span></div><div class="ai-network-flow">${research.chain.map((item,index)=>`<span>${item}</span>${index<research.chain.length-1?"<b>→</b>":""}`).join("")}</div><p class="ai-network-note">${research.tradeQuery}</p></section>
    <section class="panel ai-action-panel"><div class="panel-head"><div><h2>违规模式与核查建议</h2><p>源自该矿种公开案例、物项规则和供应链特征的归纳，不直接推定任何主体违法。</p></div><span class="ai-badge">AI 研判 · 人工复核</span></div><div class="risk-grid">${research.signals.map((item,index)=>`<article class="risk-card"><div class="risk-card-head"><span>R${String(index+1).padStart(2,"0")}</span><b class="${item.level==="高"?"high":"medium"}">${item.level}风险</b></div><h3>${item.title}</h3><p>${item.body}</p><div><strong>建议核查</strong><span>${item.check}</span></div></article>`).join("")}</div><p class="intel-disclaimer">“待平台查询复核”不表示未发生交易，只表示当前尚未取得并验证商业数据库的筛选结果。案件定性以调查证据、法定程序和主管部门认定为准。</p></section>
  </div>`;
  bindAiAnalysisMineralSelector();
  decorateRenderedPage("ai-analysis");
}

function renderAiAnalysisPage(){
  const selected=intelligenceMinerals.find(item=>item.id===aiAnalysisState.mineral)||intelligenceMinerals[0];
  if(aiFocusedMineralResearch[selected.id]){renderAiFocusedMineralPage(selected,aiFocusedMineralResearch[selected.id]);return;}
  if(selected.id!=="tungsten"){
    const profile=intelProfiles[intelProfileKeys[selected.id]];
    const blueprint=mineralAnalysisBlueprints[selected.id];
    const updates=[...profile.updates,...currentIntelUpdates(selected,profile)].slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const directCases=enforcementCasesForMineral(selected,profile);
    const cases=directCases.length?directCases:[noDirectMineralCase(selected)];
    const signals=[{level:"高",title:`${selected.name}专项：${blueprint.risk}`,analysis:`结合${blueprint.use}供应链特征，该异常只能作为优先核查信号，不能脱离交易时点、具体物项和许可状态作违法认定。`,check:blueprint.check},...profile.signals];
    root.innerHTML=`<div class="page ai-risk-page">
      <header class="page-heading ai-risk-heading">
        <div>
          <p class="page-kicker">AI ANALYST WORKSPACE · ${selected.symbol}</p>
          <h1>${selected.name}产品出口风险专题</h1>
          <p>以现行或交易当期有效的政策规则为边界，汇集公开情报、执法信息与物项特征，形成可复核的风险筛查建议。</p>
        </div>
        <div class="ai-analysis-meta">
          <span>专题矿产<strong>${selected.name} ${selected.symbol}</strong></span>
          <span>分析日期<strong>${SYSTEM_DATA_DATE}</strong></span>
          <span>分析状态<strong>矿种专项分析已更新</strong></span>
        </div>
      </header>
      ${aiAnalysisMineralSelector(selected)}
      <section class="ai-risk-metrics">
        <article><span>公开情报更新</span><strong>${updates.length}</strong><small>政策与监管动态</small></article>
        <article><span>公开案例信息</span><strong>${cases.length}</strong><small>定向案例或持续采集</small></article>
        <article><span>高优先核验项</span><strong>${signals.filter(item=>item.level==="高").length}</strong><small>须调取原始单证</small></article>
        <article><span>风险结论</span><strong>0</strong><small>不对主体直接定性</small></article>
      </section>
      <section class="panel ai-control-panel mineral-analysis-brief">
        <div class="panel-head"><div><h2>${selected.name}专项分析结论</h2><p>按物项、用途、链条和海外替代进展形成独立研判，不套用其他矿种结论。</p></div><span class="panel-tag">UPDATED ${SYSTEM_DATA_DATE}</span></div>
        <div class="ai-findings-grid mineral-brief-grid">
          <article class="ai-finding-card"><div class="intel-card-meta"><b>受控形态</b></div><h3>物项识别重点</h3><p>${blueprint.form}</p></article>
          <article class="ai-finding-card"><div class="intel-card-meta"><b>供应链</b></div><h3>重点用途与链条</h3><p>${blueprint.use}</p><small>${blueprint.chain}</small></article>
          <article class="ai-finding-card"><div class="intel-card-meta"><b>综合研判</b></div><h3>最新态势判断</h3><p>${blueprint.outlook}</p><a href="${MINERAL_BASELINE_SOURCE}" target="_blank" rel="noreferrer">查看USGS 2026基线 ↗</a></article>
        </div>
      </section>
      <section class="panel ai-control-panel">
        <div class="panel-head"><div><h2>规则与情报动态</h2><p>公开来源整理；点击可核验原始页面。</p></div><span class="panel-tag">OPEN-SOURCE</span></div>
        <div class="ai-findings-grid">${updates.map(item=>`<article class="ai-finding-card"><div class="intel-card-meta"><span>${item.date}</span><b>${item.type}</b></div><h3>${item.title}</h3><p>${item.summary}</p><a href="${item.source}" target="_blank" rel="noreferrer">查看原始网页 ↗</a></article>`).join("")}</div>
      </section>
      <section class="panel ai-action-panel">
        <div class="panel-head"><div><h2>公开案例与执法参照</h2><p>区分已公开案例、专项部署和“待持续采集”状态。</p></div><span class="panel-tag">CASE REFERENCE</span></div>
        <div class="case-list">${cases.map(item=>`<article class="case-card"><div class="case-country"><strong>${item.country}</strong><span>${item.agency}</span></div><div class="case-main"><div class="intel-card-meta"><span>${item.date}</span><b>${item.mineral}</b><em>${item.status}</em></div><h3>${item.title}</h3><p>${item.finding}</p><div class="case-route"><span>流向</span><strong>${item.direction}</strong></div></div><a class="case-source" href="${item.source}" target="_blank" rel="noreferrer">↗</a></article>`).join("")}</div>
      </section>
      <section class="panel ai-action-panel"><div class="panel-head"><div><h2>风险信号与核查建议</h2><p>用于筛查和排序；需结合证据、法定程序和主管部门认定。</p></div><span class="ai-badge">AI 研判 · 人工复核</span></div><div class="risk-grid">${signals.map((item,index)=>`<article class="risk-card"><div class="risk-card-head"><span>R${String(index+1).padStart(2,"0")}</span><b class="${item.level==="高"?"high":"medium"}">${item.level}风险</b></div><h3>${item.title}</h3><p>${item.analysis}</p><div><strong>建议核查</strong><span>${item.check}</span></div></article>`).join("")}</div><p class="intel-disclaimer">分析仅用于合规风险筛查与执法辅助；案件定性应以调查证据、法定程序及主管部门认定为准。</p></section>
    </div>`;
    bindAiAnalysisMineralSelector();
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
        <span>分析日期<strong>${SYSTEM_DATA_DATE}</strong></span>
        <span>分析状态<strong>已按生效时间复核</strong></span>
      </div>
    </header>

    ${aiAnalysisMineralSelector(selected)}

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
  const head=["公告","发布日期","管制类型","商品/物项","两用物项管制编码","参考海关商品编号/税则号列","状态","官方原文"];
  const rows=[head,...announcementItems.map(item=>[item.notice,item.date,controlTypeMeta[item.controlType]?.label||item.controlType,item.item,item.controlCode,item.hsCode,item.statusText,item.source])];
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
  const caseArchives=allArchivedEnforcementCases().map(caseToLibraryFile);
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
  document.getElementById("dialogContent").innerHTML=`<div class="dialog-body"><span class="dialog-symbol">${p.symbol}</span><span class="status-pill ${p.status}">${p.statusText}</span>${controlTypeBadge(p.type==="技术"?"technology_control":"item_control")}<h2>${p.name}</h2><p class="dialog-sub">${p.date} · ${p.type}${p.pauseDate?` · 暂停公告日期 ${p.pauseDate}`:""}</p><section class="detail-block"><h3>CONTROL SCOPE / 管制范围</h3><p>${p.scope}</p></section><section class="detail-block"><h3>CONTROL METHOD / 管制手段</h3><p>${p.method}</p></section><section class="detail-block"><h3>PRIMARY SOURCE / 政策来源</h3><p>${p.source}</p><div class="source-actions"><a class="source-link" href="${p.url}" target="_blank" rel="noreferrer">打开原公告 ↗</a>${p.pauseUrl?`<a class="source-link pause" href="${p.pauseUrl}" target="_blank" rel="noreferrer">打开第70号暂停公告 ↗</a>`:""}</div></section></div>`;
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
  root.innerHTML="<div class=\"page research-tool-page\"><header class=\"page-heading research-tool-heading\"><div><p class=\"page-kicker\">AI REPORT STUDIO</p><h1>AI战略报告</h1><p>统一归档正式报告、矿种专项研究和逐条风险分析结果。</p></div><span class=\"deep-status\"><i></i>报告已归档</span></header><section class=\"panel\" style=\"margin-bottom:8px\"><div style=\"display:flex;gap:10px;align-items:center;flex-wrap:wrap\"><strong style=\"font-size:13px;color:var(--text-secondary);white-space:nowrap\">AI生成</strong><button class=\"button primary\" id=\"btnGenBrief\">生成要情</button><button class=\"button\" id=\"btnGenReport\">生成呈报</button><button class=\"button\" id=\"btnGenResearch\">生成研究报告</button></div></section><section class=\"panel yixun-report-panel\"><div class=\"panel-head\"><div><p class=\"page-kicker\">TRADE DATA RISK RESEARCH</p><h2>易迅贸易数据风险分析</h2><p>26类关键矿产/相关物项，支持矿种筛选、在线阅读和Word归档查看。</p></div><div class=\"yixun-report-toolbar\"><label>矿种筛选<select id=\"yixunReportMineral\"></select></label><a class=\"button\" href=\"./reports/yixun-risk/documents/关键矿产易迅数据第三国绕道风险逐条分析.xlsx\" target=\"_blank\" rel=\"noreferrer\">逐条分析Excel ↗</a></div></div><div id=\"yixunReportContent\"></div></section><section class=\"panel deep-archive-panel\"><div class=\"panel-head\"><div><h2>其他已生成报告</h2><p>共 <b id=\"aiReportCount\">0</b> 份报告</p></div></div><div class=\"deep-archive-grid\" id=\"aiReportGrid\"></div></section><section class=\"panel deep-report-detail\" id=\"aiReportDetail\"><div class=\"panel-head\"><div><h2 id=\"aiReportTitle\">选择一份报告查看详情</h2><p id=\"aiReportSubtitle\">点击上方报告卡片查看概要</p></div></div><div class=\"deep-detail-grid\" id=\"aiReportFindings\"></div><div id=\"aiReportActions\" style=\"margin-top:16px\"></div></section></div>";  renderYixunRiskReport(); renderAiReportArchive();
  document.getElementById("btnGenBrief")?.addEventListener("click",function(){showFormatDialog("要情");});
  document.getElementById("btnGenReport")?.addEventListener("click",function(){showFormatDialog("呈报");});
  document.getElementById("btnGenResearch")?.addEventListener("click",function(){showFormatDialog("研究报告");});
  renderAiReportDetail(selectedAiReportId);
}

function renderYixunRiskReport(){
  var select=document.getElementById("yixunReportMineral");
  var content=document.getElementById("yixunReportContent");
  if(!select||!content)return;
  select.innerHTML=yixunRiskReports.map(function(r){return "<option value=\""+escapeT(r.mineral)+"\""+(r.mineral===yixunReportState.mineral?" selected":"")+">"+escapeT(r.mineral)+"</option>"}).join("");
  var r=yixunRiskReports.find(function(x){return x.mineral===yixunReportState.mineral})||yixunRiskReports[0];
  var total=r.reviewed||1;
  var highWidth=Math.min(100,Math.max(r.high?4:0,r.high/total*100));
  var mediumWidth=Math.min(100,Math.max(r.medium?6:0,r.medium/total*100));
  var monitorWidth=Math.min(100,Math.max(r.monitor?8:0,r.monitor/total*100));
  content.innerHTML="<div class=\"yixun-report-hero\"><div><span class=\"yixun-report-status\">"+escapeT(r.status)+"</span><h3>"+escapeT(r.mineral)+"第三国绕道风险分析</h3><p>检索词："+escapeT(r.term)+" · 覆盖："+escapeT(r.coverage)+"</p></div><div class=\"yixun-report-actions\"><a class=\"button primary\" href=\""+escapeT(r.html)+"\" target=\"_blank\" rel=\"noreferrer\">在线阅读全文 ↗</a><a class=\"button\" href=\""+escapeT(r.docx)+"\" target=\"_blank\" rel=\"noreferrer\">打开Word报告</a></div></div>"+
    "<div class=\"yixun-report-metrics\"><article><span>页面命中</span><strong>"+r.hits.toLocaleString()+"</strong><small>查询结果</small></article><article><span>逐条审阅</span><strong>"+r.reviewed.toLocaleString()+"</strong><small>页面查看</small></article><article class=\"high\"><span>高优先</span><strong>"+r.high+"</strong><small>需优先调证</small></article><article class=\"medium\"><span>中优先</span><strong>"+r.medium+"</strong><small>建议核验</small></article><article class=\"monitor\"><span>暂停期监测</span><strong>"+r.monitor+"</strong><small>供应链基线</small></article></div>"+
    "<div class=\"yixun-report-analysis\"><article><h3>核心判断</h3><p>"+escapeT(r.conclusion)+"</p><div class=\"yixun-report-note\">高、中优先级只表示核查顺序，不代表违法认定；确认绕道仍需第三国再出口、主体、提运单、集装箱或原产地证据闭环。</div></article><article><h3>风险结构</h3><div class=\"yixun-risk-bar high\"><span>高优先</span><i><b style=\"width:"+highWidth+"%\"></b></i><em>"+r.high+"</em></div><div class=\"yixun-risk-bar medium\"><span>中优先</span><i><b style=\"width:"+mediumWidth+"%\"></b></i><em>"+r.medium+"</em></div><div class=\"yixun-risk-bar monitor\"><span>监测</span><i><b style=\"width:"+monitorWidth+"%\"></b></i><em>"+r.monitor+"</em></div></article></div>";
  select.onchange=function(){yixunReportState.mineral=this.value;renderYixunRiskReport();};
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

