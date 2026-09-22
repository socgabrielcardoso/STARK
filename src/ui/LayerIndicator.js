import {el} from "../utils/dom.js";
export class LayerIndicator{
  constructor(bus){this.bus=bus;this.node=null}
  mount(root){this.node=el("div",{class:"layer-indicator"},el("span",{},"LAYER 1"),el("strong",{},"PRIMARY"));root.append(this.node);this.bus.on("layer:change",x=>{this.node.firstElementChild.textContent=`LAYER ${x.layer}`;this.node.lastElementChild.textContent=x.name});return this.node}
}
