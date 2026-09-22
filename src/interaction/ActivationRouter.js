export class ActivationRouter{
  constructor({bus,contextResolver,panelManager,infoLens}){this.bus=bus;this.contextResolver=contextResolver;this.pm=panelManager;this.infoLens=infoLens}
  payload(node){
    const spatial=node?.closest?.(".spatial-object,.spatial-group");
    if(spatial)return{type:spatial.dataset.entityType||"spatial",id:spatial.dataset.spatialId||spatial.dataset.spatialGroup,name:spatial.querySelector("strong")?.textContent||"Spatial object",node:spatial};
    const resolved=this.contextResolver.resolve(node);
    if(resolved.entity)return{...resolved.entity,node:resolved.target};
    const adoptable=node?.closest?.("[data-spatial-adoptable='true'],.metric,.list-row,.log-line,.validation-cell,.donna-message");
    if(adoptable)return{type:adoptable.dataset.entityType||"data",id:adoptable.dataset.spatialId||null,name:adoptable.querySelector("strong,label")?.textContent||adoptable.textContent.trim().slice(0,80),node:adoptable};
    return null;
  }
  activate(node,{source="hands",point=null}={}){
    if(!node)return false;
    const direct=node.closest?.("button,[data-air-action],.dock-btn,.panel-tool,.air-chip,.search-result,.vk-key,.compact-panel-pill,.spatial-recovery-chip");
    if(direct){direct.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window}));this.bus.emit("activation:done",{source,node:direct,kind:"control"});return true}
    const panel=node.closest?.(".hud-panel");if(panel)this.pm.focus(panel);
    const payload=this.payload(node);
    if(payload){this.infoLens?.open(payload,point);this.bus.emit("activation:done",{source,node:payload.node,kind:"info",payload});return true}
    if(panel){this.pm.focus(panel);this.bus.emit("activation:done",{source,node:panel,kind:"panel"});return true}
    return false;
  }
  at(point,options={}){if(!point)return false;return this.activate(document.elementFromPoint(point.x,point.y),{...options,point})}
}
