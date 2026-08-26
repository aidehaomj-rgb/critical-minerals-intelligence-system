const http = require("http");
const fs = require("fs");
const path = require("path");
// Listen on every local interface so other devices on the same LAN can open
// the dashboard. The collector and Ollama remain loopback-only and are
// reached through this same-origin proxy.
const host = process.env.MINERAL_HOST || "0.0.0.0";
const port = 8765;
const root = __dirname;
const contentTypes = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server = http.createServer((request,response)=>{
  const p = decodeURIComponent(new URL(request.url,"http://"+host).pathname);
  // Keep Ollama calls on the same origin. This avoids browser CORS issues and
  // never persists credentials: the local Ollama service owns its model login.
  if(p.startsWith("/_ollama-api/")){
    const targetPath=request.url.replace(/^\/_ollama-api/,"");
    const proxy=http.request({host:"127.0.0.1",port:11434,path:targetPath,method:request.method,headers:{...request.headers,host:"127.0.0.1:11434"}},upstream=>{
      response.writeHead(upstream.statusCode||502,upstream.headers);
      upstream.pipe(response);
    });
    proxy.on("error",()=>{response.writeHead(502,{"Content-Type":"application/json; charset=utf-8"});response.end(JSON.stringify({error:"Ollama 服务未启动，请先运行 Ollama"}));});
    request.pipe(proxy);
    return;
  }
  // The dashboard calls its dedicated collection backend through the same
  // local origin, so browser calls never need cross-origin configuration.
  if(p.startsWith("/_mineral-api/")){
    const targetPath=request.url.replace(/^\/_mineral-api/,"");
    const proxy=http.request({host:"127.0.0.1",port:8110,path:targetPath,method:request.method,headers:{...request.headers,host:"127.0.0.1:8110"}},upstream=>{
      response.writeHead(upstream.statusCode||502,upstream.headers);
      upstream.pipe(response);
    });
    proxy.on("error",()=>{response.writeHead(502,{"Content-Type":"application/json; charset=utf-8"});response.end(JSON.stringify({detail:"关键矿产采集服务未启动"}));});
    request.pipe(proxy);
    return;
  }
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
