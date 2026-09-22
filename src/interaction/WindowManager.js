export class WindowManager{
  constructor({bus,panelManager,layer,history}){this.bus=bus;this.pm=panelManager;this.layer=layer;this.history=history;this.duplicates=0}
  start(){
    this.bus.on("window:freeze",()=>this.freeze());this.bus.on("window:pin",()=>this.pin());this.bus.on("window:duplicate",()=>this.duplicate());
    this.bus.on("window:close",()=>this.close());this.bus.on("window:restore",()=>this.restoreLast());this.bus.on("window:stack",()=>this.stackVisible());
    this.bus.on("window:maximize",()=>this.pm.maximize());this.bus.on("window:minimize",()=>this.pm.minimize());
  }
  active(){return this.pm.active}
  freeze(panel=this.active()){if(!panel)return;panel.classList.toggle("frozen");this.bus.emit("window:frozen",{id:panel.dataset.panel,value:panel.classList.contains("frozen")})}
  pin(panel=this.active()){if(!panel)return;panel.classList.toggle("pinned");this.bus.emit("window:pinned",{id:panel.dataset.panel,value:panel.classList.contains("pinned")})}
  duplicate(panel=this.active()){if(!panel)return;const clone=panel.cloneNode(true),id=`${panel.dataset.panel}-copy-${++this.duplicates}`;clone.dataset.panel=id;clone.dataset.duplicateOf=panel.dataset.panel;clone.style.left=`${panel.offsetLeft+34}px`;clone.style.top=`${panel.offsetTop+34}px`;clone.classList.remove("active","maximized","minimized","compacted","frozen");this.layer.append(clone);this.pm.register(clone);this.pm.focus(clone);this.bus.emit("window:duplicated",{source:panel.dataset.panel,id});return clone}
  close(panel=this.active()){if(!panel)return;const id=panel.dataset.panel,wasHidden=panel.hidden;this.pm.hide(id);this.history?.record({label:`close ${id}`,undo:()=>{panel.hidden=wasHidden;this.pm.show(id)},redo:()=>this.pm.hide(id)})}
  restoreLast(){const compacted=[...this.layer.querySelectorAll(".hud-panel.compacted")].at(-1);if(compacted){this.pm.restore(compacted);return}const hidden=[...this.layer.querySelectorAll(".hud-panel")].reverse().find(p=>p.hidden);if(hidden)this.pm.show(hidden.dataset.panel)}
  stackVisible(){const visible=this.pm.visible();visible.forEach((p,i)=>{p.style.left=`${80+i*28}px`;p.style.top=`${80+i*24}px`;p.style.width="390px";p.style.height="280px";p.style.rotate="";p.classList.remove("maximized","minimized","compacted")});this.bus.emit("window:stacked",{count:visible.length})}
}
