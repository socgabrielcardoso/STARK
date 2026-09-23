import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {VALIDATION_COMBINATIONS} from "../src/data/validationCatalog.js";
import {COMPOSITION_CAPACITY} from "../src/gesture/GestureGrammar.js";

const root=process.cwd();
const required=[
  "index.html","styles/base.css","styles/hud.css","styles/panels.css","styles/hand-only.css","src/main.js",
  "src/vision/HandTracking.js","src/vision/GestureRouter.js","src/vision/PointerController.js","src/vision/CalibrationEngine.js","src/vision/HandRenderer.js",
  "src/gesture/GestureEngine.js","src/gesture/GestureStateManager.js","src/gesture/GestureGrammar.js","src/gesture/GestureBindingStore.js",
  "src/interaction/HandRoleManager.js","src/interaction/FocusManager.js","src/interaction/SpatialContentEngine.js","src/interaction/CompactPanelDock.js",
  "src/interaction/InteractionEngine.js","src/interaction/ObjectManager.js","src/interaction/WindowManager.js","src/interaction/PanelManager.js",
  "src/interaction/WorkspaceController.js","src/interaction/WorkspacePersistence.js","src/interaction/ContextActionEngine.js","src/interaction/ContextResolver.js",
  "src/interaction/GestureFeedbackEngine.js","src/interaction/HybridInputManager.js","src/interaction/MouseInteractionController.js","src/interaction/ActivationRouter.js",
  "src/ui/InfoLens.js","src/ui/OffscreenNavigator.js","src/ui/DepthClickFeedback.js","src/vision/DepthClickDetector.js","src/core/PerformanceGovernor.js",
  "src/panels/PanelRegistry.js","src/panels/InvestigationBoard.js","src/panels/TimelinePanel.js","src/panels/GestureSettingsPanel.js",
  "src/data/realTelemetry.js","src/data/simulatedTelemetry.js","src/data/DataEngine.js"
];
const errors=[];
for(const file of required)if(!fs.existsSync(path.join(root,file)))errors.push(`missing: ${file}`);
if(VALIDATION_COMBINATIONS<3000)errors.push(`validation matrix too small: ${VALIDATION_COMBINATIONS}`);
if(COMPOSITION_CAPACITY<100000)errors.push(`gesture composition capacity too small: ${COMPOSITION_CAPACITY}`);

const sourceFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith(".js"))sourceFiles.push(full)}}
walk(path.join(root,"src"));
for(const file of sourceFiles){
  const text=fs.readFileSync(file,"utf8"),rel=path.relative(root,file);
  if(/\beval\s*\(/.test(text))errors.push(`eval detected: ${rel}`);
  if(/document\.write\s*\(/.test(text))errors.push(`document.write detected: ${rel}`);
  if(/BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/.test(text))errors.push(`private key pattern: ${rel}`);
  const checked=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  if(checked.status!==0)errors.push(`syntax error: ${rel}\n${checked.stderr.trim()}`);
}
const main=fs.readFileSync(path.join(root,"src/main.js"),"utf8");
const router=fs.readFileSync(path.join(root,"src/vision/GestureRouter.js"),"utf8");
const pointer=fs.readFileSync(path.join(root,"src/vision/PointerController.js"),"utf8");
const spatial=fs.readFileSync(path.join(root,"src/interaction/SpatialContentEngine.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");

if(/CommandPalette|ImportDrawer|TelemetryInspector/.test(main))errors.push("legacy mouse/keyboard UI controller detected in main.js");
for(const token of ["HybridInputManager","MouseInteractionController","ActivationRouter","InfoLens","OffscreenNavigator","DepthClickFeedback","PerformanceGovernor","GestureEngine","CalibrationEngine","HandRoleManager","FocusManager","SpatialContentEngine","CompactPanelDock"])if(!main.includes(token))errors.push(`missing main wiring: ${token}`);
if(!router.includes("DepthClickDetector")||!router.includes("roleFor("))errors.push("gesture router is not role-aware or depth-click enabled");
if(!pointer.includes('g.role!=="primary"'))errors.push("pointer does not enforce primary-hand selection");
if(!spatial.includes("panel-spatial-slot")||!spatial.includes("spatial-source-detached"))errors.push("detachable spatial content engine incomplete");
if(!html.includes("styles/hand-only.css"))errors.push("spatial interaction stylesheet not linked");
if(!html.includes('id="webcam"'))errors.push("webcam element missing");

if(errors.length){console.error("STARK checks failed\n"+errors.map(x=>" - "+x).join("\n"));process.exit(1)}
console.log(`STARK checks passed · hybrid input · far-hand tracking · triple-depth click · detachable spatial content · ${required.length} architecture files · ${VALIDATION_COMBINATIONS} validation permutations · ${COMPOSITION_CAPACITY.toLocaleString()} composable gesture contexts`);
