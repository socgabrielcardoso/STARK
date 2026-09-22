const GROUPS={
  1:["command","defender","network","radar","donna"],
  2:["event-intel","connections","incidents","logs","globe","files","processes","validation","data-workbench"],
  3:["investigation","timeline","data-workbench"],
  4:["gesture-settings","gesture-bindings","search","import"],
  5:["diagnostics","gestures","telemetry"]
};
const NAMES=["","PRIMARY","DETAIL","CONTEXT","SETTINGS","DIAGNOSTICS"];
export class LayerManager{
  constructor(bus,panelManager){this.bus=bus;this.pm=panelManager;this.active=1}
  start(){this.bus.on("layer:set",x=>this.set(Number(x.layer||x)));this.bus.on("layer:next",()=>this.set(this.active%5+1));this.bus.on("layer:previous",()=>this.set((this.active+3)%5+1))}
  set(layer){
    if(layer<1||layer>5)return;this.active=layer;const ids=GROUPS[layer]||[];
    document.querySelectorAll(".hud-panel").forEach(p=>p.hidden=!ids.includes(p.dataset.panel)&&!p.classList.contains("pinned"));
    ids.forEach(id=>this.pm.show(id));this.bus.emit("layer:change",{layer,name:NAMES[layer],panels:ids});return ids;
  }
}
