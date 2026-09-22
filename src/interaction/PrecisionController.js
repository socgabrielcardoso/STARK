export class PrecisionController{
  constructor(bus){this.bus=bus;this.enabled=false;this.factor=.42}
  start(){
    this.bus.on("precision:toggle",()=>this.toggle());
    this.bus.on("gesture-settings:change",s=>{if(typeof s.precision==="boolean")this.enabled=s.precision});
  }
  toggle(value=!this.enabled){this.enabled=value;document.documentElement.classList.toggle("precision-mode",this.enabled);this.bus.emit("precision:change",{enabled:this.enabled,factor:this.factor});return this.enabled}
  map(point,anchor={x:.5,y:.5}){
    if(!this.enabled)return point;
    return{x:anchor.x+(point.x-anchor.x)*this.factor,y:anchor.y+(point.y-anchor.y)*this.factor};
  }
}
