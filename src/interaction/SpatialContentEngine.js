import {el} from "../utils/dom.js";
import {CONFIG} from "../config.js";
const KEY="stark-spatial-content-v3";
const CANDIDATES=".metric,.list-row,.log-line,.validation-cell,.donna-message";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hash(text){let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
export class SpatialContentEngine{
  constructor({bus,root,panelLayer,history}){
    this.bus=bus;this.root=root;this.panelLayer=panelLayer;this.history=history;this.layer=null;this.recovery=null;this.grab=null;this.focused=null;this.observer=null;this.restoreRecords=[];this.detachedOrigins=new Set();
  }
  mount(){
    this.layer=el("section",{class:"spatial-object-layer","aria-label":"Floating information workspace"});
    this.recovery=el("aside",{class:"spatial-recovery-dock","aria-label":"Recovery"});
    this.root.append(this.layer,this.recovery);
    this.decorateAll();this.restorePersisted();
    let pending=false;
    this.observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;this.decorateAll()})});
    this.observer.observe(this.panelLayer,{childList:true,subtree:true});
    this.bus.on("focus:change",x=>{const node=x.target?.closest?.(".spatial-object,.spatial-group");if(node)this.focused=node});
    this.bus.on("spatial:context-action",x=>this.contextAction(x));
    this.bus.on("spatial:restore",x=>this.restore(x?.id||x));
    this.bus.on("spatial:collapse-group",()=>this.toggleGroup());
    return this;
  }
  inferType(node){
    if(node.dataset.entityType)return node.dataset.entityType;
    if(node.classList.contains("log-line"))return"log";
    if(node.classList.contains("metric"))return"metric";
    if(node.classList.contains("validation-cell"))return"data";
    return"data";
  }
  decorateAll(){document.querySelectorAll(".hud-panel").forEach(p=>this.decoratePanel(p))}
  decoratePanel(panel){
    const body=panel.querySelector(".hud-panel__body");if(!body)return;
    let slot=body.querySelector(":scope > .panel-spatial-slot");
    if(!slot){slot=el("div",{class:"panel-spatial-slot",dataset:{spatialContainer:panel.dataset.panel}});body.append(slot)}
    [...body.querySelectorAll(CANDIDATES)].forEach((node,index)=>{
      if(node.closest(".panel-spatial-slot,.spatial-object,.spatial-group"))return;
      const text=node.textContent.replace(/\s+/g," ").trim();if(!text||text.length>500)return;
      const id=node.dataset.spatialId||("s-"+hash(panel.dataset.panel+"|"+text+"|"+index));
      node.dataset.spatialId=id;node.dataset.spatialAdoptable="true";node.dataset.originPanel=panel.dataset.panel;
      node.dataset.entityType=node.dataset.entityType||this.inferType(node);
      if(!node.dataset.airDraggable)node.dataset.airDraggable="spatial";
      if(this.detachedOrigins.has(id)||this.restoreRecords.some(r=>r.originId===id&&!r.restored))node.classList.add("spatial-source-detached");
    });
  }
  metaFrom(source,payload={}){
    const text=source?.textContent?.replace(/\s+/g," ").trim()||payload.name||payload.id||"Information";
    const strong=source?.querySelector?.("strong")?.textContent?.trim();
    const label=strong||source?.querySelector?.("label")?.textContent?.trim()||payload.name||text.slice(0,60);
    const detail=text===label?"":text.replace(label,"").trim().slice(0,220);
    return{
      id:payload.spatialId||source?.dataset?.spatialFloatId||("float-"+hash((source?.dataset?.spatialId||payload.id||text)+"|"+Date.now())),
      originId:source?.dataset?.spatialId||payload.id||null,originPanel:source?.closest?.(".hud-panel")?.dataset.panel||source?.dataset?.originPanel||null,
      entityType:payload.entityType||source?.dataset?.entityType||payload.type||"data",label,detail,originalType:payload.type||"spatial"
    };
  }
  createCard(meta){
    const card=el("article",{class:"spatial-object",dataset:{airDraggable:"spatial",spatialId:meta.id,entityId:meta.id,entityType:meta.entityType,originId:meta.originId||"",originPanel:meta.originPanel||"",groupId:meta.groupId||""}},
      el("div",{class:"spatial-object__mark"},"◇"),el("div",{class:"spatial-object__copy"},el("strong",{},meta.label),meta.detail?el("small",{},meta.detail):""));
    card.__meta=meta;return card;
  }
  beginGrab(source,payload,point){
    let node=source.closest?.(".spatial-object,.spatial-group");
    let created=false;
    if(!node){const meta=this.metaFrom(source,payload);node=this.createCard(meta);created=true;source.dataset.spatialFloatId=meta.id;source.classList.add("spatial-source-detached");if(meta.originId)this.detachedOrigins.add(meta.originId);source.setAttribute("aria-label","Detached: "+meta.label);this.layer.append(node)}
    const oldGroup=node.classList.contains("spatial-object")?node.closest(".spatial-group"):null;const rect=node.getBoundingClientRect();
    if(node.parentElement!==this.layer){this.layer.append(node);node.classList.remove("docked","group-member");delete node.dataset.groupId}
    if(oldGroup){const remaining=oldGroup.querySelectorAll(".spatial-object");if(remaining.length<2){remaining.forEach(n=>{const nr=n.getBoundingClientRect();this.layer.append(n);n.classList.remove("group-member");delete n.dataset.groupId;n.style.position="fixed";n.style.left=nr.left+"px";n.style.top=nr.top+"px"});oldGroup.remove()}}
    node.style.position="fixed";node.style.left=rect.left+"px";node.style.top=rect.top+"px";node.style.width=Math.max(150,rect.width)+"px";node.style.height="auto";
    node.classList.add("spatial-grabbed");this.focused=node;
    this.grab={node,source,payload,created,start:{x:point.x,y:point.y,left:rect.left,top:rect.top},last:point};
    document.documentElement.classList.add("spatial-drag-active");this.showDestinations(node);
    this.bus.emit("spatial:grab-start",{node,meta:node.__meta||payload});return node;
  }
  moveGrab(point){
    if(!this.grab)return;this.grab.last=point;const node=this.grab.node,rect=node.getBoundingClientRect();
    node.style.left=(point.x-rect.width/2)+"px";node.style.top=(point.y-rect.height/2)+"px";
    this.previewDestination(point,node);
  }
  endGrab(point,target){
    if(!this.grab)return null;const g=this.grab,node=g.node;
    node.classList.remove("spatial-grabbed");document.documentElement.classList.remove("spatial-drag-active");this.clearSuggestions();
    const panel=target?.closest?.(".hud-panel"),direct=target?.closest?.(".spatial-object"),other=direct&&direct!==node?direct:this.nearestObject(point,node);
    if(target?.closest?.(".spatial-recovery-dock"))this.trash(node);
    else if(panel&&!node.closest(".hud-panel"))this.dock(node,panel);
    else if(other&&other!==node)this.group(node,other);
    else this.placeFree(node,point);
    this.grab=null;this.save();this.bus.emit("spatial:drop",{node,target,panel});return node;
  }
  cancelGrab(){
    const g=this.grab;if(!g)return false;const node=g.node;
    node.classList.remove("spatial-grabbed");this.clearSuggestions();document.documentElement.classList.remove("spatial-drag-active");
    if(g.created){node.remove();g.source?.classList.remove("spatial-source-detached");delete g.source?.dataset?.spatialFloatId}
    else{node.style.left=g.start.left+"px";node.style.top=g.start.top+"px"}
    this.grab=null;document.documentElement.classList.remove("spatial-drag-active");this.bus.emit("spatial:cancelled",{});return true;
  }
  promote(source,payload,point,target=null){
    const node=this.beginGrab(source,{...payload,spatialId:source?.dataset?.spatialFloatId},point);
    this.moveGrab(point);return this.endGrab(point,target||document.elementFromPoint(point.x,point.y))||node;
  }
  dock(node,panel){
    const slot=panel.querySelector(".panel-spatial-slot");if(!slot)return this.placeFree(node,{x:node.offsetLeft,y:node.offsetTop});
    node.style.position="relative";node.style.left="";node.style.top="";node.style.width="";node.style.height="";node.style.rotate="";node.classList.add("docked");slot.append(node);
    slot.classList.add("has-items");panel.classList.add("has-spatial-items");this.bus.emit("spatial:docked",{id:node.dataset.spatialId,panel:panel.dataset.panel});
  }
  placeFree(node,point){
    if(node.closest(".spatial-group"))this.layer.append(node);
    if(node.parentElement!==this.layer)this.layer.append(node);
    node.classList.remove("docked","group-member");node.style.position="fixed";
    const worldX=innerWidth*CONFIG.virtualWorldX,worldY=innerHeight*CONFIG.virtualWorldY;let x=clamp(Math.round((point.x-90)/18)*18,-worldX,innerWidth+worldX-Math.max(180,node.offsetWidth)),y=clamp(Math.round((point.y-40)/18)*18,-worldY,innerHeight+worldY-Math.max(90,node.offsetHeight));
    for(let tries=0;tries<12;tries++){const overlap=[...this.layer.querySelectorAll(".spatial-object,.spatial-group")].some(o=>o!==node&&this.overlaps(x,y,node.offsetWidth||180,node.offsetHeight||72,o.getBoundingClientRect()));if(!overlap)break;x=clamp(x+24,-worldX,innerWidth+worldX-210);y=clamp(y+20,-worldY,innerHeight+worldY-130)}
    node.style.left=x+"px";node.style.top=y+"px";this.bus.emit("spatial:floating",{id:node.dataset.spatialId,x,y});this.autoDensity();
  }
  overlaps(x,y,w,h,r){return!(x+w+8<r.left||x>r.right+8||y+h+8<r.top||y>r.bottom+8)}
  nearestObject(point,node,maxDistance=112){let best=null,bestDistance=maxDistance;for(const other of document.querySelectorAll(".spatial-object")){if(other===node)continue;const r=other.getBoundingClientRect(),d=Math.hypot(point.x-(r.left+r.width/2),point.y-(r.top+r.height/2));if(d<bestDistance){best=other;bestDistance=d}}return best}
  group(a,b){
    const existing=b.closest(".spatial-group");let group=existing;
    if(!group){const br=b.getBoundingClientRect();group=el("section",{class:"spatial-group",dataset:{airDraggable:"spatial-group",spatialGroup:"g-"+Date.now(),entityType:"spatial-group"}},el("div",{class:"spatial-group__bar"},el("strong",{},"GROUP"),el("small",{},"2 ITEMS")),el("div",{class:"spatial-group__items"}));this.layer.append(group);group.style.position="fixed";group.style.left=br.left+"px";group.style.top=br.top+"px";group.querySelector(".spatial-group__items").append(b);b.classList.add("group-member");b.style.cssText=""}
    group.querySelector(".spatial-group__items").append(a);a.classList.add("group-member");a.style.cssText="";
    const count=group.querySelectorAll(".spatial-object").length;group.querySelector(".spatial-group__bar small").textContent=count+" ITEMS";
    [...group.querySelectorAll(".spatial-object")].forEach(n=>n.dataset.groupId=group.dataset.spatialGroup);this.focused=group;this.bus.emit("spatial:grouped",{group:group.dataset.spatialGroup,count});
  }
  separate(node,point){
    const group=node.closest(".spatial-group");if(!group)return false;this.layer.append(node);node.classList.remove("group-member");delete node.dataset.groupId;this.placeFree(node,point);
    const left=group.querySelectorAll(".spatial-object");if(left.length<2){left.forEach(n=>{this.layer.append(n);n.classList.remove("group-member");delete n.dataset.groupId;this.placeFree(n,{x:group.offsetLeft+40,y:group.offsetTop+70})});group.remove()}
    return true;
  }
  toggleGroup(group=this.focused?.closest?.(".spatial-group")){if(!group)return false;group.classList.toggle("collapsed");this.bus.emit("spatial:group-collapse",{id:group.dataset.spatialGroup,collapsed:group.classList.contains("collapsed")});this.save();return true}
  shrinkFocused(){
    const node=this.focused;if(!node)return false;if(node.classList.contains("spatial-group"))return this.toggleGroup(node);
    const w=Math.max(130,(node.getBoundingClientRect().width||180)*.78);node.style.width=w+"px";node.classList.add("spatial-compact");this.save();return true;
  }
  beginTransform(g){
    const node=this.focused;if(!node||!g)return false;const rect=node.getBoundingClientRect();
    if(!node.__transform)node.__transform={distance:g.distance,angle:g.angle,width:rect.width,height:rect.height,rotation:Number(node.dataset.rotation||0)};
    return true;
  }
  transform(g){
    const node=this.focused;if(!this.beginTransform(g))return false;const t=node.__transform,ratio=clamp(g.distance/Math.max(.01,t.distance),.55,2.2),rotation=clamp(t.rotation+(g.angle-t.angle)*180/Math.PI,-28,28);
    node.style.width=Math.max(130,t.width*ratio)+"px";node.style.minHeight=Math.max(54,t.height*ratio)+"px";node.style.rotate=rotation+"deg";node.dataset.rotation=String(rotation);
    const cx=g.center.x*innerWidth,cy=g.center.y*innerHeight;node.style.position="fixed";if(node.parentElement!==this.layer)this.layer.append(node);
    const wx=innerWidth*CONFIG.virtualWorldX,wy=innerHeight*CONFIG.virtualWorldY;node.style.left=clamp(cx-node.offsetWidth/2,-wx,innerWidth+wx-node.offsetWidth)+"px";node.style.top=clamp(cy-node.offsetHeight/2,-wy,innerHeight+wy-node.offsetHeight)+"px";node.classList.add("air-transforming");return true;
  }
  endTransform(){const node=this.focused;if(!node)return;node.classList.remove("air-transforming");delete node.__transform;this.save()}
  trash(nodeOrId){
    const node=typeof nodeOrId==="string"?document.querySelector('.spatial-object[data-spatial-id="'+CSS.escape(nodeOrId)+'"]'):nodeOrId;if(!node)return false;
    const meta=node.__meta||{id:node.dataset.spatialId,label:node.querySelector("strong")?.textContent||"Information",originId:node.dataset.originId,originPanel:node.dataset.originPanel,entityType:node.dataset.entityType};
    this.restoreRecords.push({...meta,trashed:true,restored:false});node.remove();this.renderRecovery();this.save();this.bus.emit("spatial:trashed",{id:meta.id});return true;
  }
  restore(id){
    const i=this.restoreRecords.findIndex(r=>r.id===id);if(i<0)return false;const record=this.restoreRecords.splice(i,1)[0];
    const source=document.querySelector('[data-spatial-id="'+CSS.escape(record.originId||"")+'"]');if(source){source.classList.remove("spatial-source-detached");delete source.dataset.spatialFloatId;if(record.originId)this.detachedOrigins.delete(record.originId)}
    else{const card=this.createCard(record);this.layer.append(card);this.placeFree(card,{x:innerWidth*.5,y:innerHeight*.5})}
    this.renderRecovery();this.save();this.bus.emit("spatial:restored",{id});return true;
  }
  contextAction({action,payload}){const id=payload?.id||payload?.spatialId;if(action==="trash"||action==="archive")this.trash(id);if(action==="restore")this.restore(id)}
  showDestinations(){document.querySelectorAll(".panel-spatial-slot").forEach(x=>x.classList.add("spatial-slot-ready"));this.recovery.classList.add("ready")}
  previewDestination(point,node){
    this.clearSuggestions(false);const target=document.elementFromPoint(point.x,point.y),panel=target?.closest?.(".hud-panel"),other=target?.closest?.(".spatial-object");
    if(panel)panel.querySelector(".panel-spatial-slot")?.classList.add("spatial-suggest");else{const near=other&&other!==node?other:this.nearestObject(point,node);if(near)near.classList.add("spatial-suggest")}
  }
  clearSuggestions(removeReady=true){document.querySelectorAll(".spatial-suggest").forEach(x=>x.classList.remove("spatial-suggest"));if(removeReady){document.querySelectorAll(".spatial-slot-ready").forEach(x=>x.classList.remove("spatial-slot-ready"));this.recovery.classList.remove("ready")}}
  autoDensity(){const count=this.layer.querySelectorAll(":scope > .spatial-object,:scope > .spatial-group").length;document.documentElement.classList.toggle("spatial-density-high",count>8)}
  save(){
    const objects=[...document.querySelectorAll(".spatial-object")].map(node=>{const r=node.getBoundingClientRect();return{...(node.__meta||{}),id:node.dataset.spatialId,originId:node.dataset.originId||null,originPanel:node.dataset.originPanel||null,entityType:node.dataset.entityType||"data",label:node.querySelector("strong")?.textContent||"Information",detail:node.querySelector("small")?.textContent||"",dockedPanel:node.closest(".hud-panel")?.dataset.panel||null,left:r.left,top:r.top,width:r.width,rotation:Number(node.dataset.rotation||0),groupId:node.dataset.groupId||null,restored:false}});try{localStorage.setItem(KEY,JSON.stringify({objects,recovery:this.restoreRecords}))}catch{}
  }
  restorePersisted(){
    let state=null;try{state=JSON.parse(localStorage.getItem(KEY)||"null")}catch{}if(!state)return;this.restoreRecords=state.recovery||[];this.detachedOrigins=new Set((state.objects||[]).map(x=>x.originId).filter(Boolean).concat(this.restoreRecords.map(x=>x.originId).filter(Boolean)));
    for(const record of state.objects||[]){const card=this.createCard(record);const source=document.querySelector('[data-spatial-id="'+CSS.escape(record.originId||"")+'"]');source?.classList.add("spatial-source-detached");
      if(record.dockedPanel){const panel=document.querySelector('.hud-panel[data-panel="'+CSS.escape(record.dockedPanel)+'"]');if(panel)this.dock(card,panel);else this.layer.append(card)}
      else{this.layer.append(card);card.style.position="fixed";card.style.left=record.left+"px";card.style.top=record.top+"px";card.style.width=Math.max(130,record.width||180)+"px";card.style.rotate=(record.rotation||0)+"deg"}
    }
    const groups=new Map();for(const card of this.layer.querySelectorAll(".spatial-object[data-group-id]")){const id=card.dataset.groupId;if(!id)continue;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(card)}
    for(const cards of groups.values())if(cards.length>1){const first=cards[0],second=cards[1];this.group(first,second);const group=second.closest(".spatial-group")||first.closest(".spatial-group");for(const extra of cards.slice(2)){group.querySelector(".spatial-group__items").append(extra);extra.classList.add("group-member");extra.style.cssText=""}}
    this.renderRecovery();this.autoDensity();
  }
  renderRecovery(){
    this.recovery.replaceChildren();if(!this.restoreRecords.length){this.recovery.classList.remove("visible");return}
    this.recovery.classList.add("visible");this.recovery.append(el("strong",{class:"spatial-recovery-title"},"RECOVERY"));
    this.restoreRecords.slice(-6).forEach(r=>{const b=el("button",{class:"spatial-recovery-chip",type:"button",dataset:{airAction:"spatial-restore",spatialRestore:r.id}},r.label||r.id);b.addEventListener("click",e=>{if(e.isTrusted)return;this.restore(r.id)});this.recovery.append(b)})
  }
}
