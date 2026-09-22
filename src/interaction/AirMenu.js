import {el} from "../utils/dom.js";
const OPTIONS=[
  {id:"workspace-command",label:"COMMAND",icon:"◎"},
  {id:"workspace-soc",label:"SOC",icon:"⌁"},
  {id:"workspace-network",label:"NETWORK",icon:"◉"},
  {id:"workspace-lab",label:"LAB",icon:"◇"},
  {id:"layer-next",label:"LAYERS",icon:"≋"},
  {id:"panel-search",label:"SEARCH",icon:"⌕"},
  {id:"panel-settings",label:"SETTINGS",icon:"⚙"},
  {id:"history-undo",label:"UNDO",icon:"↶"}
];
export class AirMenu{
  constructor(bus){this.bus=bus;this.node=null;this.opened=false}
  mount(root){
    this.node=el("section",{class:"air-menu","aria-label":"Hand radial operating menu"},el("div",{class:"air-menu__core"},"STARK OS"));
    OPTIONS.forEach((opt,i)=>{
      const angle=(-Math.PI/2)+(Math.PI*2*i/OPTIONS.length);
      const btn=el("button",{class:"air-menu__item",type:"button",dataset:{airAction:opt.id},style:`--x:${Math.cos(angle)};--y:${Math.sin(angle)}`},el("span",{},opt.icon),el("small",{},opt.label));
      this.node.append(btn);
    });
    root.append(this.node);this.bus.on("airmenu:open",p=>this.open(p));this.bus.on("airmenu:close",()=>this.close());return this.node;
  }
  open(point){
    const margin=150,x=Math.max(margin,Math.min(innerWidth-margin,point?.x??innerWidth/2)),y=Math.max(margin,Math.min(innerHeight-margin,point?.y??innerHeight/2));
    this.node.style.left=`${x}px`;this.node.style.top=`${y}px`;this.node.classList.add("open");this.opened=true;this.bus.emit("airmenu:state",{open:true});
  }
  close(){if(!this.node)return;this.node.classList.remove("open");this.opened=false;this.bus.emit("airmenu:state",{open:false})}
}
