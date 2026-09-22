import {el,clear} from "../utils/dom.js";
export class TelemetryInspector{
  constructor(bus){this.bus=bus;this.node=null}
  mount(root){
    this.node=el("aside",{class:"command-palette",id:"telemetry-inspector"});const output=el("pre",{class:"mono",style:"max-height:360px;overflow:auto;white-space:pre-wrap;color:#b8eaf2"});
    this.node.append(el("div",{class:"section-title"},el("span",{},"Telemetry Inspector"),el("span",{class:"badge hybrid"},"HYBRID")),output);root.append(this.node);
    this.bus.on("telemetry:update",s=>{clear(output);output.textContent=JSON.stringify({real:s.real,simulated:{threatLevel:s.simulated.threatLevel,eps:s.simulated.eps,throughputMbps:s.simulated.throughputMbps},validationCombinations:s.validationCombinations},null,2)});
    this.bus.on("inspector:toggle",()=>this.node.classList.toggle("open"));return this.node;
  }
}
