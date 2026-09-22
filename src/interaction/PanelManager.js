import {qsa} from "../utils/dom.js";
import {clamp} from "../utils/math.js";
class DragController{
  constructor(){this.state=null}
  begin(panel,point){const rect=panel.getBoundingClientRect();this.state={panel,dx:point.x-rect.left,dy:point.y-rect.top};panel.classList.add("active")}
  move(point,bounds=document.documentElement){
    if(!this.state)return;
    const {panel,dx,dy}=this.state,rect=bounds.getBoundingClientRect?.()||{left:0,top:0,width:innerWidth,height:innerHeight};
    const maxX=Math.max(0,rect.width-panel.offsetWidth),maxY=Math.max(0,rect.height-panel.offsetHeight);
    panel.style.left=`${clamp(point.x-rect.left-dx,0,maxX)}px`;panel.style.top=`${clamp(point.y-rect.top-dy,0,maxY)}px`;
  }
  end(){this.state=null}
}
export class PanelManager{
  constructor(layer,bus){this.layer=layer;this.bus=bus;this.z=20;this.active=null;this.drag=new DragController()}
  register(panel){
    panel.addEventListener("pointerdown",()=>this.focus(panel));const header=panel.querySelector(".hud-panel__header");
    header?.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;this.focus(panel);header.setPointerCapture?.(e.pointerId);this.drag.begin(panel,{x:e.clientX,y:e.clientY})});
    header?.addEventListener("pointermove",e=>{if(this.drag.state)this.drag.move({x:e.clientX,y:e.clientY},this.layer)});header?.addEventListener("pointerup",()=>this.drag.end());
    panel.querySelector('[data-action="minimize"]')?.addEventListener("click",()=>this.minimize(panel));
    panel.querySelector('[data-action="maximize"]')?.addEventListener("click",()=>this.maximize(panel));
    panel.querySelector('[data-action="close"]')?.addEventListener("click",()=>this.hide(panel.dataset.panel));
  }
  focus(panel){this.active=panel;panel.style.zIndex=++this.z;qsa(".hud-panel",this.layer).forEach(p=>p.classList.toggle("active",p===panel));this.bus.emit("panel:focus",{id:panel.dataset.panel,panel})}
  show(id){const p=this.layer.querySelector(`[data-panel="${id}"]`);if(!p)return;p.hidden=false;p.classList.remove("minimized");this.focus(p);this.bus.emit("panel:show",{id})}
  hide(id){const p=this.layer.querySelector(`[data-panel="${id}"]`);if(!p)return;p.hidden=true;if(this.active===p)this.active=null;this.bus.emit("panel:hide",{id})}
  toggle(id){const p=this.layer.querySelector(`[data-panel="${id}"]`);if(!p)return;p.hidden?this.show(id):this.hide(id)}
  minimize(panel=this.active){if(!panel)return;panel.classList.toggle("minimized");this.bus.emit("panel:minimize",{id:panel.dataset.panel})}
  maximize(panel=this.active){if(!panel)return;panel.classList.toggle("maximized");this.bus.emit("panel:maximize",{id:panel.dataset.panel})}
  reset(){qsa(".hud-panel",this.layer).forEach(p=>{p.classList.remove("maximized","minimized","active");p.style.transform=""});this.bus.emit("panels:reset",{})}
}
