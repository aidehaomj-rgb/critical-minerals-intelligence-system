window.controlledEntities = [
  ...[
    ["艾维奥克斯公司","Aveox, Inc."],["红猫控股公司","Red Cat Holdings, Inc."],["蒂尔无人机公司","Teal Drones, Inc."],
    ["美国IMSAR公司","IMSAR, LLC"],["杰亚机器人公司","Jaia Robotics, Inc."],["鲍尔航空航天技术公司","Ball Aerospace & Technologies Corp."],
    ["奥什科什防务公司","Oshkosh Defense, LLC"],["L3哈里斯海事服务公司","L3Harris Maritime Services, Inc."],
    ["芒廷帕斯材料公司","MP Materials Corp."],["美国稀土公司","USA Rare Earth, Inc."]
  ].map(([name,nameEn],index)=>({
    id:`control-2026-23-${index+1}`,name,nameEn,country:"美国",controlType:"control_list",date:"2026-06-22",
    notice:"商务部公告2026年第23号",measure:"禁止出口两用物项及转移、提供原产于中国的两用物项；特殊情形按公告申请。",
    source:"https://www.mofcom.gov.cn/zcfb/blgg/gg/2026/art/2026/art_aab677e956c943808cebf8c06a28ff0e.html"
  })),
  ...[
    ["洛克希德·马丁导弹与火控公司","Lockheed Martin Missiles and Fire Control"],
    ["洛克希德·马丁航空公司","Lockheed Martin Aeronautics"],
    ["其他洛克希德·马丁子公司","Other Lockheed Martin subsidiaries"],
    ["标枪合资公司","Raytheon/Lockheed Martin Javelin Joint Venture"],
    ["雷神导弹系统公司","Raytheon Missile Systems"],
    ["通用动力军械与战术系统公司","General Dynamics Ordnance and Tactical Systems"],
    ["通用动力信息技术公司","General Dynamics Information Technology"],
    ["通用动力任务系统公司","General Dynamics Mission Systems"]
  ].map(([name,nameEn],index)=>({
    id:`unreliable-2025-1-${index+1}`,name,nameEn,country:"美国",controlType:"unreliable_entity",date:"2025-01-02",
    notice:"不可靠实体清单工作机制公告2025年第1号",measure:"禁止从事与中国有关的进出口活动和在中国境内新增投资，并适用公告列明的人员措施。",
    source:"https://www.mofcom.gov.cn/cms_files/filemanager/policySummary/viewcore_02fa53a498c24b5e8070255b0928c6bf.html"
  })),
  ...[
    ["拉法特集团","Lafert S.p.A.","意大利"],["嘉耐特公司","Garnet S.r.l.","意大利"],
    ["辛德豪瑟材料有限公司","Sindlhauser Materials GmbH","德国"],["莱茵金属公司","Rheinmetall AG","德国"],
    ["安特拉科化工贸易有限公司","Antraco Chemie-Handelsgesellschaft mbH","德国"],
    ["InPACT公司","InPACT S.A.","法国"],["三五实验室","III-V LAB","法国"],["Cavok UAS公司","Cavok UAS","法国"],
    ["维戈尔光电公司","Vigo Photonics S.A.","波兰"],["弗罗茨瓦夫理工大学","Politechnika Wroclawska","波兰"],
    ["IHC公司","IHC Merwede Holding B.V.","荷兰"],["太脱拉卡车公司","TATRA TRUCKS a.s.","捷克"],
    ["Opticoelectron集团","Opticoelectron Group","保加利亚"],["Ekspla公司","Ekspla UAB","立陶宛"]
  ].map(([name,nameEn,country],index)=>({
    id:`control-2026-30-${index+1}`,name,nameEn,country,controlType:"control_list",date:"2026-07-24",
    notice:"商务部公告2026年第30号",measure:"禁止出口两用物项及转移、提供原产于中国的两用物项；特殊情形按公告申请。",
    source:"https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_2c9a32aa73bf4f5ea80ffa83e62fb259.html"
  }))
];
