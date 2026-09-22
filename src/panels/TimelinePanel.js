import {el,clear} from "../utils/dom.js";
export class TimelinePanel{
  constructor(bus){
    this.bus=bus;this.root=el("div",{class:"timeline-panel"});this.events=[];this.index=0;this.playing=false;this.timer=null;
    bus.on("telemetry:update",s=>this.seed(s));bus.on("context:timeline",x=>this.focusEntity(x));this.render();
  }
  seed(s){
    if(this.events.length)return;
    this.events=[
      ...s.real.windowsEvents.samples.map((e,i)=>({id:`R-${i}`,source:"REAL",title:`Event ${e.id}`,detail:e.message,severity:e.severity})),
      ...s.simulated.alerts.map((e,i)=>({id:`S-${i}`,source:"SIM",title:e.title,detail:"Simulated training event",severity:e.severity}))
    ];this.render();
  }
  focusEntity(entity){if(!entity)return;const q=(entity.id||entity.name||"").toLowerCase(),i=this.events.findIndex(e=>JSON.stringify(e).toLowerCase().includes(q));if(i>=0){this.index=i;this.render()}}
  step(delta){if(!this.events.length)return;this.index=(this.index+delta+this.events.length)%this.events.length;this.render();this.bus.emit("timeline:position",{index:this.index,event:this.events[this.index]})}
  play(){this.playing=!this.playing;clearInterval(this.timer);if(this.playing)this.timer=setInterval(()=>this.step(1),900);this.render()}
  render(){
    clear(this.root);const event=this.events[this.index]||{title:"Waiting for telemetry",detail:"",source:"—",severity:"info"};
    const controls=el("div",{class:"timeline-controls"});
    [["◀",-1],["▶",1]].forEach(([label,delta])=>{const b=el("button",{class:"air-chip",type:"button"},label);b.addEventListener("click",e=>{if(e.isTrusted)return;this.step(delta)});controls.append(b)});
    const play=el("button",{class:"air-chip",type:"button"},this.playing?"PAUSE":"PLAY");play.addEventListener("click",e=>{if(e.isTrusted)return;this.play()});controls.append(play);
    this.root.append(el("div",{class:"timeline-track"},el("i",{style:`width:${this.events.length?((this.index+1)/this.events.length)*100:0}%`})),
      el("div",{class:"timeline-card"},el("span",{class:`badge ${event.source==="REAL"?"real":"simulated"}`},event.source),el("strong",{},event.title),el("p",{},event.detail),el("small",{},`${this.index+1} / ${Math.max(this.events.length,1)} · ${String(event.severity).toUpperCase()}`)),controls);
  }
}
