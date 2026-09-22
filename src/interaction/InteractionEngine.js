const ROUTED=["menu","minimize","home","undo","back","precision","workspace-next","workspace-prev","scroll-up","scroll-down","control-menu","control-collapse","control-cancel","control-back","control-restore"];
export class InteractionEngine{
  constructor(bus){this.bus=bus;this.context={target:null,type:"empty",entity:null,selected:null,mode:"IDLE"};this.cooldowns=new Map()}
  start(){
    this.bus.on("interaction:context",x=>{this.context={...this.context,...x}});
    this.bus.on("air:hover",x=>{if(x.hand?.role==="primary")this.setContext({target:x.target,type:x.type||"ui",entity:x.entity||null})});
    this.bus.on("air:grab-start",x=>{this.context={...this.context,selected:x.payload,mode:"DRAGGING"};this.bus.emit("interaction:state",this.context)});
    this.bus.on("air:grab-end",()=>{this.context={...this.context,mode:"RELEASE"};this.bus.emit("interaction:state",this.context)});
    ROUTED.forEach(name=>this.bus.on(`intent:${name}`,packet=>this.route(name,packet)));
  }
  setContext(patch){this.context={...this.context,...patch};this.bus.emit("interaction:resolved",this.context)}
  route(action,packet){const now=performance.now(),last=this.cooldowns.get(action)||0;if(now-last<170)return;this.cooldowns.set(action,now);this.bus.emit(`interaction:${action}`,{packet,context:this.context})}
}
