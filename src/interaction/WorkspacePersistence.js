const KEY="stark-workspace-layout-v5";
export class WorkspacePersistence{
  constructor({bus,layer,panelManager,history}){this.bus=bus;this.layer=layer;this.pm=panelManager;this.history=history;this.timer=null}
  start(){["panel:scale","panel:rotate","panel:compact","panel:restore","panel:maximize","panel:hide","panel:show","air:panel-release","window:pinned","window:frozen"].forEach(name=>this.bus.on(name,()=>this.schedule()));this.bus.on("workspace:change",()=>this.schedule());this.bus.on("workspace:restore",()=>this.restore());this.bus.on("workspace:save",()=>this.save())}
  capture(){return{version:5,density:"compact",workspace:window.STARK?.workspace?.current||"COMMAND",panels:[...this.layer.querySelectorAll(".hud-panel")].map(p=>({id:p.dataset.panel,left:p.style.left,top:p.style.top,width:p.style.width,height:p.style.height,rotate:p.style.rotate||"",hidden:p.hidden,compacted:p.classList.contains("compacted"),max:p.classList.contains("maximized"),frozen:p.classList.contains("frozen"),pinned:p.classList.contains("pinned")}))}}
  apply(snapshot){if(!snapshot)return;for(const s of snapshot.panels||[]){const p=this.layer.querySelector('[data-panel="'+CSS.escape(s.id)+'"]');if(!p)continue;p.style.left=s.left;p.style.top=s.top;p.style.width=s.width;p.style.height=s.height;p.style.rotate=s.rotate;p.hidden=Boolean(s.hidden||s.compacted);p.classList.toggle("compacted",Boolean(s.compacted));p.classList.toggle("maximized",Boolean(s.max));p.classList.toggle("frozen",Boolean(s.frozen));p.classList.toggle("pinned",Boolean(s.pinned))}this.bus.emit("workspace:applied",snapshot)}
  save(){const snap=this.capture();localStorage.setItem(KEY,JSON.stringify(snap));this.bus.emit("workspace:saved",snap);return snap}
  restore(){try{const snap=JSON.parse(localStorage.getItem(KEY));if(snap)this.apply(snap);return snap}catch{return null}}
  schedule(){clearTimeout(this.timer);this.timer=setTimeout(()=>this.save(),180)}
}
