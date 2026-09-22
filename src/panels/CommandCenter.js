import {el,clear} from "../utils/dom.js";
import {metricGrid,sectionTitle,listRows,sourceLegend} from "./MetricViews.js";
export class CommandCenter{
  constructor(bus){this.root=el("div");bus.on("telemetry:update",s=>this.render(s))}
  render(s){
    clear(this.root);
    const d=s.real.defender,w=s.real.windowsEvents,n=s.real.network,sim=s.simulated;
    this.root.append(sourceLegend(),metricGrid([
      {label:"Security posture",value:d.realTimeProtectionEnabled&&d.tamperProtected?"SECURE":"REVIEW",meta:"real Defender snapshot"},
      {label:"Threat level",value:sim.threatLevel,meta:"simulated correlation"},
      {label:"Active nodes",value:sim.activeDevices,meta:"simulation topology"},
      {label:"Events/sec",value:sim.eps,meta:"simulation stream"},
      {label:"Observed errors",value:w.levels.error,meta:"real event snapshot"},
      {label:"Established TCP",value:n.observedStates.established,meta:"real aggregate"}
    ]),sectionTitle("Priority signals","HYBRID"),listRows([
      {title:"Real-time protection",subtitle:"Microsoft Defender",value:d.realTimeProtectionEnabled?"ACTIVE":"OFF",className:"badge real"},
      {title:"Code Integrity observations",subtitle:"Event 3033 present in snapshot",value:"REVIEW",className:"badge real"},
      {title:"Threat radar",subtitle:"training scenario only",value:sim.threatLevel,className:"badge simulated"},
      {title:"Validation matrix",subtitle:"rules × contexts × sources",value:String(s.validationCombinations),className:"badge hybrid"}
    ]));
  }
}
