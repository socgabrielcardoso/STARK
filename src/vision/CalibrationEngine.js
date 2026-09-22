import {distance2D,average,clamp} from "../utils/math.js";
const KEY="stark-calibration-v3";
export class CalibrationEngine{
  constructor(bus){this.bus=bus;this.samples=[];this.pinches=[];this.speeds=[];this.points=[];this.startedAt=0;this.complete=false;this.profile=this.load();this.unsub=null}
  load(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch{return null}}
  start(){
    this.startedAt=performance.now();this.complete=false;this.samples=[];this.pinches=[];this.speeds=[];this.points=[];
    this.unsub?.();this.unsub=this.bus.on("gestures:frame",({hands})=>this.capture(hands));
    this.bus.emit("calibration:start",{stored:Boolean(this.profile)});
  }
  capture(hands){
    if(this.complete)return;
    for(const h of hands){
      if(!h.landmarks?.length)continue;
      const handSize=distance2D(h.landmarks[0],h.landmarks[9]);
      if(handSize>.03&&handSize<.5)this.samples.push(handSize);
      if(Number.isFinite(h.pinchDistance))this.pinches.push(h.pinchDistance);
      if(Number.isFinite(h.motion?.speed))this.speeds.push(h.motion.speed);
      if(Number.isFinite(h.tip?.x)&&Number.isFinite(h.tip?.y))this.points.push({x:h.tip.x,y:h.tip.y});
    }
    const elapsed=performance.now()-this.startedAt,progress=clamp(elapsed/4200,0,1);
    this.bus.emit("calibration:progress",{progress,elapsed,handCount:hands.length,samples:this.samples.length});
    if(elapsed>=4200&&this.samples.length>18)this.finish();
  }
  finish(){
    const avgHand=average(this.samples.slice(-160))||.12,sortedPinch=[...this.pinches].sort((a,b)=>a-b),p20=sortedPinch[Math.floor(sortedPinch.length*.2)]||.045;
    const avgSpeed=average(this.speeds.filter(x=>x<4).slice(-180))||.45,xs=this.points.map(p=>p.x),ys=this.points.map(p=>p.y);
    const minX=clamp(Math.min(...xs,.08),0,.35),maxX=clamp(Math.max(...xs,.92),.65,1),minY=clamp(Math.min(...ys,.08),0,.35),maxY=clamp(Math.max(...ys,.92),.65,1);
    this.profile={
      calibratedAt:Date.now(),avgHandSize:Number(avgHand.toFixed(4)),avgSpeed:Number(avgSpeed.toFixed(3)),
      pinchThreshold:Number(clamp(Math.max(.035,p20*1.45),.04,.075).toFixed(4)),
      deadZone:Number(clamp(avgHand*.38,.04,.085).toFixed(4)),minMotionPx:Math.round(clamp(avgSpeed*22,10,28)),
      holdMs:Math.round(clamp(360-avgSpeed*45,250,380)),longHoldMs:1550,smoothing:Number(clamp(.34-avgSpeed*.05,.22,.34).toFixed(3)),
      region:{minX:Number(minX.toFixed(3)),maxX:Number(maxX.toFixed(3)),minY:Number(minY.toFixed(3)),maxY:Number(maxY.toFixed(3))}
    };
    localStorage.setItem(KEY,JSON.stringify(this.profile));this.complete=true;this.unsub?.();this.unsub=null;
    this.bus.emit("calibration:profile",this.profile);this.bus.emit("calibration:complete",this.profile);
  }
  reset(){localStorage.removeItem(KEY);this.profile=null;this.start()}
}
