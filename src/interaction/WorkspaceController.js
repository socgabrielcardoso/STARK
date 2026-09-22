export class WorkspaceController{
  constructor(panelManager,bus){
    this.pm=panelManager;this.bus=bus;this.current="COMMAND";
    this.workspaces={COMMAND:["command","defender","network","donna"],SOC:["radar","logs","event-intel","incidents"],NETWORK:["network","connections","globe"],LAB:["validation","gestures","files","processes"]};
  }
  activate(name){
    const key=String(name).toUpperCase();if(!this.workspaces[key])return false;
    this.current=key;document.querySelectorAll(".hud-panel").forEach(p=>p.hidden=!this.workspaces[key].includes(p.dataset.panel));
    this.workspaces[key].forEach(id=>this.pm.show(id));this.bus.emit("workspace:change",{name:key});return true;
  }
}
