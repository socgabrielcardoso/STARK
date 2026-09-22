import {el} from "../utils/dom.js";
export function createRadar(){
  const radar=el("div",{class:"radar"},el("div",{class:"radar__sweep"}));
  [[28,33],[62,22],[74,59],[41,71],[54,48]].forEach(([x,y],i)=>radar.append(el("i",{class:"radar__blip",style:`left:${x}%;top:${y}%;opacity:${.45+i*.1}`})));
  return el("div",{class:"radar-wrap"},radar);
}
