const http = require("http");
const fs = require("fs");
const path = require("path");
const host = "127.0.0.1";
const port = 8765;
const root = __dirname;
const contentTypes = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server = http.createServer((request,response)=>{
  const p = decodeURIComponent(new URL(request.url,"http://"+host).pathname);
  const r = p==="/"?"index.html":p.replace(/^\//,"");
  const f = path.resolve(root,r);
  if(f!==root&&!f.startsWith(root+path.sep)){response.writeHead(403);response.end("Forbidden");return;}
  fs.stat(f,(e,s)=>{if(e||!s.isFile()){response.writeHead(404);response.end("Not Found");return;}
    response.writeHead(200,{"Content-Type":contentTypes[path.extname(f).toLowerCase()]||"application/octet-stream","Cache-Control":"no-cache"});
    fs.createReadStream(f).pipe(response);
  });
});
server.listen(port,host,()=>{console.log("关键矿产清单已启动：http://"+host+":"+port+"/#/export-controls");});
server.on("error",error=>{if(error.code==="EADDRINUSE")process.exit(0);throw error;});
