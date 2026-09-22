export const HAND_STATES=Object.freeze(["IDLE","HOVER","TARGETED","PINCH_START","PINCH_HOLD","DRAGGING","ROTATING","SCALING","RELEASE","CONFIRMED","CANCELLED"]);
export class GestureStateManager{
  constructor(bus){this.bus=bus;this.state=new Map()}
  get(id){return this.state.get(id)||{state:"IDLE",since:performance.now(),target:null,gesture:"none",confidence:0}}
  transition(id,next,meta={}){
    const prev=this.get(id);if(prev.state===next&&prev.target===meta.target)return prev;
    const current={...prev,...meta,state:next,since:performance.now(),previous:prev.state};this.state.set(id,current);
    this.bus?.emit("gesture-state:change",{handId:id,previous:prev,current});return current;
  }
  updateGesture(hand){const current=this.get(hand.handId);this.state.set(hand.handId,{...current,gesture:hand.name,confidence:hand.confidence??0,point:hand.tip,motion:hand.motion,updatedAt:hand.time});}
  clear(id){this.state.delete(id);this.bus?.emit("gesture-state:change",{handId:id,previous:null,current:{state:"IDLE"}})}
  snapshot(){return [...this.state.entries()].map(([handId,value])=>({handId,...value}))}
}
