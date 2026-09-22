import {el,clear} from "../utils/dom.js";
import {VALIDATION_RULES,VALIDATION_CONTEXTS,VALIDATION_SOURCES,VALIDATION_COMBINATIONS} from "../data/validationCatalog.js";
export class ValidationView{
  constructor(bus){this.bus=bus;this.root=el("div");this.bus.on("telemetry:update",s=>this.render(s))}
  render(s){
    clear(this.root);const baselinePass=s.validation.filter(x=>x.pass).length,baselineScore=Math.round(baselinePass/s.validation.length*100),summary=s.validationSummary;
    this.root.append(
      el("div",{class:"source-strip"},el("span",{class:"badge hybrid"},"EXECUTED MATRIX"),el("span",{class:"badge simulated"},`${VALIDATION_COMBINATIONS} UNIQUE CHECKS`)),
      el("div",{class:"validation-score"},`${baselineScore}%`),
      el("div",{class:"validation-grid"},this.cell(VALIDATION_RULES.length,"RULES"),this.cell(VALIDATION_CONTEXTS.length,"CONTEXTS"),this.cell(VALIDATION_SOURCES.length,"SOURCES")),
      el("div",{class:"validation-grid"},this.cell(summary.pass,"PASS"),this.cell(summary.warn,"WARN"),this.cell(summary.review,"REVIEW")),
      el("div",{class:"section-title"},el("span",{},"MATRIX SAMPLE"),el("span",{class:"muted"},"3072 evaluated")),
      ...s.validationMatrix.filter(x=>x.status!=="pass").slice(0,12).map(v=>el("div",{class:"list-row"},el("div",{class:"list-row__main"},el("strong",{},v.rule),el("small",{},`${v.context} · ${v.source}`)),el("span",{class:`badge ${v.status==="review"?"simulated":"hybrid"}`},v.status.toUpperCase())))
    );
  }
  cell(v,l){return el("div",{class:"validation-cell"},el("strong",{},v),el("small",{},l))}
}
