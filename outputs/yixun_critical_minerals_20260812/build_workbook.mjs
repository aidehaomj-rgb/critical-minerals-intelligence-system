import fs from 'node:fs/promises';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const OUT='C:/Users/59809/Documents/关键矿产/outputs/yixun_critical_minerals_20260812';
const rows=JSON.parse(await fs.readFile(`${OUT}/analysis_rows.json`,'utf8'));
const sums=JSON.parse(await fs.readFile(`${OUT}/analysis_summary.json`,'utf8'));
const wb=Workbook.create();
const dash=wb.worksheets.add('总览');
const summary=wb.worksheets.add('矿种汇总');
const detail=wb.worksheets.add('逐条分析');
const rules=wb.worksheets.add('研判说明');
for(const s of [dash,summary,detail,rules]) s.showGridLines=false;

const navy='#071A2F', blue='#0B6EBD', cyan='#19B5FE', pale='#EAF4FB', line='#C7D6E4';
dash.mergeCells('A1:H2');dash.getRange('A1').values=[['关键矿产第三国绕道风险分析总览']];
dash.getRange('A1:H2').format={fill:navy,font:{bold:true,color:'#FFFFFF',size:20},verticalAlignment:'center',horizontalAlignment:'center'};
dash.getRange('A4:H4').values=[['检索矿种','逐条审阅','高优先','中优先','监测','排除','数据来源','查询日期']];
dash.getRange('A4:H4').format={fill:blue,font:{bold:true,color:'#FFFFFF'},horizontalAlignment:'center'};
const counts={};for(const r of rows) counts[r.风险等级]=(counts[r.风险等级]||0)+1;
dash.getRange('A5:H5').values=[[26,rows.length,counts['高']||0,counts['中']||0,counts['监测']||0,counts['排除']||0,'易迅数据页面逐页查看','2026-08-12']];
dash.getRange('A5:H5').format={fill:pale,font:{bold:true,color:navy},horizontalAlignment:'center'};
dash.getRange('A8:G8').values=[['矿种','总命中数','逐条审阅数','高','中','监测','覆盖范围']];
dash.getRange('A9:G34').values=sums.map(x=>[x.矿种,x.总命中数,x.逐条审阅数,x.高,x.中,x.监测,x.覆盖范围]);
dash.getRange('A8:G34').format.borders={preset:'inside',style:'thin',color:line};dash.getRange('A8:G8').format={fill:blue,font:{bold:true,color:'#FFFFFF'}};
dash.freezePanes.freezeRows(4);dash.getRange('A:H').format.columnWidth=16;dash.getRange('G:G').format.columnWidth=30;
const chart=dash.charts.add('bar',dash.getRange('A8:F34'));chart.title='各矿种审阅量与核查优先级';chart.hasLegend=true;chart.setPosition('J4','S23');

const sh=['矿种','检索词','总命中数','逐条审阅数','覆盖范围','政策状态','高','中','低','监测','排除','主要目的地','初步结论'];
summary.getRange(`A1:M${sums.length+1}`).values=[sh,...sums.map(x=>sh.map(k=>x[k]??''))];
summary.getRange('A1:M1').format={fill:navy,font:{bold:true,color:'#FFFFFF'}};summary.freezePanes.freezeRows(1);summary.getRange('A:M').format.columnWidth=15;summary.getRange('B:B').format.columnWidth=33;summary.getRange('E:E').format.columnWidth=28;summary.getRange('L:M').format.columnWidth=38;summary.getRange('A1:M27').format.wrapText=true;
summary.getRange('G2:G27').conditionalFormats.add('colorScale',{colors:['#E8F5E9','#FFC107','#D32F2F'],thresholds:['min','50%','max']});

const dh=['序号','矿种','数据源','进出口','日期','HS编码','商品描述','采购商','供应商','重量','数量','金额','目的国/地区','原产国/地区','物项相关性','政策状态','中转节点','主体特征','申报信息完整性','风险等级','第三国绕道判断','主要依据','重复/镜像提示','反向因素','建议动作'];
detail.getRangeByIndexes(0,0,rows.length+1,dh.length).values=[dh,...rows.map(x=>dh.map(k=>x[k]??''))];
detail.getRange(`A1:Y1`).format={fill:navy,font:{bold:true,color:'#FFFFFF'}};detail.freezePanes.freezeRows(1);detail.freezePanes.freezeColumns(2);detail.getRange('A:Y').format.columnWidth=14;detail.getRange('G:I').format.columnWidth=34;detail.getRange('U:Y').format.columnWidth=36;detail.getRange(`A1:Y${rows.length+1}`).format.wrapText=true;
detail.getRange(`T2:T${rows.length+1}`).conditionalFormats.add('containsText',{text:'高',format:{fill:'#F8D7DA',font:{color:'#B71C1C',bold:true}}});
detail.getRange(`T2:T${rows.length+1}`).conditionalFormats.add('containsText',{text:'中',format:{fill:'#FFF3CD',font:{color:'#7A4E00'}}});
detail.getRange(`T2:T${rows.length+1}`).conditionalFormats.add('containsText',{text:'排除',format:{fill:'#E2E3E5',font:{color:'#555555'}}});

rules.getRange('A1:F1').merge();rules.getRange('A1').values=[['研判口径与限制']];rules.getRange('A1:F1').format={fill:navy,font:{bold:true,color:'#FFFFFF',size:18}};
rules.getRange('A3:B12').values=[
 ['项目','说明'],['数据获取','仅通过易迅数据网页逐页查看，未使用下载/导出功能。'],['时间范围','页面“本年度”：2026-01-01至2026-08-06。'],['原产地','筛选标签明确选择 CHINA。'],['风险等级','高/中仅表示核查优先级，不等于违法或走私事实。'],['绕道判断','单一中国→第三国记录只构成第一程候选；确认绕道需再匹配后续再出口、主体、单证或集装箱。'],['暂停物项','暂停执行窗口内仅作供应链监测，不按未许可违规判断。'],['重复记录','商业数据库可能存在镜像、重复采集或同票多行，结果不等同于独立出口票数。'],['超大结果集','钨、磷酸铁锂、人造金刚石微粉按页面逐页/最大页容量查看，覆盖范围在矿种汇总中披露。'],['数据来源页面','https://dd.data1688.com/custom/search']];
rules.getRange('A3:B3').format={fill:blue,font:{bold:true,color:'#FFFFFF'}};rules.getRange('A:B').format.columnWidth=28;rules.getRange('B:B').format.columnWidth=90;rules.getRange('A3:B12').format.wrapText=true;

await fs.mkdir(OUT,{recursive:true});const file=await SpreadsheetFile.exportXlsx(wb);await file.save(`${OUT}/关键矿产易迅数据第三国绕道风险逐条分析.xlsx`);
const p1=await wb.render({sheetName:'总览',range:'A1:S34',scale:1,format:'png'});await fs.writeFile(`${OUT}/workbook_overview.png`,new Uint8Array(await p1.arrayBuffer()));
const p2=await wb.render({sheetName:'逐条分析',range:'A1:Y18',scale:0.8,format:'png'});await fs.writeFile(`${OUT}/workbook_detail.png`,new Uint8Array(await p2.arrayBuffer()));
console.log(JSON.stringify({rows:rows.length,file:`${OUT}/关键矿产易迅数据第三国绕道风险逐条分析.xlsx`}));
