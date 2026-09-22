import {el} from "../utils/dom.js";
import {sanitizeImportedLog} from "../utils/sanitize.js";
export class ImportDrawer{
  constructor(bus,toast){this.bus=bus;this.toast=toast}
  mount(root){
    const node=el("section",{class:"command-palette",id:"import-drawer"});
    const area=el("textarea",{rows:"10",placeholder:"Paste Windows events, Defender output, firewall/VPN snippets or lab telemetry here. Processing stays in the browser.",style:"width:100%;resize:vertical;background:transparent;color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px"});
    const btn=el("button",{class:"primary-action",type:"button",onclick:()=>{const clean=sanitizeImportedLog(area.value);this.bus.emit("import:local",{text:clean});this.toast.show(`Imported ${clean.length.toLocaleString()} sanitized characters locally`);node.classList.remove("open")}},"SANITIZE + LOAD LOCALLY");
    node.append(el("div",{class:"section-title"},el("span",{},"Local telemetry import"),el("span",{class:"badge real"},"NOT UPLOADED")),area,btn);root.append(node);this.bus.on("import:toggle",()=>node.classList.toggle("open"));return node;
  }
}
