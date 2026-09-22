import {el} from "../utils/dom.js";
export class GestureFeedbackEngine{
  constructor(bus){this.bus=bus;this.node=null;this.state=null}
  mount(root){
    this.node=el("section",{class:"gesture-feedback"},
      el("div",{class:"gesture-feedback__state"},"IDLE"),
      el("div",{class:"gesture-feedback__target"},"NO TARGET"),
      el("div",{class:"gesture-feedback__action"},"READY")
    );root.append(this.node);
    this.bus.on("gesture-state:change",x=>this.update({state:x.current.state}));
    this.bus.on("interaction:context",x=>this.update({target:x.type?.toUpperCase?.()||"EMPTY"}));
    this.bus.on("intent",x=>this.update({action:x.name.replaceAll("-"," ").toUpperCase()}));
    this.bus.on("air:grab-start",x=>this.update({state:"DRAGGING",target:(x.payload?.entityType||x.payload?.type||"OBJECT").toUpperCase(),action:"MOVE / DROP"}));
    this.bus.on("air:grab-end",()=>this.update({state:"RELEASE",action:"READY"}));
    this.bus.on("focus:change",x=>this.update({state:x.level,target:(x.entity?.type||x.target?.dataset?.panel||x.target?.dataset?.entityType||"SPACE").toString().toUpperCase()}));
    return this.node;
  }
  update(patch){this.state={state:"IDLE",target:"NO TARGET",action:"READY",...this.state,...patch};this.node.querySelector(".gesture-feedback__state").textContent=this.state.state;this.node.querySelector(".gesture-feedback__target").textContent=this.state.target;this.node.querySelector(".gesture-feedback__action").textContent=this.state.action}
}
