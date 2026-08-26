import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const date = "2026-07-31";
const commonNote = "截至采集日，以品牌中文名、外文名及“假洋牌/处罚/通报/曝光”组合检索，未发现监管机关或主流媒体已公开点名；该结论仅代表公开网络检索结果。";
const candidates = [
  ["小家电","奥劲","AOJING","德国","公开店铺称“德国奥劲公司/德国汉诺威”，未取得可对应德国公司登记号","中山市骐韬电子有限公司（店铺介绍自述研发、生产、销售主体）","广东中山","京东奥劲官方旗舰店","“享誉全球的德国品牌”“2009年诞生于汉诺威”“德国设计师研发”“风靡欧美”","R2无可核德国官网；R3无匹配德国社媒；R4德国主流渠道难检；R5德国法人不透明；R8中国公司研发生产","5","A",
   "https://mall.jd.com/introduction-190000.html","https://www.phb123.com/pinpai/pp171626.html","https://www.amazon.de/s?k=AOJING"],
  ["小家电","飒望","RASW","德国","未发现与家电业务匹配的德国RASW法人；德国同名主体为安全培训机构Rheinische Akademie für Sicherheit und Wirtschaft GmbH（HRB 82623）","京东店铺资质主体待调取","中国大陆（商品铭牌待固证）","京东RASW旗舰店","“德国品牌”“德国旗舰”“热销NO.1”","R2无家电品牌官网；R3无德国社媒；R4德国主流家电渠道难检；R5同名德国公司业务不相干；R8中国电商专供特征","5","A",
   "https://item.jd.com/10199827289664.html","https://www.rasw-akademie.de/impressum","https://de.linkedin.com/company/rasw-akademie"],
  ["小家电","JCZS","JCZS","德国","未发现可对应德国企业或德国商标权利主体","京东JCZS环境电器/智能家居旗舰店资质主体待调取","中国大陆（具体工厂待铭牌）","京东JCZS环境电器旗舰店、智能家居旗舰店","从“德国品牌”水质笔、破壁机扩展至学步车、收纳、园艺、家具等","R2无境外官网；R3无德国社媒；R4德国渠道难检；R5境外主体不透明；R11跨数十品类快速铺货","5","A",
   "https://mall.jd.com/index-16651053.html","https://i-search.jd.com/search?enc=utf-8&ev=878_252668%5Eexbrand_JCZS%5E&keyword=%E6%A3%80%E6%B5%8B%E7%AC%94","https://www.amazon.de/s?k=JCZS"],
  ["小家电","班贝特","BAMBETEL","德国","德国商标号3020211194683；权利人Quanzhou Yongchun County Yunlu Trading Co., Ltd.（泉州永春县云路贸易公司）","泉州永春县云路贸易有限公司；京东店铺主体待核","中国大陆","京东Bambetel旗舰店","“德国品牌”“德国品质”厨房电器","R1德国商标2021年新注册；R4德国渠道中同名结果为乌克兰家具品牌；R5德国商标权利人为中国公司；R8中国供应链；R10存在同名品牌混淆风险","5","A",
   "https://tmdb.eu/marke/DE-3020211194683%3A%3Abambetel-ltd-quanzhou-yongchun-county-yunlu-trading-co.html","https://mall.jd.com/introduction-11668399.html","https://www.linkedin.com/company/bambetel"],
  ["小家电","趣活秀","QUASHO","日本","未发现可对应日本家电法人/法人番号","京东销售店主体待调取","中国大陆（商品铭牌待核）","京东在售页面","“日本品牌”“日本低糖电饭煲”“316L球釜”","R2无日本官网；R3无日本社媒；R4日本Amazon/乐天难检；R5日本主体不透明；R8中国电商专供SKU特征","5","B",
   "https://www.jd.com/jiage/737743c6d5822c2ad83.html","https://www.amazon.co.jp/s?k=QUASHO","https://search.rakuten.co.jp/search/mall/QUASHO/"],

  ["保健品","维卡瑞","VICARING","美国","VICARING TRADING CO., LIMITED；Washington Document No. 605259016；USPTO 7661400","境内店铺/进口商主体待资质页核验","美国主体注册地址100 N Howard St Ste R, Spokane（7295家主体共址）；实际生产地按SKU待核","京东自营/品牌店","“美国品牌儿童DHA”“美国进口”","R1美国公司2023成立、商标2024申请后快速营销；R3美国社媒弱；R4美国主流零售存在感弱；R5数千公司共址注册代理地址；R6负责人You Yu且核心市场在中国","5","A",
   "https://www.trademarkelite.com/trademark/trademark-detail/98511522/VICARING","https://www.bizprofile.net/wa/spokane/vicaring-trading-co-limited","https://www.jd.com/brand/132027fb43dfc81d780e.html"],
  ["保健品","AOBX","AOBX","美国","未发现可稳定对应的美国营养品经营主体/注册号","京东AOBX营养保健自营旗舰店供货主体待核","商品详情/中文标签待固证","京东自营旗舰店","“美国品牌儿童DHA”“美国进口品牌戒烟片”","R2无美国官网；R3无美国社媒；R4美国主流渠道难检；R5美国主体不透明；R11短期覆盖DHA、阻断片、戒烟片等差异巨大SKU","5","A",
   "https://www.jd.com/jiage/131932b7d89f69f490c2.html","https://www.jd.com/brand/13765a59dda405b1536c0.html","https://software-repository.com/page/jd/detail/7511V418uHE1EuISJaTTA8VR_3vbTPlkLpuZ4szxJle.html"],
  ["保健品","FOCOOE","FOCOOE","海外/进口形象（具体国家表达待固证）","未发现可对应的稳定境外经营主体","京东供货/店铺主体待核","中国大陆可能性高，需调商品中文标签","京东自营在售","儿童DHA、神经酸、专注力等功能性表达","R2无境外官网；R3无境外社媒；R4海外主流渠道难检；R5境外主体不透明；R11多功能概念快速组合","5","B",
   "https://www.jd.com/jiage/9192533f4e82b998e6c9.html?electedExtAttrSet=4085%2C&extAttrValue=expand_name%2C%4071697%3A%3A4085&sort_type=sort_default","https://www.amazon.com/s?k=FOCOOE","https://www.google.com/search?q=%22FOCOOE%22+company"],
  ["保健品","艾赫欧格勒","AEHEOGLER","德国","德国商标号3020252303185；申请人Guangdong Fanle Health Industry Development Co., Ltd.","广东泛乐健康产业发展有限公司","中国大陆（具体工厂待标签）","京东自营在售","外文品牌、儿童神经酸/磷脂酰丝氨酸/DHA组合","R1德国商标2025-07才申请；R3德国无匹配社媒；R4德国零售难检；R5德国商标申请人为广东公司；R8生产运营指向中国","5","A",
   "https://tmdb.eu/marke/DE-3020252303185%3A%3Aaeheogler-ltd-guangdong-fanle-health-industry-development-co.html","https://www.jd.com/jiage/9192533f4e82b998e6c9.html?electedExtAttrSet=4085%2C&extAttrValue=expand_name%2C%4071697%3A%3A4085&sort_type=sort_default","https://www.amazon.de/s?k=AEHEOGLER"],
  ["保健品","思凯优","Skyoo","美国","未发现与营养品宣传规模匹配的美国主体/注册号","京东供货主体待核","产品中文标签待固证","京东在售","“美国品牌进口神经酸脑力素”“100%原装官方正品”","R2无美国官网；R3无美国社媒；R4美国主流渠道难检；R5美国主体不透明；R9“增强记忆/认知”等功效表达需核合规资质","5","B",
   "https://www.jd.com/jiage/131934cd60a96c7e49c9.html?catID=39265&electedExtAttrSet=&extAttrValue=expand_name%2C&sort_type=sort_default","https://www.amazon.com/s?k=Skyoo+supplement","https://www.google.com/search?q=%22Skyoo%22+supplement+company"],

  ["美妆个护","海优艾勒","HIEUAILR","德国","Hieuailr International Trading Limited；香港公司注册记录可查；2025年申请英国商标，非德国主体","京东自营旗舰店供货主体待核","中国供应链（Joom页面显示中国发货）","京东HIEUAILR个人护理自营旗舰店","“德国进口品牌”“德国抗皱”“德国品牌洗发水/香皂”","R1英国商标2025才申请；R3德国无官方社媒；R4德国零售难检；R5境外主体为香港贸易公司且非德国；R8海外平台显示中国发货","5","A",
   "https://mall.jd.com/index-1000495562.html","https://www.ipo.gov.uk/t-tmj/tm-journals/2025-030/jnl.pdf","https://www.joom.com/it/search/c.1597236132294941873-29-2-2-3277201823/f.brand.tree.68c31899a76f3ba313a50674"],
  ["美妆个护","悠果","YUGO","日本","未发现对应日本化妆品/洗护法人；相关美国申请人Xian Ming Dong并主张中国优先申请号86762515","境内商标/店铺主体待核","中国大陆（具体工厂待备案/标签）","京东在售","“日本品牌洗发水”“日本鱼子酱洗发水”“72小时留香”","R1相关商标2025申请；R2无日文官网；R3无日本社媒；R4日本渠道难检；R6申请人为华人姓名且优先权来自中国；R8中国供应链待证","6","A",
   "https://trademarks.justia.com/994/52/yugo-asian-99452016.html","https://www.jd.com/brand/1620b94a4e41656f69e4.html?electedExtAttrSet=18785%2C&extAttrValue=expand_name%2C%40104088%3A%3A18785&sort_type=sort_redissale_desc","https://www.amazon.co.jp/s?k=YUGO+%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC"],
  ["美妆个护","姿悦欧","ZYUO","日本","未发现对应日本洗护法人/法人番号","境内店铺与商标主体待核","中国大陆（商品标签待固证）","京东在售","“日本洗发水”“日本品牌煤焦油洗发水”“全网热销100W+”","R2无日文官网；R3无日本社媒；R4日本Amazon/乐天难检；R5日本主体不透明；R11短期覆盖洗护、干发喷雾等多SKU","5","B",
   "https://www.jd.com/brand/1620b94a4e41656f69e4.html","https://www.jd.com/hotitem/16750b9d998c041cf27d9.html?catID=16770&electedExtAttrSet=&extAttrValue=expand_name%2C&sort_type=sort_default","https://www.amazon.co.jp/s?k=ZYUO"],
  ["美妆个护","纽拉德","NULAD","瑞士","瑞士商标IGE 781894；权利人HORIS INTERNATIONAL TRADING CO., LIMITED（香港地址，国家标记CN）；中国3类商标申请人陈少雄（广东梅州）","陈少雄/相关境内运营主体待核","中国供应链待备案页核验","京东在售","“瑞士品牌”“瑞士进口377睡眠面膜”","R1瑞士商标2022申请、中国商标2024申请；R3瑞士无官方社媒；R4瑞士主流渠道难检；R5瑞士商标权利人为香港贸易公司；R6中国商标为广东自然人","5","A",
   "https://www.markenmeldungen.ch/marke.cfm?id=781894&marke=NULAD","https://tm.aliyun.com/detail/a55c_82454752_3","https://www.jd.com/brand/13191f4a6f510fc4a3d6.html"],
  ["美妆个护","蓝纹","Bluetex","德国","未发现与洗护业务匹配的德国法人/注册号","京东销售主体待核","中国大陆（化妆品备案人/工厂待核）","京东在售","“德国品牌男士香水植萃洗发水”“德国品牌”","R2无德文官网；R3无德国社媒；R4德国渠道难检；R5德国主体不透明；R8中国电商专供特征","5","B",
   "https://www.jd.com/phb/key_1316cc45b78a0951e85d.html","https://www.jd.com/chanpin/1215994.html","https://www.amazon.de/s?k=Bluetex+Shampoo"],

  ["母婴产品","楚海姆","TRUHEIM","法国","未发现可对应法国儿童护肤品牌法人/SIREN","境内商标、备案人及店铺主体待核","中国大陆（儿童化妆品备案页待固证）","京东在售","“法国品牌儿童面膜/防晒”“专为儿童肤质研发”","R2无法文官网；R3无法国社媒；R4法国药妆/电商渠道难检；R5法国主体不透明；R8中国儿童化妆品备案链待核","5","A",
   "https://www.jd.com/brand/1319a72a23f34c039d76.html","https://www.jd.com/xinghao/1316605a2c0d38751bd5.html","https://www.amazon.fr/s?k=TRUHEIM+enfant"],
  ["母婴产品","煦凛","XULIN（包装外文待实物确认）","日本","未发现对应日本婴童护理法人/法人番号","境内品牌及备案主体待核","中国大陆（备案/标签待核）","京东在售","“日本品牌婴儿按摩油”“新生儿宝宝舒缓润肤”","R2无日文官网；R3无日本社媒；R4日本渠道难检；R5日本主体不透明；R8中国电商专供特征","5","B",
   "https://www.jd.com/brand/1319125e969d49d06db8.html","https://www.amazon.co.jp/s?k=XULIN+%E3%83%99%E3%83%93%E3%83%BC%E3%82%AA%E3%82%A4%E3%83%AB","https://search.rakuten.co.jp/search/mall/XULIN/"],
  ["母婴产品","堡贝星","KNUT ELGVIN","北欧/欧洲形象（具体国籍宣称待固证）","未发现同名欧洲儿童护肤法人","境内官方店/备案主体待核","中国大陆（化妆品备案待核）","京东官方品牌店","外文人名式品牌、儿童精华霜、舒缓泛红等","R2无境外官网；R3无境外社媒；R4欧洲主流渠道难检；R5境外主体不透明；R8中国电商专供SKU","5","B",
   "https://www.jd.com/xinkuan/1319a585fd26822f4ae5.html","https://www.google.com/search?q=%22KNUT+ELGVIN%22+skincare","https://www.amazon.de/s?k=%22KNUT+ELGVIN%22"],
  ["母婴产品","乐可温","LUCKWOON","海外/英文品牌形象（店铺具体国籍表述待截图）","未发现可对应境外婴童护肤经营主体","境内备案人/店铺主体待核","中国大陆（备案页待核）","京东在售","儿童专用水感防晒、英文品牌包装","R2无境外官网；R3无境外社媒；R4海外渠道难检；R5境外主体不透明；R8中国儿童化妆品备案链待核","5","C",
   "https://www.jd.com/brand/1319a72a23f34c039d76.html","https://www.amazon.com/s?k=LUCKWOON+sunscreen","https://www.google.com/search?q=%22LUCKWOON%22+company"],
  ["母婴产品","艾露琪","AILUKI","日本","未发现对应日本婴童/个人护理法人","境内店铺及备案主体待核","中国大陆（商品备案/标签待核）","京东在售","“日本游泳专用去氯洗发沐浴露”“日本男士洗发水”，并延伸儿童/家庭场景","R2无日文官网；R3无日本社媒；R4日本渠道难检；R5日本主体不透明；R11跨人群、跨用途快速铺SKU","5","C",
   "https://www.jd.com/brand/1620b94a4e41656f69e4.html?electedExtAttrSet=18785%2C&extAttrValue=expand_name%2C%40104088%3A%3A18785&sort_type=sort_redissale_desc","https://www.amazon.co.jp/s?k=AILUKI+%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC","https://search.rakuten.co.jp/search/mall/AILUKI/"]
];

const headers = ["品牌中文名","品牌外文名","声称来源国","境外主体/商标核验","境内关联主体","实际生产地","当前销售渠道","典型宣传话术","风险特征","风险数","线索等级","既有打击/报道排除检索","证据1","证据2","证据3","采集日期","建议下一步固证"];
const wb = Workbook.create();
const intro = wb.worksheets.add("说明与分级");
for (const s of ["保健品","美妆个护","母婴产品","小家电"]) wb.worksheets.add(s);
const idx = wb.worksheets.add("证据索引");

intro.getRange("A1:H1").merge();
intro.getRange("A1").values=[["“假洋牌”新线索发现清单（排除已公开打击案例）"]];
intro.getRange("A2:H2").merge();
intro.getRange("A2").values=[[`采集日期：${date}｜20个在售新候选｜仅供进一步调查固证，不构成违法认定`]];
intro.getRange("A4:B9").values=[
  ["项目","结果"],["候选数",candidates.length],["A级（优先固证）",candidates.filter(x=>x[11]==="A").length],
  ["B级（补充主体/标签）",candidates.filter(x=>x[11]==="B").length],["C级（观察线索）",candidates.filter(x=>x[11]==="C").length],
  ["已公开打击案例",0]
];
intro.getRange("A11:H17").values=[
  ["分级","判定口径","","","","","",""],
  ["A","出现境外官方商标/公司记录与中国权利人、共址代理或来源国错位等强矛盾，且电商宣传仍明确使用外国品牌话术。","","","","","",""],
  ["B","境外主体、官网、社媒和来源国销售均难核，国内平台持续在售；需取得店铺资质页、实物标签后升级。","","","","","",""],
  ["C","具备多个异常信号，但外国国籍宣传或主体链尚未完成截图固证，暂不建议对外点名。","","","","","",""],
  ["排除规则","已被监管、公安、央视及主流财经/消费媒体集中点名的品牌全部排除；真实海外品牌仅因中国代工不纳入。","","","","","",""],
  ["证据规则","A级至少包含电商原始宣传+境外商标/公司记录+来源国渠道反查；“搜索不到”仅作辅助，不单独定性。","","","","","",""],
  ["法律边界","本表称“嫌疑/新线索”，不称“造假”；对外发布前必须完成页面截图、公证、样品购买、标签与报关/授权核验。","","","","","",""]
];

for (const sector of ["保健品","美妆个护","母婴产品","小家电"]) {
  const sh=wb.worksheets.getItem(sector);
  const data=candidates.filter(x=>x[0]===sector).map(x=>[...x.slice(1,11),x[11],commonNote,x[12],x[13],x[14],date,
    x[11]==="A"?"优先：购买样品，固证包装/中文标签；调店铺营业执照与商标授权；向声称来源国登记机关取档。":
    x[11]==="B"?"补强：调取店铺资质、化妆品/食品备案、生产许可证及商标申请人；完成来源国本地语言检索。":
    "观察：先截图固化外国国籍宣传，再核对备案人与实际工厂，证据不足前不对外点名。"]);
  sh.getRangeByIndexes(0,0,1,headers.length).values=[headers];
  sh.getRangeByIndexes(1,0,data.length,headers.length).values=data;
  const t=sh.tables.add(`A1:Q${data.length+1}`,true,`${sector.replace(/[^\w]/g,"")}NewTable`);
  t.style="TableStyleMedium4"; t.showFilterButton=true;
  sh.freezePanes.freezeRows(1); sh.freezePanes.freezeColumns(2); sh.showGridLines=false;
  sh.getRange(`A1:Q${data.length+1}`).format.wrapText=true;
  sh.getRange(`A2:Q${data.length+1}`).format.verticalAlignment="top";
  [16,18,14,42,34,28,26,40,48,10,12,46,48,48,48,14,48].forEach((w,i)=>sh.getRangeByIndexes(0,i,data.length+1,1).format.columnWidth=w);
  sh.getRange("1:1").format.rowHeight=44; sh.getRange(`2:${data.length+1}`).format.rowHeight=118;
  sh.getRange(`K2:K${data.length+1}`).conditionalFormats.add("containsText",{text:"A",format:{fill:"#FDE2E1",font:{color:"#B42318",bold:true}}});
  sh.getRange(`K2:K${data.length+1}`).conditionalFormats.add("containsText",{text:"B",format:{fill:"#FFF1CC",font:{color:"#7A4E00",bold:true}}});
  sh.getRange(`K2:K${data.length+1}`).conditionalFormats.add("containsText",{text:"C",format:{fill:"#E8EEF5",font:{color:"#344054",bold:true}}});
}

idx.getRange("A1:F1").values=[["品牌","行业","证据序号","URL","证据用途","采集日期"]];
const er=[];
for(const x of candidates) [x[12],x[13],x[14]].forEach((u,i)=>er.push([`${x[1]} / ${x[2]}`,x[0],i+1,u,i===0?"境外登记/电商主证":i===1?"交叉证据":"来源国渠道反查",date]));
idx.getRangeByIndexes(1,0,er.length,6).values=er;
const it=idx.tables.add(`A1:F${er.length+1}`,true,"NovelEvidenceTable"); it.style="TableStyleMedium4";
idx.freezePanes.freezeRows(1); idx.showGridLines=false; idx.getRange(`A1:F${er.length+1}`).format.wrapText=true;
[26,14,10,72,24,14].forEach((w,i)=>idx.getRangeByIndexes(0,i,er.length+1,1).format.columnWidth=w);
idx.getRange(`2:${er.length+1}`).format.rowHeight=38;

intro.showGridLines=false; intro.freezePanes.freezeRows(2);
intro.getRange("A1:H1").format={fill:"#193B3A",font:{bold:true,color:"#FFFFFF",size:17},horizontalAlignment:"center"};
intro.getRange("A2:H2").format={fill:"#DCEBE8",font:{italic:true,color:"#193B3A"},horizontalAlignment:"center"};
intro.getRange("A4:B4").format={fill:"#2D6A62",font:{bold:true,color:"#FFFFFF"}};
intro.getRange("A11:H11").format={fill:"#2D6A62",font:{bold:true,color:"#FFFFFF"}};
intro.getRange("A11:H17").format.wrapText=true;
intro.getRange("A:A").format.columnWidth=22; intro.getRange("B:B").format.columnWidth=92;
intro.getRange("1:2").format.rowHeight=28; intro.getRange("12:17").format.rowHeight=44;

const out="C:/Users/59809/Documents/关键矿产/outputs/fake_foreign_brand_20";
for(const s of ["说明与分级","保健品","美妆个护","母婴产品","小家电","证据索引"]){
  const p=await wb.render({sheetName:s,autoCrop:"all",scale:0.8,format:"png"});
  await fs.writeFile(`${out}/novel_preview_${s}.png`,new Uint8Array(await p.arrayBuffer()));
}
console.log((await wb.inspect({kind:"table",range:"说明与分级!A1:H17",include:"values,formulas",tableMaxRows:20,tableMaxCols:8})).ndjson);
console.log((await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"errors"})).ndjson);
const f=await SpreadsheetFile.exportXlsx(wb);
await f.save(`${out}/假洋牌新线索_未公开打击候选20个_2026-07-31.xlsx`);
console.log("EXPORTED");
