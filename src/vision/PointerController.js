import {clamp} from "../utils/math.js";
export class PointerController{
  constructor({bus,panelManager,cursor}){this.bus=bus;this.pm=panelManager;this.cursor=cursor;this.dragging=null;this.scale=null;this.two=false}
  start(){
    this.bus.on("gestures:frame",({hands})=>this.render(hands[0]));
    this.bus.on("gesture:pinch:start",g=>this.begin(g));
    this.bus.on("gesture:pinch",g=>this.move(g));
    this.bus.on("gesture:pinch:end",()=>this.end());
    this.bus.on("gesture:two-pinch",g=>this.resize(g));
    this.bus.on("gesture:two-pinch-end",()=>this.endResize());
    this.bus.on("gesture:minimize-active",()=>this.pm.minimize());
    this.bus.on("gesture:home",()=>this.pm.reset());
  }
  xy(g){return{x:g.tip.x*innerWidth,y:g.tip.y*innerHeight}}
  render(g){
    if(!g){this.cursor.classList.remove("visible");return}
    this.cursor.classList.add("visible");this.cursor.classList.toggle("pinching",g.name==="pinch");
    this.cursor.style.left=`${g.tip.x*innerWidth}px`;this.cursor.style.top=`${g.tip.y*innerHeight}px`;
    this.cursor.querySelector(".gesture-cursor__label").textContent=g.name.toUpperCase();
  }
  begin(g){
    if(this.two)return;const p=this.xy(g),target=document.elementFromPoint(p.x,p.y);if(!target)return;
    const action=target.closest("button,[data-gesture-click],.file-tile");
    if(action){action.dispatchEvent(new PointerEvent("pointerup",{bubbles:true}));action.dispatchEvent(new MouseEvent("click",{bubbles:true}));return}
    const panel=target.closest(".hud-panel");if(panel){this.pm.focus(panel);if(target.closest(".hud-panel__header")){this.dragging=panel;this.pm.drag.begin(panel,p)}}
  }
  move(g){if(this.dragging&&!this.two)this.pm.drag.move(this.xy(g),document.documentElement)}
  end(){this.pm.drag.end();this.dragging=null}
  resize(g){
    const panel=this.pm.active;if(!panel)return;this.two=true;this.dragging=null;this.pm.drag.end();
    const rect=panel.getBoundingClientRect();
    if(!this.scale)this.scale={panel,d:g.distance,w:rect.width,h:rect.height};
    const ratio=clamp(g.distance/Math.max(this.scale.d,.01),.55,2.1);
    panel.style.width=`${Math.max(260,this.scale.w*ratio)}px`;panel.style.height=`${Math.max(170,this.scale.h*ratio)}px`;
  }
  endResize(){this.two=false;this.scale=null}
}
