import {GestureClassifier} from "./GestureClassifier.js";
import {MotionAnalyzer} from "./MotionAnalyzer.js";
import {CONFIG} from "../config.js";
import {DepthClickDetector} from "./DepthClickDetector.js";
import {lerp} from "../utils/math.js";
class GestureSmoother{
  constructor(alpha=.30){this.alpha=alpha;this.points=new Map();this.labels=new Map()}
  point(handId,next){const prev=this.points.get(handId)||next,smooth={x:lerp(prev.x,next.x,this.alpha),y:lerp(prev.y,next.y,this.alpha)};this.points.set(handId,smooth);return smooth}
  label(handId,next){const history=this.labels.get(handId)||[];history.push(next);while(history.length>5)history.shift();this.labels.set(handId,history);const counts=history.reduce((m,x)=>(m[x]=(m[x]||0)+1,m),{});return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||next}
}
export class GestureRouter{
  constructor(bus,roleManager){this.bus=bus;this.roles=roleManager;this.classifier=new GestureClassifier(CONFIG);this.smoother=new GestureSmoother(CONFIG.pointerSmoothing);this.motion=new MotionAnalyzer();this.depthClick=new DepthClickDetector(bus);this.prev=new Map();this.unsub=null}
  start(){this.unsub=this.bus.on("hands:frame",frame=>this.route(frame))}
  stop(){this.unsub?.()}
  route(frame){
    const hands=frame.landmarks.map((marks,index)=>{
      const handedness=frame.handedness?.[index]?.[0]?.categoryName||frame.handedness?.[index]?.[0]?.displayName||`HAND-${index+1}`;
      const id=String(handedness).toLowerCase(),raw=this.classifier.classify(marks),name=this.smoother.label(id,raw.name),tip=this.smoother.point(id,{x:1-marks[8].x,y:marks[8].y});
      const motion=this.motion.push(id,tip,frame.time),role=this.roles?.roleFor(handedness)||"primary";
      const gesture={...raw,name,tip,handId:id,handedness,role,motion,landmarks:marks,worldLandmarks:frame.worldLandmarks?.[index]||null,time:frame.time};this.transition(gesture);this.depthClick.push(gesture,frame.time);
      if(motion.swipe&&["open-palm","point","victory"].includes(name))this.bus.emit(`gesture:swipe-${motion.swipe}`,gesture);
      return gesture;
    });
    if(hands.length===2&&hands.every(h=>h.pinch)){
      const primary=hands.find(h=>h.role==="primary"),control=hands.find(h=>h.role==="control"),a=primary||hands[0],b=control||hands[1],dx=b.tip.x-a.tip.x,dy=b.tip.y-a.tip.y;
      this.bus.emit("gesture:two-pinch",{hands,primary,control,rolesValid:Boolean(primary&&control),center:{x:(a.tip.x+b.tip.x)/2,y:(a.tip.y+b.tip.y)/2},distance:Math.hypot(dx,dy),angle:Math.atan2(dy,dx)});
    }else this.bus.emit("gesture:two-pinch-end",{});
    this.bus.emit("gestures:frame",{hands,frame,roles:this.roles?.snapshot?.()});
  }
  transition(g){
    const prev=this.prev.get(g.handId);
    if(prev?.name!==g.name){if(prev)this.bus.emit(`gesture:${prev.name}:end`,prev);this.bus.emit(`gesture:${g.name}:start`,g)}
    this.bus.emit(`gesture:${g.name}`,g);this.prev.set(g.handId,g);
  }
}
