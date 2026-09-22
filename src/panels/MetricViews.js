import {el} from "../utils/dom.js";
import {metric,sectionTitle} from "./PanelFactory.js";
export function metricGrid(items){return el("div",{class:"metric-grid"},...items.map(i=>metric(i.label,i.value,i.meta||"")))}
export function listRows(items){return el("div",{class:"list"},...items.map(i=>el("div",{class:"list-row"},el("div",{class:"list-row__main"},el("strong",{},i.title),el("small",{},i.subtitle||"")),el("span",{class:i.className||"badge"},i.value||""))))}
export function sourceLegend(){return el("div",{class:"source-strip"},el("span",{class:"badge real"},"REAL SANITIZED"),el("span",{class:"badge simulated"},"SIMULATED"),el("span",{class:"badge hybrid"},"HYBRID"))}
export function tinyBar(value=0){const wrap=el("div",{style:"height:5px;border-radius:5px;background:rgba(98,231,255,.08);overflow:hidden"});wrap.append(el("i",{style:`display:block;height:100%;width:${Math.max(2,Math.min(100,value))}%;background:currentColor;box-shadow:0 0 10px currentColor`}));return wrap}
export {sectionTitle};
