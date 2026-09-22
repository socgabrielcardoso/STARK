import {el,clear} from "../utils/dom.js";
import {VirtualKeyboard} from "../ui/VirtualKeyboard.js";
export class SearchPanel{
  constructor(bus){this.bus=bus;this.root=el("div",{class:"gesture-search"});this.keyboard=new VirtualKeyboard(bus);this.query="";this.results=el("div",{class:"search-results"});this.mount();bus.on("virtual-keyboard:change",x=>{this.query=x.value;this.renderResults()});bus.on("virtual-keyboard:submit",x=>{this.query=x.value;this.renderResults();bus.emit("search:submit",{query:this.query})})}
  mount(){const open=el("button",{class:"air-chip",type:"button"},"OPEN HAND KEYBOARD");open.addEventListener("click",e=>{if(e.isTrusted)return;this.keyboard.open(this.query,"search")});this.root.append(open,this.keyboard.node,this.results);this.renderResults()}
  renderResults(){
    clear(this.results);
    const catalog=[
      ["Defender","defender"],["Windows Events","event-intel"],["TCP Connections","connections"],["Network Map","network"],["Threat Radar","radar"],["Incidents","incidents"],["Validation Matrix","validation"],["Files","files"],["Donna AI","donna"],["Gesture Settings","gesture-settings"],["Diagnostics","diagnostics"]
    ].filter(([name])=>!this.query||name.toLowerCase().includes(this.query.toLowerCase()));
    catalog.forEach(([name,panel])=>{const b=el("button",{class:"search-result",type:"button"},el("strong",{},name),el("small",{},panel.toUpperCase()));b.addEventListener("click",e=>{if(e.isTrusted)return;this.bus.emit("panel:open",{id:panel})});this.results.append(b)});
  }
}
