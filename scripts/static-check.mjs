import fs from "node:fs";
import path from "node:path";
import {VALIDATION_COMBINATIONS} from "../src/data/validationCatalog.js";

const root=process.cwd();
const required=[
  "index.html","styles/base.css","styles/hud.css","styles/panels.css","src/main.js",
  "src/vision/HandTracking.js","src/vision/GestureRouter.js","src/vision/PointerController.js",
  "src/panels/PanelRegistry.js","src/data/realTelemetry.js","src/data/simulatedTelemetry.js"
];
const errors=[];
for(const file of required){if(!fs.existsSync(path.join(root,file)))errors.push(`missing: ${file}`)}
if(VALIDATION_COMBINATIONS<3000)errors.push(`validation matrix too small: ${VALIDATION_COMBINATIONS}`);

const sourceFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.(js|html)$/.test(entry.name))sourceFiles.push(full)}}
walk(path.join(root,"src"));sourceFiles.push(path.join(root,"index.html"));
for(const file of sourceFiles){
  const text=fs.readFileSync(file,"utf8");
  if(/\beval\s*\(/.test(text))errors.push(`eval detected: ${path.relative(root,file)}`);
  if(/document\.write\s*\(/.test(text))errors.push(`document.write detected: ${path.relative(root,file)}`);
  if(/BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/.test(text))errors.push(`private key pattern: ${path.relative(root,file)}`);
}
if(errors.length){console.error("STARK static checks failed\n"+errors.map(x=>" - "+x).join("\n"));process.exit(1)}
console.log(`STARK static checks passed · ${required.length} required files · ${VALIDATION_COMBINATIONS} validation permutations`);
