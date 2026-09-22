import {el,clear} from "../utils/dom.js";
export class TelemetryRawPanel{
  constructor(bus){this.root=el("div");this.output=el("pre",{class:"mono telemetry-raw"},"Waiting for telemetry…");this.root.append(this.output);bus.on("telemetry:update",s=>this.render(s))}
  render(s){
    clear(this.output);
    this.output.textContent=JSON.stringify({
      mode:s.sourceMode,
      capturedAt:s.real.capturedAt,
      defender:s.real.defender,
      network:s.real.network,
      windowsEvents:{levels:s.real.windowsEvents.levels,topEventIds:s.real.windowsEvents.topEventIds},
      simulation:{threatLevel:s.simulated.threatLevel,eps:s.simulated.eps,throughputMbps:s.simulated.throughputMbps,activeDevices:s.simulated.activeDevices},
      validation:s.validationSummary
    },null,2);
  }
}
