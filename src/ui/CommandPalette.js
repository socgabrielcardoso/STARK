import {el,clear} from "../utils/dom.js";
import {CONFIG} from "../config.js";
export class CommandPalette{
  constructor({bus,workspace,panelManager,telemetry,toast}){this.bus=bus;this.workspace=workspace;this.pm=panelManager;this.telemetry=telemetry;this.toast=toast;this.node=null}
  mount(root){
    const input=el("input",{placeholder:"Command: status, defender, workspace SOC, validate…","aria-label":"Command"}),results=el("div",{class:"command-results"});
    this.node=el("section",{class:"command-palette"},input,results);root.append(this.node);
    const render=()=>{const q=input.value.toLowerCase().trim();clear(results);CONFIG.commands.filter(c=>c.includes(q)).forEach(cmd=>{const b=el("button",{class:"command-item",type:"button",onclick:()=>{input.value=cmd;this.execute(cmd)}},el("span",{},cmd),el("span",{class:"muted"},"↵"));results.append(b)})};
    input.addEventListener("input",render);input.addEventListener("keydown",e=>{if(e.key==="Enter")this.execute(input.value);if(e.key==="Escape")this.close()});
    this.bus.on("command:toggle",()=>this.toggle());this.bus.on("command:open",()=>this.open());render();return this.node;
  }
  open(){this.node.classList.add("open");setTimeout(()=>this.node.querySelector("input")?.focus(),0)}
  close(){this.node.classList.remove("open")}
  toggle(){this.node.classList.toggle("open");if(this.node.classList.contains("open"))this.open()}
  execute(raw){
    const [cmd,arg]=raw.trim().split(/\s+/,2),panelMap={defender:"defender",events:"event-intel",connections:"connections",validate:"validation"};
    if(panelMap[cmd])this.pm.show(panelMap[cmd]);else if(cmd==="workspace"&&arg)this.workspace.activate(arg);else if(cmd==="reset")this.pm.reset();else if(cmd==="panels")document.querySelectorAll(".hud-panel").forEach(p=>this.pm.show(p.dataset.panel));
    else if(cmd==="status"){const s=this.telemetry.snapshot();this.toast.show(`Defender ${s.real.defender.realTimeProtectionEnabled?"ON":"OFF"} · ${s.simulated.eps} EPS · ${s.validationCombinations} validation permutations`)}
    else if(cmd==="help")this.toast.show("Pinch = select/drag · two-hand pinch = scale · fist hold = minimize · mouse works too");else if(cmd==="clear")this.close();else this.toast.show(`Unknown command: ${cmd||"∅"}`);
    this.close();
  }
}
