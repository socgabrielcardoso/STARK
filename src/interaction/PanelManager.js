import {qsa} from "../utils/dom.js";
import {clamp} from "../utils/math.js";
class DragController{
  constructor(){this.state=null}
  begin(panel,point){const rect=panel.getBoundingClientRect();this.state={panel,dx:point.x-rect.left,dy:point.y-rect.top};panel.classList.add("active","air-grabbed");panel.dataset.snapped="false"}
  move(point,bounds=document.documentElement){if(!this.state)return;const {panel,dx,dy}=this.state,rect=bounds.getBoundingClientRect?.()||{left:0,top:0,width:innerWidth,height:innerHeight};const maxX=Math.max(0,rect.width-panel.offsetWidth),maxY=Math.max(0,rect.height-panel.offsetHeight);panel.style.left=`${clamp(point.x-rect.left-dx,0,maxX)}px`;panel.style.top=`${clamp(point.y-rect.top-dy,0,maxY)}px`}
  end(){const panel=this.state?.panel;panel?.classList.remove("air-grabbed");this.state=null;return panel}
}
export class PanelManager{
  constructor(layer,bus){this.layer=layer;this.bus=bus;this.z=20;this.active=null;this.drag=new DragController()}
  register(panel){
    panel.querySelector('[data-action="minimize"]')?.addEventListener("click",e=>{if(e.isTrusted)return;this.minimize(panel)});
    panel.querySelector('[data-action="maximize"]')?.addEventListener("click",e=>{if(e.isTrusted)return;this.maximize(panel)});
    panel.querySelector('[data-action="close"]')?.addEventListener("click",e=>{if(e.isTrusted)return;this.hide(panel.dataset.panel)});
  }
  focus(panel){if(!panel||panel.hidden)return;this.active=panel;panel.style.zIndex=++this.z;qsa(".hud-panel",this.layer).forEach(p=>p.classList.toggle("active",p===panel));this.bus.emit("panel:focus",{id:panel.dataset.panel,panel})}
  show(id){const p=this.layer.querySelector('[data-panel="'+CSS.escape(id)+'"]');if(!p)return;p.hidden=false;p.classList.remove("compacted","minimized");this.focus(p);this.bus.emit("panel:show",{id,panel:p})}
  hide(id){const p=this.layer.querySelector('[data-panel="'+CSS.escape(id)+'"]');if(!p)return;p.hidden=true;p.classList.remove("compacted");if(this.active===p)this.active=null;this.bus.emit("panel:hide",{id,panel:p})}
  toggle(id){const p=this.layer.querySelector('[data-panel="'+CSS.escape(id)+'"]');if(!p)return;p.hidden?this.show(id):this.hide(id)}
  minimize(panel=this.active){if(!panel)return;if(panel.classList.contains("compacted"))return this.restore(panel);panel.dataset.preCompactWidth=panel.style.width;panel.dataset.preCompactHeight=panel.style.height;panel.classList.add("compacted");panel.classList.remove("maximized","minimized","active");panel.hidden=true;if(this.active===panel)this.active=null;this.bus.emit("panel:compact",{id:panel.dataset.panel,panel})}
  restore(panel){if(!panel)return;panel.hidden=false;panel.classList.remove("compacted","minimized");if(panel.dataset.preCompactWidth)panel.style.width=panel.dataset.preCompactWidth;if(panel.dataset.preCompactHeight)panel.style.height=panel.dataset.preCompactHeight;this.focus(panel);this.bus.emit("panel:restore",{id:panel.dataset.panel,panel})}
  maximize(panel=this.active){if(!panel)return;panel.hidden=false;panel.classList.remove("compacted","minimized");panel.classList.toggle("maximized");this.focus(panel);this.bus.emit("panel:maximize",{id:panel.dataset.panel,panel})}
  rotate(panel=this.active,degrees=0){if(!panel)return;panel.dataset.rotation=String(degrees);panel.style.rotate=`${degrees}deg`;this.bus.emit("panel:rotate",{id:panel.dataset.panel,degrees})}
  setScale(panel=this.active,width,height){if(!panel)return;panel.style.width=`${Math.max(260,width)}px`;panel.style.height=`${Math.max(170,height)}px`;this.bus.emit("panel:scale",{id:panel.dataset.panel,width,height})}
  reset(){qsa(".hud-panel",this.layer).forEach(p=>{p.classList.remove("maximized","minimized","compacted","active","air-grabbed");p.style.transform="";p.style.rotate="";p.dataset.rotation="0"});this.active=null;this.bus.emit("panels:reset",{})}
  visible(){return qsa(".hud-panel",this.layer).filter(p=>!p.hidden)}
}
