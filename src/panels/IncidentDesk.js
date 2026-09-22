import {el} from "../utils/dom.js";
import {INCIDENTS} from "../data/incidents.js";
export function incidentDesk(){
  return el("div",{class:"list"},...INCIDENTS.map(i=>el("div",{
      class:"list-row entity-row",
      dataset:{airDraggable:"data",dataId:i.id,entityId:i.id,entityType:"incident"}
    },
    el("div",{class:"list-row__main"},el("strong",{},`${i.id} · ${i.title}`),el("small",{},`${i.source.toUpperCase()} · ${i.mitre||`Event ${i.eventId}`}`)),
    el("span",{class:`badge ${i.source==="simulated"?"simulated":"real"}`},`${i.severity} / ${i.status}`))));
}
