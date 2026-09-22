export class HybridInputManager{
  constructor(bus){this.bus=bus;this.last="hands";this.mouseTimer=null;this.boundMove=e=>this.mouse(e);this.boundDown=e=>this.mouse(e)}
  start(){
    document.documentElement.dataset.inputMode="hybrid";document.body.dataset.inputMode="hybrid";
    window.addEventListener("pointermove",this.boundMove,{capture:true,passive:true});window.addEventListener("pointerdown",this.boundDown,{capture:true,passive:true});
    this.bus.on("gestures:frame",({hands})=>{if(hands?.length)this.set("hands")});
    this.bus.emit("input:mode",{mode:"hybrid",primary:"hands",fallback:"mouse"});
  }
  mouse(event){if(event.pointerType&&event.pointerType!=="mouse")return;this.set("mouse");clearTimeout(this.mouseTimer);this.mouseTimer=setTimeout(()=>document.documentElement.classList.remove("mouse-recent"),1800);document.documentElement.classList.add("mouse-recent")}
  set(source){if(this.last===source)return;this.last=source;document.documentElement.dataset.activeInput=source;this.bus.emit("input:source",{source})}
  stop(){window.removeEventListener("pointermove",this.boundMove,{capture:true});window.removeEventListener("pointerdown",this.boundDown,{capture:true})}
}
