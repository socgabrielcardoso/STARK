import {GestureClassifier} from "./GestureClassifier.js";
import {CONFIG} from "../config.js";
import {lerp} from "../utils/math.js";
class GestureSmoother{
  constructor(alpha=.34){this.alpha=alpha;this.points=new Map();this.labels=new Map()}
  point(handId,next){const prev=this.points.get(handId)||next,smooth={x:lerp(prev.x,next.x,this.alpha),y:lerp(prev.y,next.y,this.alpha)};this.points.set(handId,smooth);return smooth}
  label(handId,next){const history=this.labels.get(handId)||[];history.push(next);while(history.length>5)history.shift();this.labels.set(handId,history);const counts=history.reduce((m,x)=>(m[x]=(m[x]||0)+1,m),{});return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||next}
}
export class GestureRouter{
  constructor(bus){this.bus=bus;this.classifier=new GestureClassifier(CONFIG);this.smoother=new GestureSmoother(CONFIG.pointerSmoothing);this.prev=new Map();this.started=new Map();this.unsub=null;this.holdFired=new Set()}
  start(){this.unsub=this.bus.on("hands:frame",frame=>this.route(frame))}
  stop(){this.unsub?.()}
  route(frame){
    const hands=frame.landmarks.map((marks,index)=>{
      const id=index,raw=this.classifier.classify(marks),label=this.smoother.label(id,raw.name),tip=this.smoother.point(id,{x:1-marks[8].x,y:marks[8].y});
      const gesture={...raw,name:label,tip,handId:id,landmarks:marks,time:frame.time};this.transition(gesture);return gesture;
    });
    if(hands.length===2&&hands.every(h=>h.pinch)){const a=hands[0].tip,b=hands[1].tip;this.bus.emit("gesture:two-pinch",{hands,center:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:Math.hypot(a.x-b.x,a.y-b.y)})}
    else this.bus.emit("gesture:two-pinch-end",{});
    this.bus.emit("gestures:frame",{hands,frame});
  }
  transition(g){
    const prev=this.prev.get(g.handId),holdKey=`${g.handId}:${g.name}`;
    if(prev?.name!==g.name){this.started.set(g.handId,g.time);this.holdFired.delete(`${g.handId}:${prev?.name}`);if(prev)this.bus.emit(`gesture:${prev.name}:end`,prev);this.bus.emit(`gesture:${g.name}:start`,g)}
    this.bus.emit(`gesture:${g.name}`,g);
    const heldFor=g.time-(this.started.get(g.handId)||g.time);
    if(g.name==="open-palm"&&heldFor>CONFIG.openPalmHoldMs&&!this.holdFired.has(holdKey)){this.holdFired.add(holdKey);this.bus.emit("gesture:home",g)}
    if(g.name==="fist"&&heldFor>CONFIG.fistHoldMs&&!this.holdFired.has(holdKey)){this.holdFired.add(holdKey);this.bus.emit("gesture:minimize-active",g)}
    this.prev.set(g.handId,g);
  }
}
