import {el,clear} from "../utils/dom.js";
export class OffscreenNavigator{
  constructor({bus,root,spatial}){this.bus=bus;this.root=root;this.spatial=spatial;this.node=null;this.raf=0}
  mount(){
    this.node=el("aside",{class:"offscreen-navigator","aria-label":"Offscreen objects"});this.root.append(this.node);
    const tick=()=>{this.render();this.raf=requestAnimationFrame(tick)};tick();return this.node;
  }
  render(){
    const out=[...document.querySelectorAll(".spatial-object-layer > .spatial-object,.spatial-object-layer > .spatial-group")].filter(n=>this.isOutside(n.getBoundingClientRect()));
    if(!out.length){this.node.classList.remove("visible");clear(this.node);return}
    this.node.classList.add("visible");clear(this.node);this.node.append(el("strong",{class:"offscreen-count"},String(out.length)+" OUTSIDE"));
    out.slice(0,8).forEach(node=>{
      const r=node.getBoundingClientRect(),edge=this.edge(r),title=node.querySelector("strong")?.textContent||"OBJECT";
      const b=el("button",{class:"offscreen-chip",type:"button",dataset:{offscreenId:node.dataset.spatialId||node.dataset.spatialGroup}},el("span",{},edge.icon),el("small",{},title));
      b.addEventListener("click",()=>this.reveal(node,edge));this.node.append(b)
    })
  }
  isOutside(r){return r.right<16||r.left>innerWidth-16||r.bottom<72||r.top>innerHeight-16}
  edge(r){
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    if(cx<0)return{icon:"←",x:70,y:Math.min(innerHeight-120,Math.max(100,cy))};
    if(cx>innerWidth)return{icon:"→",x:innerWidth-250,y:Math.min(innerHeight-120,Math.max(100,cy))};
    if(cy<70)return{icon:"↑",x:Math.min(innerWidth-250,Math.max(70,cx)),y:100};
    return{icon:"↓",x:Math.min(innerWidth-250,Math.max(70,cx)),y:innerHeight-170}
  }
  reveal(node,edge){
    node.style.position="fixed";node.style.left=Math.max(18,edge.x)+"px";node.style.top=Math.max(78,edge.y)+"px";node.classList.add("offscreen-return");
    setTimeout(()=>node.classList.remove("offscreen-return"),260);this.spatial.focused=node;this.spatial.save();this.bus.emit("spatial:revealed",{id:node.dataset.spatialId||node.dataset.spatialGroup})
  }
  stop(){cancelAnimationFrame(this.raf)}
}
