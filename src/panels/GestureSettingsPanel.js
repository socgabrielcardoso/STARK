import {el,clear} from "../utils/dom.js";
const KEY="stark-gesture-settings-v4";
const defaults={smoothing:.27,pinch:.058,deadZone:.045,snap:true,precision:false,feedback:true};
export class GestureSettingsPanel{
  constructor(bus){this.bus=bus;this.root=el("div",{class:"settings-grid"});this.settings=this.load();this.roles={primary:"Right",control:"Left"};bus.on("hand-role:change",r=>{this.roles=r;this.render()});this.render()}
  load(){try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return{...defaults}}}
  save(){localStorage.setItem(KEY,JSON.stringify(this.settings));this.bus.emit("gesture-settings:change",this.settings);this.render()}
  adjust(key,delta,min,max){this.settings[key]=Math.max(min,Math.min(max,Number((this.settings[key]+delta).toFixed(3))));this.save()}
  toggle(key){this.settings[key]=!this.settings[key];this.save()}
  row(label,value,...actions){return el("div",{class:"settings-row"},el("div",{},el("strong",{},label),el("small",{},String(value))),el("div",{class:"settings-actions"},...actions))}
  btn(text,fn){const b=el("button",{class:"air-chip",type:"button"},text);b.addEventListener("click",e=>{if(e.isTrusted)return;fn()});return b}
  render(){
    clear(this.root);this.root.append(
      this.row("Hand roles",`PRIMARY ${this.roles.primary} · CONTROL ${this.roles.control}`,this.btn("SWAP",()=>this.bus.emit("hand-role:swap",{}))),
      this.row("Hybrid input","HANDS PRIMARY · MOUSE READY"),
      this.row("Forward click","3 DEPTH PULSES"),
      this.row("Far-hand assist","AUTO ZOOM"),
      this.row("Pointer smoothing",this.settings.smoothing,this.btn("−",()=>this.adjust("smoothing",-.02,.12,.5)),this.btn("+",()=>this.adjust("smoothing",.02,.12,.5))),
      this.row("Pinch threshold",this.settings.pinch,this.btn("−",()=>this.adjust("pinch",-.003,.03,.09)),this.btn("+",()=>this.adjust("pinch",.003,.03,.09))),
      this.row("Dead zone",this.settings.deadZone,this.btn("−",()=>this.adjust("deadZone",-.005,.02,.12)),this.btn("+",()=>this.adjust("deadZone",.005,.02,.12))),
      this.row("Workspace snap",this.settings.snap?"ON":"OFF",this.btn("TOGGLE",()=>this.toggle("snap")),this.btn("AUTO",()=>this.bus.emit("workspace:auto-arrange",{}))),
      this.row("Precision",this.settings.precision?"ON":"OFF",this.btn("TOGGLE",()=>this.toggle("precision")),this.btn("CALIBRATE",()=>this.bus.emit("calibration:reset",{}))),
      this.row("Feedback",this.settings.feedback?"ON":"OFF",this.btn("TOGGLE",()=>this.toggle("feedback")),this.btn("RESET",()=>{this.settings={...defaults};this.save()}))
    )
  }
}
