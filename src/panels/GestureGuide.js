import {el} from "../utils/dom.js";
export function gestureGuide(){
  const items=[
    ["PRIMARY ☝","POINT / DWELL","Target information precisely without triggering it."],
    ["PRIMARY 🤏","PINCH","Select. Hold the pinch to grab and pull content out of a panel."],
    ["PRIMARY ↔","MOVE WHILE HELD","Move files, evidence, metrics and floating information."],
    ["CONTROL ✊","FIST HOLD","Collapse or minimize the panel, group or object under the control hand."],
    ["CONTROL ✋","PALM HOLD","Open context actions where the control hand is positioned."],
    ["CONTROL ←","SWIPE LEFT","Back or cancel the current local interaction."],
    ["CONTROL ↑","SWIPE UP","Restore the most recently compacted panel."],
    ["BOTH 🤏🤏","TWO PINCHES","Scale, move and rotate the same focused object or panel."],
    ["BOTH ✋✋","TWO PALMS","Return to the primary command workspace."],
    ["BOTH ✊✊","TWO FISTS","Undo the latest reversible action."]
  ];
  return el("div",{class:"list"},...items.map(([icon,title,desc])=>el("div",{class:"list-row"},el("div",{class:"list-row__main"},el("strong",{},`${icon} · ${title}`),el("small",{},desc)),el("span",{class:"badge hybrid"},"ROLE-AWARE"))));
}
