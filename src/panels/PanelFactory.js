import {el,sourceBadge} from "../utils/dom.js";
export function createPanel({id,title,source="simulated",x=20,y=20,w=360,h=260,content}){
  const body=el("div",{class:"hud-panel__body"});
  if(content instanceof Node)body.append(content);
  const header=el("div",{class:"hud-panel__header"},
    el("div",{class:"hud-panel__title"},sourceBadge(source),el("strong",{},title)),
    el("div",{class:"hud-panel__tools"},
      el("button",{class:"panel-tool",type:"button","data-action":"minimize","aria-label":"Minimize"},"—"),
      el("button",{class:"panel-tool",type:"button","data-action":"maximize","aria-label":"Maximize"},"□"),
      el("button",{class:"panel-tool",type:"button","data-action":"close","aria-label":"Close"},"×")));
  const panel=el("section",{class:"hud-panel",dataset:{panel:id},style:`left:${x}px;top:${y}px;width:${w}px;height:${h}px`},header,body,el("div",{class:"panel-resizer"}));
  return panel;
}
export function metric(label,value,meta=""){return el("div",{class:"metric"},el("label",{},label),el("strong",{},String(value)),el("small",{},meta))}
export function sectionTitle(text,tag=""){return el("div",{class:"section-title"},el("span",{},text),tag?el("span",{class:"muted"},tag):"")}
