export class WorkspaceController{
  constructor(panelManager,bus,layout){
    this.pm=panelManager;this.bus=bus;this.layout=layout;this.current="COMMAND";this.snap=true;
    this.workspaces={
      COMMAND:["command","defender","network","donna"],
      SOC:["radar","logs","event-intel","incidents"],
      NETWORK:["network","connections","globe","processes"],
      LAB:["validation","gestures","files","data-workbench"]
    };
    this.bus.on("gesture-settings:change",s=>{if(typeof s.snap==="boolean")this.snap=s.snap});
    this.bus.on("workspace:auto-arrange",()=>this.arrange());
  }
  activate(name){
    const key=String(name).toUpperCase();if(!this.workspaces[key])return false;this.current=key;
    const visible=[];
    document.querySelectorAll(".hud-panel").forEach(p=>{
      const show=this.workspaces[key].includes(p.dataset.panel)||p.classList.contains("pinned"),compacted=p.classList.contains("compacted");p.hidden=!show||compacted;
      if(show&&!compacted){p.classList.remove("minimized","maximized");visible.push(p)}
    });
    if(visible.length)this.pm.focus(visible[0]);if(this.snap)requestAnimationFrame(()=>this.layout?.arrange(visible,key));
    this.bus.emit("workspace:change",{name:key,panels:visible.map(p=>p.dataset.panel),snap:this.snap});return true;
  }
  arrange(){const visible=this.pm.visible();this.layout?.arrange(visible,this.current)}
  next(direction=1){const keys=Object.keys(this.workspaces),i=keys.indexOf(this.current),next=keys[(i+direction+keys.length)%keys.length];this.activate(next);return next}
}
