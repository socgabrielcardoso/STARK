export class HandOnlyGuard{
  constructor(bus){this.bus=bus;this.block=this.block.bind(this)}
  start(){
    document.documentElement.dataset.inputMode="hands";
    document.body.dataset.inputMode="hands";
    for(const type of ["pointerdown","pointerup","pointermove","mousedown","mouseup","mousemove","click","dblclick","contextmenu","wheel","touchstart","touchmove","touchend"]){
      window.addEventListener(type,this.block,{capture:true,passive:false});
    }
    window.addEventListener("keydown",this.block,{capture:true});
    this.bus?.emit("input:mode",{mode:"hands-only"});
  }
  block(event){
    if(!event.isTrusted)return;
    event.preventDefault?.();event.stopImmediatePropagation?.();event.stopPropagation?.();
  }
  stop(){
    for(const type of ["pointerdown","pointerup","pointermove","mousedown","mouseup","mousemove","click","dblclick","contextmenu","wheel","touchstart","touchmove","touchend"]){
      window.removeEventListener(type,this.block,{capture:true});
    }
    window.removeEventListener("keydown",this.block,{capture:true});
  }
}
