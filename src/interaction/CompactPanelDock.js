import {el} from "../utils/dom.js";
export class CompactPanelDock{
  constructor({bus,panelManager,root}){this.bus=bus;this.pm=panelManager;this.root=root;this.node=null;this.order=[]}
  mount(){
    this.node=el("aside",{class:"compact-panel-dock","aria-label":"Compact panels"});this.root.append(this.node);
    this.bus.on("panel:compact",x=>this.add(x.panel));
    this.bus.on("panel:restore",x=>this.remove(x.id));
    this.bus.on("panel:show",x=>this.remove(x.id));
    this.bus.on("panel:hide",x=>this.remove(x.id));
    this.bus.on("workspace:applied",()=>this.rebuild());
    return this.node;
  }
  add(panel){
    if(!panel)return;const id=panel.dataset.panel;if(!this.order.includes(id))this.order.push(id);
    if(this.node.querySelector('[data-compact-panel="'+CSS.escape(id)+'"]'))return;
    const title=panel.querySelector(".hud-panel__title strong")?.textContent||id;
    const pill=el("button",{class:"compact-panel-pill",type:"button",dataset:{compactPanel:id}},el("span",{},"▱"),el("strong",{},title));
    pill.addEventListener("click",e=>{if(e.isTrusted)return;this.pm.restore(panel)});
    this.node.append(pill);this.node.classList.add("visible");
  }
  remove(id){this.node?.querySelector('[data-compact-panel="'+CSS.escape(id)+'"]')?.remove();this.order=this.order.filter(x=>x!==id);if(!this.node?.children.length)this.node?.classList.remove("visible")}
  rebuild(){this.node.replaceChildren();this.order=[];document.querySelectorAll(".hud-panel.compacted").forEach(p=>this.add(p))}
  restoreLast(){const id=this.order.at(-1);if(!id)return false;const panel=document.querySelector('.hud-panel[data-panel="'+CSS.escape(id)+'"]');if(!panel)return false;this.pm.restore(panel);return true}
}
