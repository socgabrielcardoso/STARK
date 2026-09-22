import {el,clear} from "../utils/dom.js";
const SEED={
  Investigate:[
    {id:"d-3033",title:"Code Integrity 3033",meta:"REAL · Windows event snapshot",state:"REVIEW",entityType:"log"},
    {id:"d-285",title:"Hyper-V vSwitch 285",meta:"REAL · warning observation",state:"WATCH",entityType:"alert"}
  ],
  Focus:[
    {id:"d-def",title:"Defender posture",meta:"REAL · protection enabled",state:"GOOD",entityType:"device"},
    {id:"d-sim",title:"Threat correlation",meta:"SIMULATED · training stream",state:"LOW",entityType:"incident"}
  ],
  Archive:[],Trash:[]
};
const STATES=["LOW","WATCH","REVIEW","GOOD","ACK"];
export class DataWorkbench{
  constructor(bus){
    this.bus=bus;this.root=el("div",{class:"data-board"});this.state=this.load();this.render();
    bus.on("air:drop",p=>this.drop(p));bus.on("data:context-action",x=>this.contextAction(x));
  }
  load(){try{return JSON.parse(localStorage.getItem("stark-data-board"))||structuredClone(SEED)}catch{return structuredClone(SEED)}}
  save(){localStorage.setItem("stark-data-board",JSON.stringify(this.state))}
  render(){
    clear(this.root);
    for(const [lane,items] of Object.entries(this.state)){
      const list=el("div",{class:`data-lane ${lane==="Trash"?"data-lane--trash":""}`,dataset:{dropLane:lane}},el("h4",{},`${lane} · ${items.length}`));
      for(const item of items){
        const change=el("button",{class:"air-chip",type:"button"},"STATE "+(item.state||""));
        change.addEventListener("click",event=>{if(event.isTrusted)return;this.cycle(item.id)});
        list.append(el("div",{class:"data-card",dataset:{airDraggable:"data",dataId:item.id,entityType:item.entityType||"data",entityId:item.id}},
          el("div",{},el("strong",{},item.title),el("small",{},item.meta)),change));
      }
      this.root.append(list);
    }
  }
  locate(id){for(const [lane,items] of Object.entries(this.state)){const index=items.findIndex(x=>x.id===id);if(index>=0)return{lane,items,index,item:items[index]}}return null}
  cycle(id){const hit=this.locate(id);if(!hit)return;const i=STATES.indexOf(hit.item.state);hit.item.state=STATES[(i+1+STATES.length)%STATES.length];this.save();this.render();this.bus.emit("data:modified",{id,state:hit.item.state})}
  moveTo(id,lane){const hit=this.locate(id);if(!hit||hit.lane===lane||!this.state[lane])return false;const found=hit.items.splice(hit.index,1)[0];this.state[lane].push(found);this.save();this.render();this.bus.emit("data:moved",{id,lane});return true}
  contextAction({action,payload}){if(action==="archive")this.moveTo(payload.id,"Archive");if(action==="trash")this.moveTo(payload.id,"Trash")}
  drop({payload,target}){if(payload?.type!=="data")return;const lane=target?.closest?.("[data-drop-lane]")?.dataset.dropLane;if(lane)this.moveTo(payload.id,lane)}
}
