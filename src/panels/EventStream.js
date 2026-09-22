import {el,clear} from "../utils/dom.js";
const sevClass=s=>s==="error"||s==="high"?"sev-high":s==="warning"||s==="medium"?"sev-warn":"sev-info";
export class EventStream{
  constructor(bus){this.bus=bus;this.root=el("div",{class:"log-stream"});this.lines=[];this.bus.on("telemetry:update",s=>this.seed(s));this.bus.on("import:local",x=>this.importLocal(x.text))}
  seed(s){
    if(this.lines.length)return;
    const real=s.real.windowsEvents.samples.map((e,i)=>({time:`R${i+1}`,sev:e.severity,src:e.provider,msg:`Event ${e.id}: ${e.message}`}));
    const sim=s.simulated.alerts.map((a,i)=>({time:`S${i+1}`,sev:a.severity,src:"SIM",msg:a.title}));
    this.lines=[...real,...sim];this.render();
  }
  importLocal(text){this.lines.unshift(...text.split(/\r?\n/).filter(Boolean).slice(0,16).map((msg,i)=>({time:`L${i+1}`,sev:"info",src:"LOCAL",msg})));this.lines=this.lines.slice(0,50);this.render()}
  render(){clear(this.root);for(const l of this.lines)this.root.append(el("div",{class:"log-line"},el("span",{class:"muted"},l.time),el("span",{class:sevClass(l.sev)},String(l.sev).toUpperCase()),el("span",{},`[${l.src}] ${l.msg}`)))}
}
