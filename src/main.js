import {EventBus} from "./core/EventBus.js";
import {TelemetryEngine} from "./core/TelemetryEngine.js";
import {HudShell} from "./ui/HudShell.js";
import {Toast} from "./ui/Toast.js";
import {CommandPalette} from "./ui/CommandPalette.js";
import {ImportDrawer} from "./ui/ImportDrawer.js";
import {TelemetryInspector} from "./ui/TelemetryInspector.js";
import {DOCK_ITEMS} from "./ui/DockCatalog.js";
import {PanelManager} from "./interaction/PanelManager.js";
import {WorkspaceController} from "./interaction/WorkspaceController.js";
import {PanelRegistry} from "./panels/PanelRegistry.js";
import {HandTracking} from "./vision/HandTracking.js";
import {HandRenderer} from "./vision/HandRenderer.js";
import {GestureRouter} from "./vision/GestureRouter.js";
import {PointerController} from "./vision/PointerController.js";

const bus=new EventBus();
const hudRoot=document.querySelector("#hud-root");
const shell=new HudShell(bus);
const {layer}=shell.mount(hudRoot);
const toast=new Toast(document.querySelector("#toast-root"));
const pm=new PanelManager(layer,bus);
const registry=new PanelRegistry({bus,layer,panelManager:pm}).mount();
const telemetry=new TelemetryEngine(bus);
const workspace=new WorkspaceController(pm,bus);
new CommandPalette({bus,workspace,panelManager:pm,telemetry,toast}).mount(hudRoot);
new ImportDrawer(bus,toast).mount(hudRoot);
new TelemetryInspector(bus).mount(hudRoot);

for(const item of DOCK_ITEMS)shell.addDockButton({...item,onClick:()=>pm.toggle(item.id)});
shell.addDockButton({id:"command-palette",icon:"⌘",label:"Command",onClick:()=>bus.emit("command:toggle")});
shell.addDockButton({id:"import",icon:"⇩",label:"Import",onClick:()=>bus.emit("import:toggle")});
shell.addDockButton({id:"inspect",icon:"{}",label:"Inspect",onClick:()=>bus.emit("inspector:toggle")});
shell.addDockButton({id:"fullscreen",icon:"⛶",label:"Fullscreen",onClick:()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.()});

telemetry.start();
workspace.activate("COMMAND");
bus.on("panel:show",({id})=>document.querySelector(`.dock-btn[data-panel="${id}"]`)?.setAttribute("data-active","true"));
bus.on("panel:hide",({id})=>document.querySelector(`.dock-btn[data-panel="${id}"]`)?.setAttribute("data-active","false"));

const renderer=new HandRenderer(document.querySelector("#hand-layer"),bus);renderer.start();
const router=new GestureRouter(bus);router.start();
const pointer=new PointerController({bus,panelManager:pm,cursor:document.querySelector("#gesture-cursor")});pointer.start();
let tracking=null;

async function initializeCamera(){
  const boot=document.querySelector("#boot-screen"),button=document.querySelector("#boot-button");
  button.disabled=true;button.textContent="INITIALIZING…";
  try{
    tracking=new HandTracking({video:document.querySelector("#webcam"),bus});
    await tracking.init();await tracking.start();
    boot.classList.add("hidden");
    toast.show("HUD online · webcam + hand tracking active");
  }catch(error){
    console.error(error);boot.classList.add("hidden");
    toast.show("Camera/hand tracking unavailable. HUD remains fully usable with mouse and keyboard.",{duration:5200});
  }
}
document.querySelector("#boot-button").addEventListener("click",initializeCamera);
addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();bus.emit("command:toggle")}
  if(e.key==="1")workspace.activate("COMMAND");if(e.key==="2")workspace.activate("SOC");if(e.key==="3")workspace.activate("NETWORK");if(e.key==="4")workspace.activate("LAB");
});
addEventListener("beforeunload",()=>{tracking?.stop();telemetry.stop();renderer.stop();router.stop()});
window.STARK={bus,telemetry,workspace,panels:registry.panels};
