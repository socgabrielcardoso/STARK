const KEY="stark-hand-roles-v3";
export class HandRoleManager{
  constructor(bus){
    this.bus=bus;
    this.primaryHandedness=this.load();
    this.bus.on("hand-role:swap",()=>this.swap());
    this.bus.on("hand-role:set",x=>this.setPrimary(x?.handedness||x));
  }
  load(){try{return localStorage.getItem(KEY)||"Right"}catch{return"Right"}}
  normalize(value){const v=String(value||"").toLowerCase();return v.startsWith("l")?"Left":v.startsWith("r")?"Right":String(value||"Unknown")}
  roleFor(handedness){
    const hand=this.normalize(handedness),primary=this.normalize(this.primaryHandedness);
    if(hand==="Unknown")return"primary";
    return hand===primary?"primary":"control";
  }
  annotate(hand){return{...hand,role:this.roleFor(hand.handedness)}}
  setPrimary(handedness){
    const next=this.normalize(handedness);if(!["Left","Right"].includes(next))return this.primaryHandedness;
    this.primaryHandedness=next;try{localStorage.setItem(KEY,next)}catch{}
    this.bus.emit("hand-role:change",this.snapshot());return next;
  }
  swap(){return this.setPrimary(this.normalize(this.primaryHandedness)==="Right"?"Left":"Right")}
  snapshot(){return{primary:this.normalize(this.primaryHandedness),control:this.normalize(this.primaryHandedness)==="Right"?"Left":"Right"}}
}
