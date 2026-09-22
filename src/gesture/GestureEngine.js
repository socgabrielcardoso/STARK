import {GestureStateManager} from "./GestureStateManager.js";
import {GestureBindingStore} from "./GestureBindingStore.js";
import {classifyPosition,classifyVelocity,COMPOSITION_CAPACITY,signature} from "./GestureGrammar.js";
export class GestureEngine{
  constructor(bus){this.bus=bus;this.states=new GestureStateManager(bus);this.bindings=new GestureBindingStore(bus);this.lastPinch=new Map();this.holds=new Map();this.cooldown=new Map();this.context={type:"empty",entity:null};this.profile={deadZone:.055,minMotionPx:14,holdMs:340,longHoldMs:1350}}
  start(){
    this.bus.on("gestures:frame",frame=>this.frame(frame.hands));
    this.bus.on("gesture:pinch:start",g=>this.pinchStart(g));this.bus.on("gesture:pinch",g=>this.pinchHold(g));this.bus.on("gesture:pinch:end",g=>this.pinchEnd(g));
    this.bus.on("gesture:two-pinch",g=>{if(!g.rolesValid)return;for(const h of g.hands||[])this.states.transition(h.handId,"SCALING",{gesture:"two-pinch",point:h.tip});this.emit("transform",g,{signal:"two:pinch",role:"both"})});
    this.bus.on("gesture:two-pinch-end",g=>this.emit("transform-end",g,{signal:"two:pinch:end",role:"both"}));
    ["left","right","up","down"].forEach(dir=>this.bus.on(`gesture:swipe-${dir}`,g=>{if(g.role==="control")this.binding(`control:swipe:${dir}`,g)}));
    this.bus.on("calibration:profile",p=>this.profile={...this.profile,...p});
    this.bus.on("interaction:context",c=>this.context=c||this.context);
    this.bus.on("air:hover",x=>{if(x.hand?.role==="primary")this.states.transition(x.hand.handId,x.type&&x.type!=="empty"?"TARGETED":"HOVER",{target:x.target,gesture:x.hand.name,point:x.hand.tip})});
    this.bus.on("air:grab-start",x=>{if(x.handId)this.states.transition(x.handId,"DRAGGING",{target:x.source,gesture:"pinch"})});
    this.bus.on("air:grab-end",x=>{if(x.handId){this.states.transition(x.handId,"RELEASE",{target:x.target,gesture:"pinch"});setTimeout(()=>this.states.transition(x.handId,"CONFIRMED",{target:x.target}),80)}});
    this.bus.emit("gesture-engine:ready",{compositionCapacity:COMPOSITION_CAPACITY,bindings:this.bindings.bindings});
  }
  frame(hands){
    const now=performance.now();hands.forEach(h=>this.states.updateGesture(h));
    const twoPalms=hands.length===2&&hands.every(h=>h.name==="open-palm"),twoFists=hands.length===2&&hands.every(h=>h.name==="fist");
    this.checkTwoHand("open-palm","two:open-palm",hands,850,now);this.checkTwoHand("fist","two:fist",hands,720,now);
    for(const h of hands){
      const position=classifyPosition(h.tip,this.profile.deadZone),velocity=classifyVelocity(h.motion?.speed||0),state=this.states.get(h.handId).state,context=this.context?.type||"empty";
      this.bus.emit("gesture-context:update",{handId:h.handId,role:h.role,gesture:h.name,position,velocity,state,context,signature:signature({gesture:h.name,position,velocity,state,context})});
      if(!(twoPalms||twoFists))this.checkHold(h,now);
    }
  }
  checkHold(h,now){
    const key=`${h.handId}:${h.name}`;if(!this.holds.has(key))this.holds.set(key,{since:now,short:false,long:false});
    const current=this.holds.get(key),held=now-current.since;for(const k of [...this.holds.keys()])if(k.startsWith(h.handId+":")&&k!==key)this.holds.delete(k);
    if(h.role==="primary"&&h.name==="point"&&held>620&&!current.targeted){current.targeted=true;this.states.transition(h.handId,"TARGETED",{gesture:"point",point:h.tip,target:this.context?.target||null});this.binding("primary:hold:point",{...h,held})}
    const shortThreshold=h.name==="open-palm"?Math.max(520,this.profile.holdMs):h.name==="fist"?Math.max(460,this.profile.holdMs):this.profile.holdMs;
    if(h.role==="control"&&held>shortThreshold&&!current.short){current.short=true;this.binding(`control:hold:${h.name}`,{...h,held})}
    if(h.role==="control"&&held>this.profile.longHoldMs&&!current.long){current.long=true;this.binding(`control:long:${h.name}`,{...h,held})}
  }
  checkTwoHand(gesture,signal,hands,threshold,now){
    const key=`pair:${gesture}`,matching=hands.filter(h=>h.name===gesture);if(matching.length!==2){this.holds.delete(key);return}
    const entry=this.holds.get(key)||{since:now,fired:false};this.holds.set(key,entry);if(!entry.fired&&now-entry.since>threshold){entry.fired=true;this.binding(signal,{hands:matching,held:now-entry.since})}
  }
  pinchStart(g){
    if(g.role!=="primary"){this.emit("control-pinch",{...g},{signal:"control:pinch",role:"control"});return}
    const now=performance.now(),last=this.lastPinch.get(g.handId)||0;this.lastPinch.set(g.handId,now);const double=now-last<360;
    this.states.transition(g.handId,"PINCH_START",{gesture:"pinch",point:g.tip,target:this.context?.target||null});this.emit(double?"double-select":"select-start",{...g,double},{signal:double?"primary:double:pinch":"primary:tap:pinch",role:"primary"});
  }
  pinchHold(g){if(g.role!=="primary")return;const state=this.states.get(g.handId),held=performance.now()-state.since;if(held>this.profile.holdMs){this.states.transition(g.handId,"PINCH_HOLD",{gesture:"pinch",point:g.tip,target:this.context?.target||null});this.emit("select-hold",{...g,held},{signal:"primary:hold:pinch",role:"primary"})}}
  pinchEnd(g){if(g?.role!=="primary")return;if(g?.handId)this.states.transition(g.handId,"RELEASE",{gesture:"pinch",point:g.tip,target:this.context?.target||null});this.emit("select-end",g,{signal:"primary:release:pinch",role:"primary"})}
  binding(signal,payload){const action=this.bindings.get(signal);if(action&&action!=="none")this.emit(action,payload,{signal,role:signal.startsWith("control:")?"control":signal.startsWith("primary:")?"primary":"both"})}
  emit(name,payload,meta={}){const packet={name,payload,meta:{...meta,context:this.context?.type||"empty",entity:this.context?.entity||null,time:performance.now()}};this.bus.emit(`intent:${name}`,packet);this.bus.emit("intent",packet)}
}
