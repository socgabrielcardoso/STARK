import {el} from "../utils/dom.js";
import {TopBar} from "./TopBar.js";
export class HudShell{
  constructor(bus){this.bus=bus;this.layer=null;this.dock=null}
  mount(root){new TopBar(this.bus).mount(root);this.layer=el("section",{class:"panel-layer","aria-label":"Holographic panels"});root.append(this.layer);this.dock=el("nav",{class:"command-dock","aria-label":"Panel launcher"});root.append(this.dock);return{layer:this.layer,dock:this.dock}}
  addDockButton({id,icon,label,onClick}){const b=el("button",{class:"dock-btn",type:"button",dataset:{panel:id},onclick:onClick},el("span",{},icon),el("small",{},label));this.dock.append(b);return b}
}
