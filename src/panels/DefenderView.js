import {el,clear} from "../utils/dom.js";
import {metricGrid,sectionTitle,listRows} from "./MetricViews.js";
export class DefenderView{
  constructor(bus){this.root=el("div");bus.on("telemetry:update",s=>this.render(s.real.defender))}
  render(d){clear(this.root);this.root.append(metricGrid([
    {label:"Real-time",value:d.realTimeProtectionEnabled?"ON":"OFF",meta:"real snapshot"},
    {label:"Tamper",value:d.tamperProtected?"ON":"OFF",meta:"real snapshot"},
    {label:"Smart App",value:d.smartAppControl,meta:"real snapshot"},
    {label:"Signature age",value:d.signaturesOutOfDate?"STALE":"CURRENT",meta:d.signatureVersion}
  ]),sectionTitle("ENGINE STATUS"),listRows([
    {title:"Defender service",subtitle:`Version ${d.productVersion}`,value:d.serviceEnabled?"RUNNING":"STOPPED",className:"badge real"},
    {title:"Network Inspection",subtitle:"NIS",value:d.nisEnabled?"ENABLED":"OFF",className:"badge real"},
    {title:"Quick scan age",subtitle:"days since snapshot scan",value:`${d.quickScanAgeDays}d`,className:"badge"},
    {title:"Full scan age",subtitle:"days since snapshot scan",value:`${d.fullScanAgeDays}d`,className:"badge"}
  ]))}
}
