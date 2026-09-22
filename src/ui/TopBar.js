import {el,sourceBadge} from "../utils/dom.js";
import {Clock} from "../core/Clock.js";
export class TopBar{
  constructor(bus){this.bus=bus;this.node=null;this.clock=null}
  mount(root){
    const mark=el("div",{class:"brand__mark"},"");
    const brand=el("div",{class:"brand"},mark,el("div",{},el("strong",{},"STARK"),el("small",{},"CYBER COMMAND // LOCAL LAB")));
    const center=el("div",{class:"topbar__center"},sourceBadge("real","REAL SANITIZED"),sourceBadge("simulated","SIMULATION"),sourceBadge("hybrid","HYBRID FUSION"));
    const clock=el("div",{class:"clock"}),gesture=el("div",{class:"gesture-status"},"NO HANDS"),right=el("div",{class:"topbar__right"},gesture,clock);
    this.node=el("header",{class:"topbar"},brand,center,right);root.append(this.node);
    this.clock=new Clock(clock);this.clock.start();
    this.bus.on("gestures:frame",({hands})=>{gesture.textContent=hands.length?hands.map(h=>h.name.toUpperCase()).join(" + "):"NO HANDS"});
    return this.node;
  }
}
