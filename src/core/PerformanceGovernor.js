export class PerformanceGovernor{
  constructor(bus){this.bus=bus;this.samples=[];this.mode="balanced"}
  start(){
    this.bus.on("camera:fps",x=>this.push(x.fps));
    const cores=navigator.hardwareConcurrency||4;if(cores<=4)this.set("efficient");else if(cores>=10)this.set("high");
  }
  push(fps){if(!fps)return;this.samples.push(fps);while(this.samples.length>6)this.samples.shift();const avg=this.samples.reduce((a,b)=>a+b,0)/this.samples.length;if(avg<22)this.set("efficient");else if(avg>28&&this.samples.length>=4)this.set("high");else this.set("balanced")}
  set(mode){if(this.mode===mode)return;this.mode=mode;document.documentElement.dataset.performance=mode;this.bus.emit("performance:mode",{mode})}
}
