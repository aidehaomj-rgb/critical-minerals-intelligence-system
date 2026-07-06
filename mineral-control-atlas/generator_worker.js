const fs = require("fs");
const path = require("path");
const root = "C:/Users/59809/Documents/关键矿产/mineral-control-atlas";
const pendingFile = path.join(root, "pending_gen.json");
const resultFile = path.join(root, "gen_report_data.json");

function generateReport(data) {
  var now = new Date();
  var date = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0");
  var fmt = data.fmt || "报告";
  var prompt = data.prompt || "";
  var id = "gen-" + now.getTime();
  
  var findings = [];
  if (fmt.indexOf("要情") >= 0) {
    findings = [
      {num:"01", title:"动态摘要", desc:"根据用户输入的分析需求，对相关矿产出口管制最新动态进行梳理。"},
      {num:"02", title:"关键判断", desc:"结合政策连续性和供应链现状，对趋势演变提出研判意见。"},
      {num:"03", title:"监管提示", desc:"针对物项识别、转口风险和最终用户审查提出具体监管要点。"}
    ];
  } else if (fmt.indexOf("呈报") >= 0) {
    findings = [
      {num:"01", title:"综合态势", desc:"整合多源信息，对关键矿产管制与反管制最新形势进行综合分析。"},
      {num:"02", title:"影响评估", desc:"评估政策变化对我国供应链安全、产业竞争和海关监管的具体影响。"},
      {num:"03", title:"对策建议", desc:"从法律、技术、合作和人才培养四个维度提出综合性应对建议。"}
    ];
  } else {
    findings = [
      {num:"01", title:"研究背景", desc:"围绕用户提出的研究方向，系统梳理相关政策演变和产业动态。"},
      {num:"02", title:"深度分析", desc:"采用多维度分析框架，对政策工具、供应链瓶颈和监管挑战进行深入研究。"},
      {num:"03", title:"结论与建议", desc:"形成具有操作性的研究结论和政策建议，支持决策参考。"}
    ];
  }
  
  var name = fmt + " - " + (prompt.length > 30 ? prompt.substring(0,30) + "..." : prompt);
  
  var report = {
    id: id,
    name: name,
    fileName: fmt + ".docx",
    path: "",
    type: "document",
    date: date,
    size: "—",
    summary: "基于提示词\"" + prompt + "\"自动生成的" + fmt + "，内容涵盖最新动态分析和专业研判。",
    authors: "AI生成",
    tags: [fmt],
    findings: findings
  };
  
  fs.writeFileSync(resultFile, JSON.stringify(report, null, 2), "utf-8");
  fs.unlinkSync(pendingFile);
  console.log("[" + new Date().toISOString() + "] 已生成: " + name);
}

console.log("生成监控器已启动...");
function check() {
  try {
    if (fs.existsSync(pendingFile)) {
      var content = fs.readFileSync(pendingFile, "utf-8");
      var data = JSON.parse(content);
      generateReport(data);
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
  setTimeout(check, 2000);
}
check();
