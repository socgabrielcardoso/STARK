const TYPE_SELECTORS=[
  ["spatial-group",".spatial-group"],["spatial",".spatial-object"],["file","[data-file-id]"],["data","[data-data-id]"],
  ["ip","[data-entity-type='ip']"],["device","[data-entity-type='device']"],["user","[data-entity-type='user']"],
  ["alert","[data-entity-type='alert']"],["incident","[data-entity-type='incident']"],["log","[data-entity-type='log']"],
  ["window",".hud-panel"],["compact-window","[data-compact-panel]"],["menu","[data-air-action]"]
];
export class ContextResolver{
  constructor(bus){this.bus=bus;this.current={type:"empty",target:null,entity:null}}
  resolve(target){
    if(!target)return{type:"empty",target:null,entity:null};
    for(const [type,selector] of TYPE_SELECTORS){const node=target.closest?.(selector);if(!node)continue;const resolved=node.dataset.entityType||type,entity={type:resolved,id:node.dataset.entityId||node.dataset.spatialId||node.dataset.fileId||node.dataset.dataId||node.dataset.panel||node.dataset.compactPanel||null,name:node.querySelector?.("strong")?.textContent||node.dataset.panel||null};return{type:resolved,target:node,entity}}
    return{type:"ui",target,entity:null};
  }
  update(target){const next=this.resolve(target);if(next.target!==this.current.target||next.type!==this.current.type){this.current=next;this.bus?.emit("interaction:context",next)}return next}
}
