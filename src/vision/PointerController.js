import {clamp} from "../utils/math.js";
export class PointerController{
  constructor({bus,panelManager,cursor,layer,contextResolver,precision,spatial,focus}){
    this.bus=bus;this.pm=panelManager;this.cursor=cursor;this.layer=layer;this.contextResolver=contextResolver;this.precision=precision;this.spatial=spatial;this.focus=focus;
    this.panelDrag=null;this.objectDrag=null;this.transform=null;this.two=false;this.hovered=null;this.primaryHand=null;this.lastPoint={x:.5,y:.5};this.region={minX:0,maxX:1,minY:0,maxY:1};
  }
  start(){
    this.bus.on("gestures:frame",({hands})=>this.onFrame(hands));
    this.bus.on("intent:select-start",x=>this.begin(x.payload));this.bus.on("intent:double-select",x=>this.doubleSelect(x.payload));
    this.bus.on("intent:select-hold",x=>this.move(x.payload));this.bus.on("intent:select-end",x=>this.end(x.payload));
    this.bus.on("intent:transform",x=>this.twoPinch(x.payload));this.bus.on("intent:transform-end",()=>this.endTwoPinch());
    this.bus.on("calibration:profile",p=>{if(p?.region)this.region=p.region});
  }
  normalized(g){
    const raw={x:clamp(g?.tip?.x??this.lastPoint.x,0,1),y:clamp(g?.tip?.y??this.lastPoint.y,0,1)},r=this.region;
    const calibrated={x:clamp((raw.x-r.minX)/Math.max(.001,r.maxX-r.minX),0,1),y:clamp((raw.y-r.minY)/Math.max(.001,r.maxY-r.minY),0,1)};
    const mapped=this.precision?.map(calibrated,this.lastPoint)||calibrated;this.lastPoint=mapped;return mapped;
  }
  xy(g){const p=this.normalized(g);return{x:p.x*innerWidth,y:p.y*innerHeight}}
  choosePrimary(hands){if(!hands.length)return null;if(this.panelDrag||this.objectDrag)return hands.find(h=>h.handId===this.primaryHand)||hands.find(h=>h.role==="primary")||null;return hands.find(h=>h.role==="primary")||null}
  onFrame(hands){
    const g=this.choosePrimary(hands);this.render(g);
    if(g&&this.panelDrag&&g.name==="pinch")this.pm.drag.move(this.xy(g),this.layer);
    if(g&&this.objectDrag&&g.name==="pinch"){const p=this.xy(g);this.objectDrag.liveSpatial?this.spatial.moveGrab(p):this.moveGhost(p)}
  }
  render(g){
    if(!g){this.cursor.classList.remove("visible");this.clearHover();return}
    this.cursor.classList.add("visible");this.cursor.classList.toggle("pinching",g.name==="pinch");const point=this.xy(g);
    this.cursor.style.left=`${point.x}px`;this.cursor.style.top=`${point.y}px`;this.cursor.querySelector(".gesture-cursor__label").textContent=`PRIMARY · ${g.name.toUpperCase()}`;
    const target=document.elementFromPoint(point.x,point.y),context=this.contextResolver?.update(target)||{type:"ui",target};
    const hot=target?.closest?.("button,.file-tile,.data-card,.hud-panel__header,[data-air-action],[data-context-action],.investigation-card,.metric,.list-row,.log-line,.validation-cell,.donna-message");
    if(hot!==this.hovered){this.clearHover();this.hovered=hot;this.hovered?.classList.add("air-hover")}
    this.bus.emit("air:hover",{target,type:context.type,entity:context.entity,point,hand:g});
  }
  clearHover(){this.hovered?.classList.remove("air-hover");this.hovered=null}
  begin(g){
    if(!g||g.role!=="primary"||this.two)return;this.primaryHand=g.handId;const point=this.xy(g),target=document.elementFromPoint(point.x,point.y);if(!target)return;
    const direct=target.closest("[data-air-action],.dock-btn,.panel-tool,.air-chip,.search-result,.vk-key,.compact-panel-pill,.spatial-recovery-chip");
    if(direct){this.activate(direct);return}
    const draggable=target.closest("[data-air-draggable]");
    if(draggable?.dataset.airDraggable){
      const type=draggable.dataset.airDraggable,id=draggable.dataset.spatialId||draggable.dataset.spatialGroup||draggable.dataset.fileId||draggable.dataset.dataId||draggable.dataset.entityId;
      const entityType=draggable.dataset.entityType||type,payload={type,id,entityType,name:draggable.querySelector("strong")?.textContent||id};
      if(type==="spatial"||type==="spatial-group"||draggable.dataset.spatialAdoptable==="true"){
        const node=this.spatial.beginGrab(draggable,payload,point);this.objectDrag={source:draggable,payload,handId:g.handId,start:point,last:point,moved:false,liveSpatial:true,node};this.bus.emit("air:grab-start",{payload,source:node||draggable,point,hand:g,handId:g.handId});return;
      }
      this.objectDrag={source:draggable,payload,handId:g.handId,start:point,last:point,moved:false,liveSpatial:false,ghost:this.makeGhost(draggable,point)};
      draggable.classList.add("air-grabbed");this.bus.emit("air:grab-start",{payload,source:draggable,point,hand:g,handId:g.handId});return;
    }
    const panel=target.closest(".hud-panel");
    if(panel&&!panel.classList.contains("frozen")){this.pm.focus(panel);if(target.closest(".hud-panel__header")){this.panelDrag=panel;this.pm.drag.begin(panel,point);this.bus.emit("air:panel-grab",{id:panel.dataset.panel,panel,point,hand:g,handId:g.handId})}}
  }
  doubleSelect(g){
    if(!g||g.role!=="primary")return;const p=this.xy(g),target=document.elementFromPoint(p.x,p.y);if(!target)return;
    const floating=target.closest(".spatial-object,.spatial-group");if(floating){this.focus?.set(floating,{type:floating.dataset.entityType||"spatial",id:floating.dataset.spatialId||floating.dataset.spatialGroup},"LOCAL",g.handId,"TARGETED");return}
    const tile=target.closest(".file-tile,.data-card,.search-result,.investigation-card");if(tile){tile.dispatchEvent(new MouseEvent("click",{bubbles:true}));return}
    const panel=target.closest(".hud-panel");if(panel){this.pm.focus(panel);this.pm.maximize(panel)}
  }
  move(g){
    if(!g||g.role!=="primary"||g.handId!==this.primaryHand||this.two)return;const point=this.xy(g);
    if(this.panelDrag)this.pm.drag.move(point,this.layer);
    if(this.objectDrag){this.objectDrag.last=point;this.objectDrag.moved=this.objectDrag.moved||Math.hypot(point.x-this.objectDrag.start.x,point.y-this.objectDrag.start.y)>16;this.objectDrag.liveSpatial?this.spatial.moveGrab(point):this.moveGhost(point)}
  }
  moveGhost(point){
    const d=this.objectDrag;if(!d?.ghost)return;d.last=point;d.ghost.style.left=`${point.x}px`;d.ghost.style.top=`${point.y}px`;
    const target=document.elementFromPoint(point.x,point.y);document.querySelectorAll(".air-drop-target").forEach(x=>x.classList.remove("air-drop-target"));
    target?.closest?.("[data-folder-name],[data-drop-path],[data-drop-lane],[data-context-action],[data-investigation-lane],.hud-panel,.spatial-object")?.classList.add("air-drop-target");
  }
  end(g){
    if(g?.role&&g.role!=="primary")return;
    if(this.panelDrag){const panel=this.pm.drag.end(),motion=g?.motion||{};this.panelDrag=null;if(motion.speed>1.55&&(this.lastPoint.x<.08||this.lastPoint.x>.92))this.pm.minimize(panel);this.bus.emit("air:panel-release",{panel,velocity:motion,handId:g?.handId||this.primaryHand})}
    const d=this.objectDrag;
    if(d){
      const point=d.last||this.xy(g),target=document.elementFromPoint(point.x,point.y);
      if(d.liveSpatial)this.spatial.endGrab(point,target);
      else{
        const contextAction=target?.closest?.("[data-context-action]")?.dataset.contextAction;
        const specialTarget=target?.closest?.("[data-folder-name],[data-drop-path],[data-drop-lane],[data-investigation-lane]");
        const thrown=(g?.motion?.speed||0)>1.55;
        d.source.classList.remove("air-grabbed");d.ghost?.remove();document.querySelectorAll(".air-drop-target").forEach(x=>x.classList.remove("air-drop-target"));
        if(contextAction)this.bus.emit("context-action:execute",{action:contextAction,payload:d.payload,target,point});
        else if(thrown&&point.x<innerWidth*.08)this.bus.emit("context-action:execute",{action:"archive",payload:d.payload,target,point});
        else if(thrown&&point.x>innerWidth*.92)this.bus.emit("context-action:execute",{action:"trash",payload:d.payload,target,point});
        else if(specialTarget)this.bus.emit("air:drop",{payload:d.payload,source:d.source,target,point});
        else if(d.moved)this.spatial.promote(d.source,d.payload,point,target);
        else d.source.dispatchEvent(new MouseEvent("click",{bubbles:true}));
      }
      this.bus.emit("air:grab-end",{payload:d.payload,target,point,handId:d.handId});this.objectDrag=null;
    }
    this.primaryHand=null;
  }
  twoPinch(g){
    if(!g?.rolesValid)return;this.two=true;this.pm.drag.end();this.panelDrag=null;
    if(this.spatial?.focused&&this.spatial.transform(g))return;
    const panel=this.pm.active;if(!panel||panel.classList.contains("frozen"))return;
    const center={x:g.center.x*innerWidth,y:g.center.y*innerHeight},rect=panel.getBoundingClientRect();
    if(!this.transform)this.transform={panel,startDistance:g.distance,startAngle:g.angle,width:rect.width,height:rect.height,rotation:Number(panel.dataset.rotation||0)};
    const ratio=clamp(g.distance/Math.max(.01,this.transform.startDistance),.55,2.15),rotation=this.transform.rotation+(g.angle-this.transform.startAngle)*180/Math.PI;
    this.pm.setScale(panel,this.transform.width*ratio,this.transform.height*ratio);this.pm.rotate(panel,clamp(rotation,-28,28));
    const bounds=this.layer.getBoundingClientRect();panel.style.left=`${clamp(center.x-bounds.left-panel.offsetWidth/2,0,Math.max(0,bounds.width-panel.offsetWidth))}px`;panel.style.top=`${clamp(center.y-bounds.top-panel.offsetHeight/2,0,Math.max(0,bounds.height-panel.offsetHeight))}px`;panel.classList.add("air-transforming");
  }
  endTwoPinch(){this.spatial?.endTransform();this.transform?.panel?.classList.remove("air-transforming");this.two=false;this.transform=null}
  cancel(){
    if(this.objectDrag?.liveSpatial)this.spatial.cancelGrab();else{this.objectDrag?.ghost?.remove();this.objectDrag?.source?.classList.remove("air-grabbed")}this.objectDrag=null;
    if(this.panelDrag)this.pm.drag.end();this.panelDrag=null;this.primaryHand=null;this.two=false;return true;
  }
  activate(node){node.classList.add("air-activated");setTimeout(()=>node.classList.remove("air-activated"),180);node.dispatchEvent(new MouseEvent("click",{bubbles:true}));this.bus.emit("air:activate",{node,action:node.dataset.airAction||node.dataset.panel||node.dataset.action||node.dataset.compactPanel||node.dataset.spatialRestore})}
  makeGhost(source,point){const ghost=document.createElement("div");ghost.className="air-grab-ghost";ghost.textContent=source.querySelector("strong")?.textContent||"OBJECT";ghost.style.left=`${point.x}px`;ghost.style.top=`${point.y}px`;document.body.append(ghost);return ghost}
}
