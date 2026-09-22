import {el} from "../utils/dom.js";
import {metricGrid,sectionTitle,listRows} from "./MetricViews.js";
export function processView(){
  return el("div",{},metricGrid([
    {label:"Telemetry origin",value:"REAL",meta:"sanitized snapshot"},
    {label:"Defender engine",value:"PRESENT",meta:"MsMpEng observed"},
    {label:"VPN client",value:"PRESENT",meta:"VPN processes observed"},
    {label:"PowerShell",value:"ACTIVE",meta:"snapshot observation"}
  ]),sectionTitle("Process families"),listRows([
    {title:"Browser processes",subtitle:"multiple worker processes observed",value:"ACTIVE",className:"badge real"},
    {title:"Security services",subtitle:"Defender and Security Health components",value:"ACTIVE",className:"badge real"},
    {title:"Remote desktop client",subtitle:"interactive tooling observed",value:"SEEN",className:"badge real"},
    {title:"Virtualization services",subtitle:"Hyper-V related event activity",value:"SEEN",className:"badge real"}
  ]));
}
