import {REAL_TELEMETRY} from "../data/realTelemetry.js";
import {buildSimulatedTelemetry} from "../data/simulatedTelemetry.js";
import {evaluateSnapshot,buildValidationMatrix,summarizeValidationMatrix,VALIDATION_COMBINATIONS} from "../data/validationCatalog.js";
import {clamp} from "../utils/math.js";
export class TelemetryEngine{
  constructor(bus){
    this.bus=bus;this.real=REAL_TELEMETRY;this.sim=buildSimulatedTelemetry();this.timer=null;
    this.validation=evaluateSnapshot({real:this.real,simulated:this.sim});
    this.validationMatrix=buildValidationMatrix({real:this.real,simulated:this.sim});
    this.validationSummary=summarizeValidationMatrix(this.validationMatrix);
  }
  start(){this.emit();this.timer=setInterval(()=>this.tick(),1000)}
  stop(){clearInterval(this.timer)}
  tick(){
    const drift=(Math.random()-.5)*18;this.sim.eps=Math.round(clamp(this.sim.eps+drift,120,900));
    this.sim.throughputMbps=clamp(Number(this.sim.throughputMbps)+(Math.random()-.5)*5,4,96).toFixed(1);
    const maxRisk=Math.max(...this.sim.hosts.map(h=>h.risk));this.sim.threatLevel=maxRisk>76?"ELEVATED":maxRisk>55?"GUARDED":"LOW";this.emit();
  }
  emit(){this.bus.emit("telemetry:update",this.snapshot())}
  snapshot(){return{real:this.real,simulated:this.sim,validation:this.validation,validationMatrix:this.validationMatrix,validationSummary:this.validationSummary,validationCombinations:VALIDATION_COMBINATIONS,sourceMode:"hybrid",timestamp:Date.now()}}
}
