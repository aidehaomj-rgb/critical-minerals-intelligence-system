const cp=require("child_process");
var s=cp.spawn("node",["local-server.cjs"],{cwd:"C:/Users/59809/Documents/关键矿产/mineral-control-atlas",detached:true,stdio:"ignore"});
var g=cp.spawn("node",["generator_worker.js"],{cwd:"C:/Users/59809/Documents/关键矿产/mineral-control-atlas",detached:true,stdio:"ignore"});
s.unref();g.unref();
console.log("Server PID: "+s.pid+", Generator PID: "+g.pid);
