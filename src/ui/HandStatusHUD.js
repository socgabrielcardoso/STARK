import {el} from "../utils/dom.js";
export class HandStatusHUD{
  constructor(bus){this.bus=bus;this.node=null;this.roles={primary:"Right",control:"Left"};this.input="hands";this.farAssist=false}
  mount(root){
    this.node=el("section",{class:"hand-status-hud"},
      el("div",{class:"hand-status-hud__mode"},el("span",{class:"status-dot"}),el("strong",{},"HYBRID · HANDS PRIMARY")),
      el("div",{class:"hand-status-hud__hands",id:"hand-status-list"},"SEARCHING FOR PRIMARY + CONTROL"),
      el("div",{class:"hand-status-hud__legend"},"PRIMARY: TARGET / GRAB · CONTROL: SPACE · BOTH: TRANSFORM · FORWARD ×3: CLICK · MOUSE OPTIONAL")
    );
    root.append(this.node);
    this.bus.on("gestures:frame",({hands,roles})=>{if(roles)this.roles=roles;this.render(hands)});
    this.bus.on("hand-role:change",r=>{this.roles=r});
    this.bus.on("input:source",x=>{this.input=x.source;this.node.dataset.activeInput=x.source});
    this.bus.on("vision:far-assist",()=>{this.farAssist=true;clearTimeout(this.farTimer);this.farTimer=setTimeout(()=>{this.farAssist=false},700)});
    this.bus.on("air:grab-start",()=>this.node.classList.add("grabbing"));this.bus.on("air:grab-end",()=>this.node.classList.remove("grabbing"));
    return this.node;
  }
  render(hands){
    const list=this.node.querySelector("#hand-status-list");
    if(!hands.length){list.textContent=`PRIMARY ${this.roles.primary.toUpperCase()} · CONTROL ${this.roles.control.toUpperCase()} · MOUSE READY`;this.node.classList.add("no-hands");return}
    this.node.classList.remove("no-hands");
    list.textContent=hands.sort((a,b)=>a.role==="primary"?-1:1).map(h=>`${h.role.toUpperCase()} · ${h.name.toUpperCase()} · ${h.far?"FAR":"NEAR"}`).join("   |   ")+(this.farAssist?"   ·   ZOOM ASSIST":"");
  }
}
