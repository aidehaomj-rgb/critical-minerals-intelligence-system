import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = path.dirname(fileURLToPath(import.meta.url)) + path.sep;
const names = ["美国","墨西哥","墨西哥全港","巴拿马","哥斯达黎加","危地马拉","加拿大","洪都拉斯","尼加拉瓜","萨尔瓦多","阿根廷","智利","秘鲁","哥伦比亚","玻利维亚","委内瑞拉","委内瑞拉提单","巴拉圭","巴拉圭关单","乌拉圭","厄瓜多尔","巴西","巴西提单","巴西海运提单","巴西统计","俄罗斯","乌克兰","英国","欧盟","摩尔多瓦","德国","法国","波兰","孟加拉","巴基斯坦","巴基斯坦关单","印度全港","印度快版","印度孟买","韩国","中国台湾","越南","越南全港","哈萨克斯坦","日本","乌兹别克斯坦","菲律宾","菲律宾新版","斯里兰卡","印度尼西亚","泰国","土耳其","吉尔吉斯斯坦","埃塞俄比亚","乌干达","肯尼亚","利比里亚","莱索托","纳米比亚","科特迪瓦","尼日利亚","刚果民主共和国","加纳","津巴布韦","喀麦隆","乍得","中非","博茨瓦纳","坦桑尼亚","斐济","船运","独联体","环球提单"];
const imgs = ["US","MX","MX","PA","CR","GT","CA","HN","NI","SV","AR","CL","PE","CO","BO","VE","VE","PY","PY","UY","EC","BR","BR","BR","BR","RU","UA","GB","EU","MD","DE","FR","PL","BD","PK","PK","IN","IN","IN","KR","TW","VN","VN","KZ","JP","UZ","PH","PH","LK","ID","TH","TR","KG","ET","UG","KE","LR","LS","NA","CI","NG","CD","GH","ZW","CM","TD","CF","BW","TZ","FJ","transport","EN","GO"];
const ranges = ["2023-08-04|2026-08-04","2020-03-31|2023-03-31","2023-05-31|2026-05-31","2023-06-30|2026-06-30","2023-03-31|2026-03-31","2016-08-01|2019-08-01","2019-01-01|2022-01-01","2009-12-27|2012-12-27","2009-12-24|2012-12-24","2009-12-30|2012-12-30","2023-05-31|2026-05-31","2023-05-31|2026-05-31","2023-06-30|2026-06-30","2023-05-31|2026-05-31","2015-07-01|2018-07-01","2021-08-01|2024-08-01","2022-09-01|2025-09-01","2023-07-31|2026-07-31","2020-03-31|2023-03-31","2023-07-31|2026-07-31","2023-07-31|2026-07-31","2022-11-30|2025-11-30","2022-05-27|2025-05-27","2022-03-31|2025-03-31","2018-03-01|2021-03-01","2022-03-31|2025-03-31","2023-06-30|2026-06-30","2023-05-30|2026-05-30","2015-01-01|2018-01-01","2019-12-31|2022-12-31","2013-12-31|2016-12-31","2013-12-31|2016-12-31","2009-12-31|2012-12-31","2023-06-30|2026-06-30","2018-04-07|2021-04-07","2023-07-31|2026-07-31","2023-02-28|2026-02-28","2020-11-20|2023-11-20","2017-06-30|2020-06-30","2011-09-01|2014-09-01","|","2018-12-31|2021-12-31","2023-06-30|2026-06-30","2023-06-30|2026-06-30","2013-12-31|2016-12-31","2023-06-30|2026-06-30","2017-12-31|2020-12-31","2023-06-30|2026-06-30","2023-05-31|2026-05-31","2023-06-30|2026-06-30","2020-03-31|2023-03-31","2022-06-03|2025-06-03","2011-12-31|2014-12-31","2023-06-30|2026-06-30","2023-05-31|2026-05-31","2023-06-30|2026-06-30","2018-12-31|2021-12-31","2023-06-30|2026-06-30","2023-06-25|2026-06-25","2023-06-30|2026-06-30","2022-09-23|2025-09-23","2016-12-31|2019-12-31","2023-06-30|2026-06-30","2020-07-31|2023-07-31","2023-06-30|2026-06-30","2018-12-31|2021-12-31","2018-12-31|2021-12-31","2023-03-31|2026-03-31","2023-06-30|2026-06-30","2018-10-31|2021-10-31","2020-07-19|2023-07-19","2021-10-31|2024-10-31","2023-05-31|2026-05-31"];

function continent(i) { if(i<10)return"北美洲"; if(i<25)return"南美洲"; if(i<33)return"欧洲"; if(i<53)return"亚洲"; if(i<69)return"非洲"; if(i<70)return"大洋洲"; return"其他/综合"; }
function variant(n) { for (const v of ["海运提单","提单","关单","全港","快版","新版","孟买","统计"]) if(n.endsWith(v)) return v; return "标准库"; }
function base(n) { return n.replace(/海运提单|提单|关单|全港|快版|新版|孟买|统计$/u,""); }
const rows = names.map((n,i)=>{ const [a,b]=ranges[i].split("|"); const img=imgs[i]+(imgs[i]==="transport"?".png": ".png"); const url=`https://dd.data1688.com/custom/countrySearch?country=${encodeURIComponent(n)}&imgUrl=${encodeURIComponent(img)}&defaultType=0`; return [continent(i),n,base(n),variant(n),a?new Date(a+"T00:00:00Z"):null,b?new Date(b+"T00:00:00Z"):null,null,null,url,"2026-08-08 18:00 CST",b?"日期控件可读取":"页面未显示查询字段及日期控件"]; });

const wb = Workbook.create();
const sh = wb.worksheets.add("数据源最新日期");
sh.showGridLines = false;
sh.getRange("A1:K1").merge();
sh.getRange("A1").values=[["易讯数据各国家/数据源最新日期清单"]];
sh.getRange("A2:K2").merge();
sh.getRange("A2").values=[["口径：查询页日期选择器的默认可选范围；最新日期为该控件上限，不代表已逐条验证当日存在实际记录。查询日期：2026-08-08（北京时间）"]];
const headers=["洲别","数据源名称","基础国家/地区","数据版本","最早日期","最新日期","距查询日天数","时效分级","页面URL","查询时间","备注"];
sh.getRange("A4:K4").values=[headers];
sh.getRange(`A5:K${4+rows.length}`).values=rows;
sh.getRange("G5").formulas=[["=IF(F5=\"\",\"\",DATE(2026,8,8)-F5)"]];
sh.getRange(`G5:G${4+rows.length}`).fillDown();
sh.getRange("H5").formulas=[["=IF(G5=\"\",\"无法判定\",IF(G5<=120,\"近期\",IF(G5<=365,\"较新\",IF(G5<=1095,\"滞后\",\"严重滞后\"))))"]];
sh.getRange(`H5:H${4+rows.length}`).fillDown();
sh.getRange("A1:K1").format={fill:"#17365D",font:{bold:true,color:"#FFFFFF",size:16},verticalAlignment:"center"};
sh.getRange("A2:K2").format={fill:"#DCE6F1",font:{color:"#334155",italic:true,size:10},wrapText:true,verticalAlignment:"center"};
sh.getRange("A4:K4").format={fill:"#2F75B5",font:{bold:true,color:"#FFFFFF"},horizontalAlignment:"center",verticalAlignment:"center",borders:{preset:"outside",style:"thin",color:"#9FBAD0"}};
sh.getRange(`A5:K${4+rows.length}`).format={font:{size:10,color:"#1F2937"},verticalAlignment:"center",borders:{insideHorizontal:{style:"thin",color:"#E5E7EB"}}};
sh.getRange(`E5:F${4+rows.length}`).format.numberFormat="yyyy-mm-dd";
sh.getRange(`G5:G${4+rows.length}`).format.numberFormat="#,##0";
sh.getRange(`H5:H${4+rows.length}`).conditionalFormats.add("containsText",{text:"严重滞后",format:{fill:"#FECACA",font:{color:"#991B1B",bold:true}}});
sh.getRange(`H5:H${4+rows.length}`).conditionalFormats.add("containsText",{text:"近期",format:{fill:"#DCFCE7",font:{color:"#166534"}}});
sh.getRange(`H5:H${4+rows.length}`).conditionalFormats.add("containsText",{text:"无法判定",format:{fill:"#FEF3C7",font:{color:"#92400E"}}});
sh.freezePanes.freezeRows(4);
sh.tables.add(`A4:K${4+rows.length}`,true,"YixunLatestDates").style="TableStyleMedium2";
const widths=[10,18,16,12,13,13,14,12,56,20,28];
widths.forEach((w,i)=>sh.getRangeByIndexes(0,i,4+rows.length,1).format.columnWidth=w);
sh.getRange("A1:K1").format.rowHeight=30; sh.getRange("A2:K2").format.rowHeight=38; sh.getRange("A4:K4").format.rowHeight=26;

const summary=wb.worksheets.add("摘要"); summary.showGridLines=false;
summary.getRange("A1:F1").merge(); summary.getRange("A1").values=[["数据覆盖摘要"]];
summary.getRange("A3:B7").values=[["指标","数量"],["可选数据源",73],["已读取日期",72],["未显示日期",1],["含版本标签的数据源",16]];
summary.getRange("D3:F9").values=[["重点提示","普通库最新日","替代/新版最新日"],["墨西哥","2023-03-31","墨西哥全港 2026-05-31"],["巴拉圭","2026-07-31","巴拉圭关单 2023-03-31"],["巴基斯坦","2021-04-07","巴基斯坦关单 2026-07-31"],["印度","—","印度全港 2026-02-28"],["越南","2021-12-31","越南全港 2026-06-30"],["菲律宾","2020-12-31","菲律宾新版 2026-06-30"]];
summary.getRange("A1:F1").format={fill:"#17365D",font:{bold:true,color:"#FFFFFF",size:16}};
summary.getRange("A3:B3").format={fill:"#2F75B5",font:{bold:true,color:"#FFFFFF"}}; summary.getRange("D3:F3").format={fill:"#2F75B5",font:{bold:true,color:"#FFFFFF"}};
summary.getRange("A3:B7").format.borders={preset:"all",style:"thin",color:"#D1D5DB"}; summary.getRange("D3:F9").format.borders={preset:"all",style:"thin",color:"#D1D5DB"};
[18,14,3,18,18,28].forEach((w,i)=>summary.getRangeByIndexes(0,i,10,1).format.columnWidth=w);

await fs.mkdir(outputDir,{recursive:true});
const preview1=await wb.render({sheetName:"数据源最新日期",range:"A1:K18",scale:1,format:"png"}); await fs.writeFile(outputDir+"preview_data.png",new Uint8Array(await preview1.arrayBuffer()));
const preview2=await wb.render({sheetName:"摘要",range:"A1:F10",scale:1.5,format:"png"}); await fs.writeFile(outputDir+"preview_summary.png",new Uint8Array(await preview2.arrayBuffer()));
const xlsx=await SpreadsheetFile.exportXlsx(wb); await xlsx.save(outputDir+"易讯数据_各国家数据源最新日期_20260808.xlsx");
const esc=v=>`"${String(v??"").replaceAll('"','""')}"`;
const csv=[headers,...rows.map((r,i)=>[...r.slice(0,6).map(v=>v instanceof Date?v.toISOString().slice(0,10):v),"", "",...r.slice(8)])].map(r=>r.map(esc).join(",")).join("\r\n");
await fs.writeFile(outputDir+"易讯数据_各国家数据源最新日期_20260808.csv","\uFEFF"+csv,"utf8");
const inspect=await wb.inspect({kind:"table",range:"数据源最新日期!A1:K12",include:"values,formulas",tableMaxRows:12,tableMaxCols:11}); console.log(inspect.ndjson);
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"final formula error scan"}); console.log(errors.ndjson);
