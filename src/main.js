import {EventBus} from "./core/EventBus.js";
import {TelemetryEngine} from "./core/TelemetryEngine.js";
import {HudShell} from "./ui/HudShell.js";
import {Toast} from "./ui/Toast.js";
import {HandStatusHUD} from "./ui/HandStatusHUD.js";
import {CalibrationOverlay} from "./ui/CalibrationOverlay.js";
import {LayerIndicator} from "./ui/LayerIndicator.js";
import {PanelManager} from "./interaction/PanelManager.js";
import {WorkspaceController} from "./interaction/WorkspaceController.js";
import {SpatialLayout} from "./interaction/SpatialLayout.js";
import {ActionHistory} from "./interaction/ActionHistory.js";
import {WindowManager} from "./interaction/WindowManager.js";
import {WorkspacePersistence} from "./interaction/WorkspacePersistence.js";
import {HandOnlyGuard} from "./interaction/HandOnlyGuard.js";
import {InteractionEngine} from "./interaction/InteractionEngine.js";
import {ObjectManager} from "./interaction/ObjectManager.js";
import {ContextActionEngine} from "./interaction/ContextActionEngine.js";
import {ContextResolver} from "./interaction/ContextResolver.js";
import {PrecisionController} from "./interaction/PrecisionController.js";
import {AirMenu} from "./interaction/AirMenu.js";
import {RelationEngine} from "./interaction/RelationEngine.js";
import {LayerManager} from "./interaction/LayerManager.js";
import {GestureFeedbackEngine} from "./interaction/GestureFeedbackEngine.js";
import {HandRoleManager} from "./interaction/HandRoleManager.js";
import {FocusManager} from "./interaction/FocusManager.js";
import {SpatialContentEngine} from "./interaction/SpatialContentEngine.js";
import {CompactPanelDock} from "./interaction/CompactPanelDock.js";
import {PanelRegistry} from "./panels/PanelRegistry.js";
import {HandTracking} from "./vision/HandTracking.js";
import {HandRenderer} from "./vision/HandRenderer.js";
import {GestureRouter} from "./vision/GestureRouter.js";
import {PointerController} from "./vision/PointerController.js";
import {CalibrationEngine} from "./vision/CalibrationEngine.js";
import {GestureEngine} from "./gesture/GestureEngine.js";
import {CyberModuleEngine} from "./cyber/CyberModuleEngine.js";
import {DataEngine} from "./data/DataEngine.js";

const bus=new EventBus();
const hudRoot=document.querySelector("#hud-root");
const appRoot=document.querySelector("#app");
const toast=new Toast(document.querySelector("#toast-root"));
const shell=new HudShell(bus);
const {layer}=shell.mount(hudRoot);

appRoot?.append(Object.assign(document.createElement("div"),{className:"camera-safe-zone"}));
new HandStatusHUD(bus).mount(hudRoot);
new CalibrationOverlay(bus).mount(hudRoot);
new LayerIndicator(bus).mount(hudRoot);
new GestureFeedbackEngine(bus).mount(hudRoot);
const airMenu=new AirMenu(bus);airMenu.mount(hudRoot);

const history=new ActionHistory(bus);
const roles=new HandRoleManager(bus);
const pm=new PanelManager(layer,bus);
const layout=new SpatialLayout(layer,bus);
const workspace=new WorkspaceController(pm,bus,layout);
const registry=new PanelRegistry({bus,layer,panelManager:pm}).mount();
const compactDock=new CompactPanelDock({bus,panelManager:pm,root:hudRoot});compactDock.mount();
const focus=new FocusManager(bus);focus.start();
const spatial=new SpatialContentEngine({bus,root:appRoot,panelLayer:layer,history});spatial.mount();
const layerManager=new LayerManager(bus,pm);layerManager.start();
const windowManager=new WindowManager({bus,panelManager:pm,layer,history});windowManager.start();
const persistence=new WorkspacePersistence({bus,layer,panelManager:pm,history});
const objects=new ObjectManager(bus);objects.start();
const contextResolver=new ContextResolver(bus);
const precision=new PrecisionController(bus);precision.start();
const interaction=new InteractionEngine(bus);interaction.start();
const contextActions=new ContextActionEngine(bus,objects);contextActions.mount(hudRoot);
const relations=new RelationEngine(bus);relations.mount(appRoot);
const cyber=new CyberModuleEngine(bus).seed();
const dataEngine=new DataEngine(bus);
const telemetry=new TelemetryEngine(bus);
const handGuard=new HandOnlyGuard(bus);

const renderer=new HandRenderer(document.querySelector("#hand-layer"),bus);renderer.start();
const router=new GestureRouter(bus,roles);router.start();
const gestureEngine=new GestureEngine(bus);gestureEngine.start();
const pointer=new PointerController({bus,panelManager:pm,cursor:document.querySelector("#gesture-cursor"),layer,contextResolver,precision,spatial,focus});pointer.start();
const calibration=new CalibrationEngine(bus);

const quickModules=[
  ["command","◎","COMMAND"],["files","▱","FILES"],["investigation","⌁","INVESTIGATE"],
  ["timeline","⟷","TIMELINE"],["search","⌕","SEARCH"],["gesture-settings","⚙","SETTINGS"],["diagnostics","◌","DIAG"]
];
for(const [id,icon,label] of quickModules)shell.addDockButton({id,icon,label,onClick:()=>pm.toggle(id)});
document.querySelectorAll(".hud-panel").forEach(p=>p.hidden=true);

function gesturePayload(packet){return packet?.packet?.payload||packet?.payload?.payload||packet?.payload||packet}
function gesturePoint(packet){
  const g=gesturePayload(packet);return g?.tip?{x:g.tip.x*innerWidth,y:g.tip.y*innerHeight}:{x:innerWidth/2,y:innerHeight/2}
}
function controlElement(packet){
  const p=gesturePoint(packet);return document.elementFromPoint(p.x,p.y)
}
function payloadForNode(node){
  if(!node)return null;
  const spatialNode=node.closest?.(".spatial-object,.spatial-group");
  if(spatialNode)return{type:spatialNode.dataset.entityType||"spatial",entityType:spatialNode.dataset.entityType||"spatial",id:spatialNode.dataset.spatialId||spatialNode.dataset.spatialGroup,name:spatialNode.querySelector("strong")?.textContent||"Object"};
  const panel=node.closest?.(".hud-panel");
  if(panel)return{type:"window",entityType:"window",id:panel.dataset.panel,name:panel.querySelector(".hud-panel__title strong")?.textContent||panel.dataset.panel};
  const resolved=contextResolver.resolve(node);return resolved.entity?{...resolved.entity,entityType:resolved.type}:null;
}
function scrollActive(direction){
  const body=pm.active?.querySelector(".hud-panel__body");if(!body)return;body.scrollBy({top:direction*body.clientHeight*.62,behavior:"smooth"});bus.emit("air:scroll",{direction,id:pm.active.dataset.panel});
}
function applyMenuAction(action){
  const actions={
    "workspace-command":()=>workspace.activate("COMMAND"),"workspace-soc":()=>workspace.activate("SOC"),"workspace-network":()=>workspace.activate("NETWORK"),"workspace-lab":()=>workspace.activate("LAB"),
    "layer-next":()=>layerManager.set(layerManager.active%5+1),"panel-search":()=>pm.show("search"),"panel-settings":()=>layerManager.set(4),"history-undo":()=>history.undo()
  };actions[action]?.();airMenu.close();
}

bus.on("air:activate",x=>applyMenuAction(x.action));
bus.on("interaction:menu",x=>airMenu.open(gesturePoint(x)));
bus.on("interaction:minimize",()=>pm.minimize());
bus.on("interaction:home",()=>{pointer.cancel();contextActions.hide();airMenu.close();focus.clear();layerManager.set(1);workspace.activate("COMMAND")});
bus.on("interaction:undo",()=>history.undo());
bus.on("interaction:back",()=>{if(airMenu.opened)airMenu.close();else registry.modules.get("files")?.up?.()});
bus.on("interaction:precision",()=>precision.toggle());

bus.on("interaction:control-menu",x=>{
  const hovered=controlElement(x),payload=payloadForNode(hovered)||payloadForNode(focus.target());
  if(payload){const panel=hovered?.closest?.(".hud-panel");if(panel)pm.focus(panel);contextActions.show(payload)}
  else airMenu.open(gesturePoint(x));
});
bus.on("interaction:control-collapse",x=>{
  const hovered=controlElement(x),group=hovered?.closest?.(".spatial-group"),item=hovered?.closest?.(".spatial-object"),panel=hovered?.closest?.(".hud-panel")||focus.panel();
  if(group){spatial.focused=group;spatial.toggleGroup(group);return}
  if(item){spatial.focused=item;spatial.shrinkFocused();return}
  if(panel){pm.focus(panel);pm.minimize(panel);return}
  if(spatial.focused)spatial.shrinkFocused();else pm.minimize();
});
bus.on("interaction:control-cancel",()=>{pointer.cancel();contextActions.hide();airMenu.close();focus.clear();objects.clear();toast.show("CANCELLED")});
bus.on("interaction:control-back",()=>{
  if(spatial.grab){pointer.cancel();toast.show("MOVE CANCELLED");return}
  if(contextActions.root?.classList.contains("visible")){contextActions.hide();return}
  if(airMenu.opened){airMenu.close();return}
  if(focus.current.level!=="GENERAL"){focus.clear();objects.clear();return}
  registry.modules.get("files")?.up?.();
});
bus.on("interaction:control-restore",()=>{if(!compactDock.restoreLast())windowManager.restoreLast()});

bus.on("intent:target",packet=>{
  const entity=packet?.meta?.entity;if(!entity)return;objects.select(entity);
  document.querySelectorAll(".object-selected").forEach(n=>n.classList.remove("object-selected"));
  const id=CSS.escape(entity.id||"");document.querySelector('[data-file-id="'+id+'"],[data-data-id="'+id+'"],[data-entity-id="'+id+'"],[data-spatial-id="'+id+'"]')?.classList.add("object-selected");
  bus.emit("interaction:state",{mode:"TARGETED",selected:entity});
});
bus.on("interaction:workspace-next",()=>workspace.next(1));bus.on("interaction:workspace-prev",()=>workspace.next(-1));
bus.on("interaction:scroll-up",()=>scrollActive(-1));bus.on("interaction:scroll-down",()=>scrollActive(1));
bus.on("workspace:step",x=>workspace.next(x.direction));bus.on("workspace:auto-arrange",()=>workspace.arrange());
bus.on("calibration:reset",()=>calibration.reset());
bus.on("spatial:collapse-group",()=>spatial.toggleGroup());
bus.on("history:undo",x=>toast.show(`UNDO · ${x.label||"ACTION"}`));
bus.on("context-action:completed",x=>toast.show(`${x.action.toUpperCase()} · ${x.payload?.name||x.payload?.id||"OBJECT"}`));
bus.on("relation:created",()=>toast.show("RELATION CREATED"));
bus.on("spatial:grouped",x=>toast.show(`GROUPED · ${x.count} ITEMS`));
bus.on("spatial:docked",x=>toast.show(`PLACED · ${x.panel.toUpperCase()}`));
bus.on("spatial:trashed",()=>toast.show("REMOVED · RECOVERY AVAILABLE"));
bus.on("spatial:restored",()=>toast.show("RESTORED"));
bus.on("files:moved",x=>toast.show(`FILE MOVED · ${x.id}`));bus.on("data:moved",x=>toast.show(`EVIDENCE MOVED · ${x.id} → ${x.lane}`));
bus.on("window:frozen",x=>toast.show(`${x.value?"FROZEN":"UNFROZEN"} · ${x.id}`));
bus.on("hand-role:change",x=>toast.show(`PRIMARY ${x.primary.toUpperCase()} · CONTROL ${x.control.toUpperCase()}`));
bus.on("panel:show",({id})=>document.querySelector('.dock-btn[data-panel="'+CSS.escape(id)+'"]')?.setAttribute("data-active","true"));
bus.on("panel:hide",({id})=>document.querySelector('.dock-btn[data-panel="'+CSS.escape(id)+'"]')?.setAttribute("data-active","false"));

let panelGrabSnapshot=null;
bus.on("air:panel-grab",({panel})=>{if(!panel)return;panelGrabSnapshot={panel,left:panel.style.left,top:panel.style.top,width:panel.style.width,height:panel.style.height,rotate:panel.style.rotate}});
bus.on("air:panel-release",({panel})=>{
  if(!panel||!panelGrabSnapshot||panel!==panelGrabSnapshot.panel)return;
  const before={...panelGrabSnapshot},after={left:panel.style.left,top:panel.style.top,width:panel.style.width,height:panel.style.height,rotate:panel.style.rotate};
  history.record({label:`move ${panel.dataset.panel}`,undo:()=>Object.assign(panel.style,{left:before.left,top:before.top,width:before.width,height:before.height,rotate:before.rotate}),redo:()=>Object.assign(panel.style,after)});panelGrabSnapshot=null;
});

bus.on("gesture-settings:change",s=>{
  if(Number.isFinite(s.pinch))router.classifier.pinchThreshold=s.pinch;if(Number.isFinite(s.smoothing))router.smoother.alpha=s.smoothing;if(typeof s.precision==="boolean")precision.toggle(s.precision);
});
bus.on("calibration:profile",p=>{if(Number.isFinite(p.pinchThreshold))router.classifier.pinchThreshold=p.pinchThreshold;if(Number.isFinite(p.smoothing))router.smoother.alpha=p.smoothing});

let seededData=false;
bus.on("telemetry:update",s=>{
  if(seededData)return;seededData=true;dataEngine.registerMany([
    ...s.simulated.hosts.map(h=>({id:h.id,type:"device",name:h.name,risk:h.risk,source:"simulated"})),
    ...s.real.windowsEvents.topEventIds.map(e=>({id:`event-${e.id}`,type:"log",name:`Event ${e.id}`,count:e.count,source:"real-sanitized"})),
    ...s.real.network.notableDestinations.map((n,i)=>({id:`conn-${i}`,type:"ip",name:n.service,port:n.port,state:n.state,source:"real-sanitized"}))
  ]);spatial.decorateAll();
});

window.STARK={bus,telemetry,workspace,panels:registry.panels,modules:registry.modules,history,windowManager,persistence,interaction,objects,contextActions,relations,layerManager,gestureEngine,calibration,cyber,dataEngine,precision,roles,focus,spatial,compactDock};

bus.emit("hand-role:change",roles.snapshot());
telemetry.start();

let tracking=null,starting=false;
async function initializeCamera(){
  if(starting||tracking)return;starting=true;const boot=document.querySelector("#boot-screen"),button=document.querySelector("#boot-button"),status=document.querySelector("#boot-status");
  if(button){button.disabled=true;button.textContent="REQUESTING CAMERA…"}if(status)status.textContent="Allow camera access once. Primary and control hand roles will appear automatically.";
  try{tracking=new HandTracking({video:document.querySelector("#webcam"),bus});await tracking.init();await tracking.start();handGuard.start();if(boot)boot.classList.add("hidden");persistence.start();calibration.start();toast.show("STARK DUAL-HAND OS · CALIBRATING")}
  catch(error){console.error(error);tracking=null;starting=false;if(button){button.disabled=false;button.textContent="ALLOW CAMERA + START"}if(status)status.textContent="Camera permission is required. The startup button is only for browser permission."}
}
document.querySelector("#boot-button")?.addEventListener("click",initializeCamera);queueMicrotask(()=>initializeCamera());

bus.on("calibration:complete",()=>{
  const restored=persistence.restore();if(restored?.workspace){workspace.current=restored.workspace;bus.emit("workspace:change",{name:restored.workspace,restored:true})}else workspace.activate("COMMAND");
  layerManager.active=1;bus.emit("layer:change",{layer:1,name:"PRIMARY",restored:Boolean(restored)});bus.emit("hand-role:change",roles.snapshot());spatial.decorateAll();toast.show(restored?"WORKSPACE RESTORED":"COMMAND WORKSPACE READY");
});

addEventListener("beforeunload",()=>{persistence.save();spatial.save();tracking?.stop();telemetry.stop();renderer.stop();router.stop();handGuard.stop()});
