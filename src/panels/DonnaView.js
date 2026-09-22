import {el,clear} from "../utils/dom.js";
export class DonnaView{
  constructor(bus){this.bus=bus;this.root=el("div");this.last=null;bus.on("telemetry:update",s=>{this.last=s;this.render(s)});bus.on("workspace:change",x=>this.note(`Workspace changed to ${x.name}.`));bus.on("panel:focus",x=>this.note(`Focused ${x.id}. Pinch and drag the header to move it.`))}
  render(s){clear(this.root);const messages=[
    ["STATUS",s.real.defender.realTimeProtectionEnabled?"Defender real-time protection is enabled in the supplied snapshot.":"Review Defender real-time protection."],
    ["SIGNAL",`${s.real.windowsEvents.levels.error} error-level and ${s.real.windowsEvents.levels.warning} warning-level rows were present in the supplied Windows event snapshot.`],
    ["LAB",`Simulation is producing ${s.simulated.eps} EPS at ${s.simulated.throughputMbps} Mbps. Simulated values are visually labelled.`],
    ["CONTROL","Pinch selects. Pinch-drag moves a panel. Two simultaneous pinches resize the active panel. Hold a fist to minimize it."]
  ];for(const [k,m] of messages)this.root.append(this.message(k,m))}
  note(text){this.root.prepend(this.message("CONTEXT",text))}
  message(kind,text){return el("div",{class:"donna-message"},el("strong",{},`DONNA // ${kind}`),el("p",{},text))}
}
