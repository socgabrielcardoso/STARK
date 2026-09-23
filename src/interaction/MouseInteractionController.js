export class MouseInteractionController{
  constructor({bus,panelManager,spatial,activation,layer}){this.bus=bus;this.pm=panelManager;this.spatial=spatial;this.activation=activation;this.layer=layer;this.state=null;this.suppressClick=false;this.bound={}}
  start(){
    this.bound.down=e=>this.down(e);this.bound.move=e=>this.move(e);this.bound.up=e=>this.up(e);this.bound.click=e=>this.click(e);this.bound.dbl=e=>this.doubleClick(e);
    window.addEventListener("pointerdown",this.bound.down,{capture:true});window.addEventListener("pointermove",this.bound.move,{capture:true});
    window.addEventListener("pointerup",this.bound.up,{capture:true});window.addEventListener("click",this.bound.click,{capture:true});window.addEventListener("dblclick",this.bound.dbl,{capture:true});
    this.bus.emit("mouse:ready",{enabled:true});
  }
  mouse(e){return e.isTrusted&&(!e.pointerType||e.pointerType==="mouse")}
  payload(node){
    const type=node.dataset.airDraggable||"data",id=node.dataset.spatialId||node.dataset.spatialGroup||node.dataset.fileId||node.dataset.dataId||node.dataset.entityId;
    return{type,id,entityType:node.dataset.entityType||type,name:node.querySelector("strong,label")?.textContent||id||"Information"};
  }
  down(e){
    if(!this.mouse(e)||e.button!==0||!e.target.closest?.("#app"))return;
    const target=e.target,point={x:e.clientX,y:e.clientY},panel=target.closest(".hud-panel"),header=target.closest(".hud-panel__header"),resizer=target.closest(".panel-resizer");
    const spatial=target.closest(".spatial-object,.spatial-group,[data-spatial-adoptable='true']"),generic=target.closest("[data-air-draggable]");
    this.state={target,point,last:point,moved:false,mode:"pending",panel,spatial,generic,rect:panel?.getBoundingClientRect(),ghost:null,payload:null};
    if(header&&panel&&!panel.classList.contains("frozen")){this.pm.focus(panel);this.pm.drag.begin(panel,point);this.state.mode="panel";e.preventDefault()}
    else if(resizer&&panel){this.pm.focus(panel);this.state.mode="resize";e.preventDefault()}
  }
  move(e){
    if(!this.mouse(e)||!this.state)return;const p={x:e.clientX,y:e.clientY},s=this.state,d=Math.hypot(p.x-s.point.x,p.y-s.point.y);s.last=p;if(d>5)s.moved=true;
    if(s.mode==="pending"&&s.moved&&s.spatial){
      const payload=this.payload(s.spatial);this.spatial.beginGrab(s.spatial,payload,s.point);s.mode="spatial";s.payload=payload;
      this.bus.emit("air:grab-start",{payload,source:s.spatial,point:s.point,handId:"mouse",hand:{role:"primary",handId:"mouse"}});
    }else if(s.mode==="pending"&&s.moved&&s.generic){
      s.payload=this.payload(s.generic);s.ghost=document.createElement("div");s.ghost.className="air-grab-ghost";s.ghost.textContent=s.payload.name;document.body.append(s.ghost);s.mode="generic";
      s.generic.classList.add("air-grabbed");this.bus.emit("air:grab-start",{payload:s.payload,source:s.generic,point:s.point,handId:"mouse",hand:{role:"primary",handId:"mouse"}});
    }
    if(s.mode==="panel"){this.pm.drag.move(p,this.layer);e.preventDefault()}
    if(s.mode==="resize"&&s.panel){const w=Math.max(220,s.rect.width+(p.x-s.point.x)),h=Math.max(145,s.rect.height+(p.y-s.point.y));this.pm.setScale(s.panel,w,h);e.preventDefault()}
    if(s.mode==="spatial"){this.spatial.moveGrab(p);e.preventDefault()}
    if(s.mode==="generic"){s.ghost.style.left=p.x+"px";s.ghost.style.top=p.y+"px";document.querySelectorAll(".air-drop-target").forEach(x=>x.classList.remove("air-drop-target"));document.elementFromPoint(p.x,p.y)?.closest?.("[data-folder-name],[data-drop-path],[data-drop-lane],[data-investigation-lane],.hud-panel,.spatial-object")?.classList.add("air-drop-target");e.preventDefault()}
  }
  up(e){
    if(!this.mouse(e)||!this.state)return;const s=this.state,p={x:e.clientX,y:e.clientY},target=document.elementFromPoint(p.x,p.y);
    if(s.mode==="panel"){const panel=this.pm.drag.end();this.bus.emit("air:panel-release",{panel,velocity:{speed:0},handId:"mouse"});this.suppressClick=true}
    else if(s.mode==="spatial"){this.spatial.endGrab(p,target);this.bus.emit("air:grab-end",{payload:s.payload,target,point:p,handId:"mouse"});this.suppressClick=true}
    else if(s.mode==="generic"){s.generic.classList.remove("air-grabbed");s.ghost?.remove();document.querySelectorAll(".air-drop-target").forEach(x=>x.classList.remove("air-drop-target"));this.bus.emit("air:drop",{payload:s.payload,source:s.generic,target,point:p});this.bus.emit("air:grab-end",{payload:s.payload,target,point:p,handId:"mouse"});this.suppressClick=true}
    else if(s.mode==="resize")this.suppressClick=true;
    this.state=null;setTimeout(()=>this.suppressClick=false,0);
  }
  click(e){
    if(!e.isTrusted||!e.target.closest?.("#app")||this.suppressClick||e.button!==0)return;
    const relevant=e.target.closest("button,[data-air-action],.dock-btn,.panel-tool,.air-chip,.search-result,.vk-key,.compact-panel-pill,.spatial-recovery-chip,.spatial-object,.spatial-group,[data-spatial-adoptable='true'],[data-file-id],[data-data-id],[data-entity-id],.metric,.list-row,.log-line,.validation-cell,.donna-message,.hud-panel");
    if(!relevant)return;e.preventDefault();e.stopImmediatePropagation();this.activation.activate(relevant,{source:"mouse",point:{x:e.clientX,y:e.clientY}})
  }
  doubleClick(e){
    if(!e.isTrusted||!e.target.closest?.("#app"))return;const file=e.target.closest(".file-tile"),panel=e.target.closest(".hud-panel");
    if(file){e.preventDefault();e.stopImmediatePropagation();file.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true}))}
    else if(panel){e.preventDefault();e.stopImmediatePropagation();this.pm.maximize(panel)}
  }
  stop(){window.removeEventListener("pointerdown",this.bound.down,{capture:true});window.removeEventListener("pointermove",this.bound.move,{capture:true});window.removeEventListener("pointerup",this.bound.up,{capture:true});window.removeEventListener("click",this.bound.click,{capture:true});window.removeEventListener("dblclick",this.bound.dbl,{capture:true})}
}
