import {el,clear} from "../utils/dom.js";
import {VirtualKeyboard} from "../ui/VirtualKeyboard.js";
import {sanitizeImportedLog} from "../utils/sanitize.js";
const SAMPLES={
  DEFENDER:"Get-MpComputerStatus | RealTimeProtectionEnabled=True | IsTamperProtected=True | AntivirusEnabled=True",
  EVENTS:"Event 3033 CodeIntegrity | Event 4624 Successful Logon | Event 4672 Special Privileges",
  NETWORK:"TCP Established | HTTPS 443 | connection snapshot | sanitized"
};
export class HandImportPanel{
  constructor(bus){
    this.bus=bus;this.root=el("div",{class:"hand-import"});this.keyboard=new VirtualKeyboard(bus);this.buffer="";this.preview=el("pre",{class:"import-preview mono"});
    bus.on("virtual-keyboard:change",x=>{if(x.target==="telemetry-import"){this.buffer=x.value;this.renderPreview()}});
    bus.on("virtual-keyboard:submit",x=>{if(x.target==="telemetry-import"){this.buffer=x.value;this.submit()}});
    this.render();
  }
  button(label,fn){const b=el("button",{class:"air-chip",type:"button"},label);b.addEventListener("click",e=>{if(e.isTrusted)return;fn()});return b}
  render(){
    clear(this.root);
    const actions=el("div",{class:"source-strip"},
      this.button("DEFENDER SAMPLE",()=>this.load("DEFENDER")),
      this.button("EVENT SAMPLE",()=>this.load("EVENTS")),
      this.button("NETWORK SAMPLE",()=>this.load("NETWORK")),
      this.button("TYPE WITH HANDS",()=>this.keyboard.open(this.buffer,"telemetry-import")),
      this.button("LOAD",()=>this.submit()),
      this.button("CLEAR",()=>{this.buffer="";this.renderPreview()})
    );
    this.root.append(actions,this.preview,this.keyboard.node);this.renderPreview();
  }
  load(name){this.buffer=SAMPLES[name]||"";this.renderPreview()}
  renderPreview(){this.preview.textContent=this.buffer||"Select a source or open the hand keyboard. Raw identifiers are sanitized before entering the lab."}
  submit(){const clean=sanitizeImportedLog(this.buffer);if(!clean)return;this.bus.emit("import:local",{text:clean,source:"hand-import"});this.bus.emit("panel:open",{id:"logs"})}
}
