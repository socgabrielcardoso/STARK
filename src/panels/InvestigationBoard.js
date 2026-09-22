import {el,clear} from "../utils/dom.js";
const LANES=["Evidence","Entities","Hypotheses","Resolved"];
export class InvestigationBoard{
  constructor(bus){this.bus=bus;this.root=el("div",{class:"investigation-board"});this.items=this.load();this.render();bus.on("context:evidence",x=>this.add(x,"Evidence"));bus.on("context:investigate",x=>this.add(x,"Entities"));bus.on("air:drop",x=>this.drop(x))}
  load(){try{return JSON.parse(localStorage.getItem("stark-investigation-board"))||Object.fromEntries(LANES.map(x=>[x,[]]))}catch{return Object.fromEntries(LANES.map(x=>[x,[]]))}}
  save(){localStorage.setItem("stark-investigation-board",JSON.stringify(this.items))}
  add(entity,lane="Evidence"){
    if(!entity)return;const id=entity.id||entity.name||crypto.randomUUID?.()||String(Date.now());
    if(Object.values(this.items).flat().some(x=>x.id===id))return;
    this.items[lane].push({id,title:entity.name||entity.title||id,type:entity.entityType||entity.type||"data",source:entity.source||"context"});this.save();this.render();this.bus.emit("investigation:add",{id,lane});
  }
  move(id,lane){let found=null;for(const arr of Object.values(this.items)){const i=arr.findIndex(x=>x.id===id);if(i>=0){found=arr.splice(i,1)[0];break}}if(found&&this.items[lane]){this.items[lane].push(found);this.save();this.render();return true}return false}
  drop({payload,target}){const lane=target?.closest?.("[data-investigation-lane]")?.dataset.investigationLane;if(!lane)return;if(payload?.type==="data")this.move(payload.id,lane);else if(payload)this.add(payload,lane)}
  render(){
    clear(this.root);
    for(const lane of LANES){
      const col=el("section",{class:"investigation-lane",dataset:{investigationLane:lane}},el("h4",{},`${lane} · ${this.items[lane].length}`));
      for(const item of this.items[lane])col.append(el("div",{class:"investigation-card",dataset:{airDraggable:"data",dataId:item.id,entityId:item.id,entityType:item.type}},el("strong",{},item.title),el("small",{},item.type.toUpperCase())));
      this.root.append(col);
    }
  }
}
