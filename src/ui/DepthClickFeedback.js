import {el} from "../utils/dom.js";
export class DepthClickFeedback{
  constructor(bus){this.bus=bus;this.node=null;this.timer=null}
  mount(root){
    this.node=el("div",{class:"depth-click-feedback","aria-hidden":"true"},el("span",{},"0/3"));
    root.append(this.node);
    this.bus.on("depth-click:progress",x=>this.progress(x));this.bus.on("gesture:depth-triple-click",x=>this.fire(x));return this.node;
  }
  position(hand){if(!hand?.tip)return;this.node.style.left=(hand.tip.x*innerWidth)+"px";this.node.style.top=(hand.tip.y*innerHeight)+"px"}
  progress({hand,count,required}){this.position(hand);this.node.querySelector("span").textContent=`${count}/${required}`;this.node.classList.add("visible","charging");clearTimeout(this.timer);this.timer=setTimeout(()=>this.node.classList.remove("visible","charging"),520)}
  fire(hand){this.position(hand);this.node.querySelector("span").textContent="CLICK";this.node.classList.add("visible","fired");clearTimeout(this.timer);this.timer=setTimeout(()=>this.node.classList.remove("visible","fired"),300)}
}
