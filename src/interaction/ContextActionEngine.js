import {el,clear} from "../utils/dom.js";
const CATALOG={
  window:[["maximize","EXPAND"],["minimize","MINIMIZE"],["pin","PIN"],["freeze","FREEZE"],["duplicate","DUPLICATE"],["close","CLOSE"]],
  spatial:[["inspect","INSPECT"],["link","LINK"],["favorite","FAVORITE"],["archive","RECOVER LATER"],["trash","REMOVE"]],
  "spatial-group":[["inspect","GROUP"],["archive","COLLAPSE"],["trash","REMOVE"]],
  file:[["open","OPEN"],["move","MOVE"],["favorite","FAVORITE"],["archive","ARCHIVE"],["trash","TRASH"]],
  data:[["inspect","INSPECT"],["link","LINK"],["favorite","FAVORITE"],["archive","ARCHIVE"],["trash","TRASH"]],
  ip:[["inspect","IP DETAILS"],["timeline","TIMELINE"],["connections","CONNECTIONS"],["link","LINK"],["favorite","FAVORITE"]],
  alert:[["investigate","INVESTIGATE"],["timeline","TIMELINE"],["link","LINK"],["archive","ARCHIVE"]],
  incident:[["investigate","INVESTIGATE"],["evidence","EVIDENCE"],["timeline","TIMELINE"],["link","LINK"],["archive","ARCHIVE"]],
  device:[["inspect","DEVICE"],["connections","CONNECTIONS"],["events","EVENTS"],["timeline","TIMELINE"],["link","LINK"]],
  user:[["inspect","USER"],["events","EVENTS"],["timeline","TIMELINE"],["link","LINK"]],
  log:[["inspect","DETAILS"],["evidence","EVIDENCE"],["timeline","TIMELINE"],["archive","ARCHIVE"]]
};
export class ContextActionEngine{
  constructor(bus,objectManager=null){this.bus=bus;this.objectManager=objectManager;this.root=null;this.payload=null}
  mount(root){this.root=el("section",{class:"context-zones"});root.append(this.root);this.bus.on("air:grab-start",x=>this.show(x.payload));this.bus.on("air:grab-end",()=>this.hide());this.bus.on("context-actions:open",x=>this.show(x));this.bus.on("context-action:execute",x=>this.execute(x));return this.root}
  actionsFor(payload){return CATALOG[payload?.entityType]||CATALOG[payload?.type]||CATALOG.data}
  show(payload){this.payload=payload;clear(this.root);this.root.classList.add("visible");const actions=this.actionsFor(payload);actions.slice(0,5).forEach(([action,label],i)=>this.root.append(el("div",{class:`context-zone context-zone--${i}`,dataset:{contextAction:action}},el("strong",{},label),el("small",{},this.describe(action,payload)))));this.bus.emit("context-actions:show",{payload,actions:actions.map(x=>x[0])})}
  hide(){this.root?.classList.remove("visible");if(this.root)clear(this.root);this.payload=null}
  execute({action,payload}){
    const entityType=payload?.entityType||payload?.type||"data";
    if(entityType==="window"){const map={maximize:"window:maximize",minimize:"window:minimize",pin:"window:pin",freeze:"window:freeze",duplicate:"window:duplicate",close:"window:close"};if(map[action])this.bus.emit(map[action],payload)}
    if(entityType==="spatial"||entityType==="spatial-group"||payload?.type==="spatial"){if(action==="archive"&&entityType==="spatial-group")this.bus.emit("spatial:collapse-group",payload);else this.bus.emit("spatial:context-action",{action,payload})}
    if(action==="favorite")this.objectManager?.favoriteObject(payload);if(action==="link")this.bus.emit("relation:start",payload);
    if(["inspect","investigate","timeline","connections","events","evidence","open"].includes(action))this.bus.emit(`context:${action}`,payload);
    if(entityType==="file"&&["archive","trash","open"].includes(action))this.bus.emit("files:context-action",{action,payload});
    if(entityType==="data"&&["archive","trash"].includes(action))this.bus.emit("data:context-action",{action,payload});
    this.bus.emit("context-action:completed",{action,payload});this.hide();
  }
  describe(action,p){const type=(p?.entityType||p?.type||"OBJECT").toUpperCase();return`${action.toUpperCase()} · ${type}`}
}
