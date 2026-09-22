import {el,clear} from "../utils/dom.js";
import {VALIDATION_RULES,VALIDATION_CONTEXTS,VALIDATION_SOURCES,VALIDATION_COMBINATIONS} from "../data/validationCatalog.js";
export class ValidationView{
  constructor(bus){this.bus=bus;this.root=el("div");this.bus.on("telemetry:update",s=>this.render(s))}
  render(s){
    clear(this.root);const passed=s.validation.filter(x=>x.pass).length,score=Math.round(passed/s.validation.length*100);
    this.root.append(el("div",{class:"source-strip"},el("span",{class:"badge hybrid"},"VALIDATION MATRIX"),el("span",{class:"badge simulated"},`${VALIDATION_COMBINATIONS} COMBINATIONS`)),
      el("div",{class:"validation-score"},`${score}%`),
      el("div",{class:"validation-grid"},
        this.cell(VALIDATION_RULES.length,"RULES"),this.cell(VALIDATION_CONTEXTS.length,"CONTEXTS"),this.cell(VALIDATION_SOURCES.length,"SOURCES")),
      el("div",{class:"section-title"},"BASELINE CHECKS"),
      ...s.validation.map(v=>el("div",{class:"list-row"},el("div",{class:"list-row__main"},el("strong",{},v.name),el("small",{},v.id)),el("span",{class:`badge ${v.pass?"real":"simulated"}`},v.pass?"PASS":"REVIEW")));
  }
  cell(v,l){return el("div",{class:"validation-cell"},el("strong",{},v),el("small",{},l))}
}
