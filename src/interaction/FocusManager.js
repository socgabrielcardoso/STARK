export class FocusManager{
  constructor(bus){this.bus=bus;this.current={level:"GENERAL",target:null,entity:null,ownerHand:null,mode:"IDLE"};this.lock=null}
  start(){
    this.bus.on("air:hover",x=>{if(x.hand?.role==="primary"&&!this.lock)this.set(x.target,x.entity,"LOCAL",x.hand.handId,"HOVER")});
    this.bus.on("air:grab-start",x=>{if(x.hand?.role==="primary"){this.lock=x.source;this.set(x.source,x.payload,"MOVEMENT",x.handId,"DRAGGING")}});
    this.bus.on("air:grab-end",x=>{this.lock=null;this.set(x.target,null,x.target?"LOCAL":"GENERAL",null,"RELEASE")});
    this.bus.on("air:panel-grab",x=>{if(x.hand?.role==="primary"){this.lock=x.panel;this.set(x.panel,{type:"window",id:x.id},"MOVEMENT",x.handId,"DRAGGING")}});
    this.bus.on("air:panel-release",x=>{this.lock=null;this.set(x.panel,{type:"window",id:x.panel?.dataset.panel},"LOCAL",null,"RELEASE")});
    this.bus.on("intent:transform",x=>this.set(this.lock||this.current.target,this.current.entity,"ADVANCED",null,"SCALING"));
    this.bus.on("intent:transform-end",()=>{if(this.current.level==="ADVANCED")this.set(this.current.target,this.current.entity,"LOCAL",null,"RELEASE")});
    this.bus.on("focus:clear",()=>this.clear());
  }
  set(target,entity=null,level="LOCAL",ownerHand=null,mode="TARGETED"){
    if(!target&&level!=="GENERAL")return this.current;
    const next={level,target,entity:entity||this.current.entity,ownerHand,mode};
    const changed=next.target!==this.current.target||next.level!==this.current.level||next.mode!==this.current.mode;
    this.current=next;if(changed)this.bus.emit("focus:change",next);return next;
  }
  clear(){this.lock=null;this.current={level:"GENERAL",target:null,entity:null,ownerHand:null,mode:"IDLE"};this.bus.emit("focus:change",this.current);return this.current}
  target(){return this.current.target}
  panel(){return this.current.target?.closest?.(".hud-panel")||null}
  spatial(){return this.current.target?.closest?.(".spatial-object,.spatial-group")||null}
}
