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
  }))
];
