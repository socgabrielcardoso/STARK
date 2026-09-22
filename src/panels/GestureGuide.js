import {el} from "../utils/dom.js";
export function gestureGuide(){
  const items=[
    ["☝","POINT","Aim at a control with the index finger"],
    ["🤏","PINCH","Select a control or grab a panel header"],
    ["↔","PINCH + MOVE","Drag the active holographic panel"],
    ["🤏🤏","TWO PINCHES","Scale the active panel"],
    ["✊","HOLD FIST","Minimize the active panel"],
    ["✋","HOLD PALM","Reset panel transforms"]
  ];
  return el("div",{class:"list"},...items.map(([icon,title,desc])=>el("div",{class:"list-row"},el("div",{class:"list-row__main"},el("strong",{},`${icon}  ${title}`),el("small",{},desc)),el("span",{class:"badge"},"GESTURE"))));
}
