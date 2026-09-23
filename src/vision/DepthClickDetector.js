import {CONFIG} from "../config.js";
const d3=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.y||0)-(b?.y||0),(a?.z||0)-(b?.z||0));
export class DepthClickDetector{
  constructor(bus){this.bus=bus;this.state=new Map();this.enabled=true}
  normalize(hand){
    const world=hand?.worldLandmarks,marks=world?.length?world:hand?.landmarks;if(!marks?.[8]||!marks?.[5])return null;
    const scale=world?.length?Math.max(.018,d3(marks[0],marks[9])):Math.max(.02,hand.handScale||.1);
    return (marks[5].z-marks[8].z)/scale;
  }
  push(hand,time=performance.now()){
    if(!this.enabled||hand?.role!=="primary"||hand?.name!=="point")return;
    const value=this.normalize(hand);if(!Number.isFinite(value))return;
    const s=this.state.get(hand.handId)||{last:value,armed:true,pulses:[],cooldown:0,baseline:value};
    s.baseline=s.baseline*.90+value*.10;const delta=value-s.baseline,velocity=value-s.last;s.last=value;
    if(time<s.cooldown){this.state.set(hand.handId,s);return}
    const threshold=(hand.far?CONFIG.depthClickPulseThreshold*.78:CONFIG.depthClickPulseThreshold);
    if(s.armed&&delta>threshold&&velocity>.014){
      s.armed=false;s.pulses.push(time);s.pulses=s.pulses.filter(t=>time-t<=CONFIG.depthClickWindowMs);
      this.bus.emit("depth-click:progress",{hand,count:s.pulses.length,required:CONFIG.depthClickPulses,delta});
      if(s.pulses.length>=CONFIG.depthClickPulses){s.pulses=[];s.cooldown=time+CONFIG.depthClickCooldownMs;this.bus.emit("gesture:depth-triple-click",{...hand,depthDelta:delta,time})}
    }
    if(!s.armed&&delta<threshold*.28)s.armed=true;
    if(s.pulses.length&&time-s.pulses[0]>CONFIG.depthClickWindowMs)s.pulses=[];
    this.state.set(hand.handId,s);
  }
  reset(id){if(id)this.state.delete(id);else this.state.clear()}
}
