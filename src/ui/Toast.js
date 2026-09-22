import {el} from "../utils/dom.js";
export class Toast{
  constructor(root){this.root=root}
  show(message,{duration=2600}={}){const node=el("div",{class:"toast"},message);this.root.append(node);setTimeout(()=>{node.style.opacity="0";setTimeout(()=>node.remove(),220)},duration)}
}
