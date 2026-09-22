import {el} from "../utils/dom.js";
export class CalibrationOverlay{
  constructor(bus){this.bus=bus;this.node=null}
  mount(root){
    const ring=el("div",{class:"calibration-ring"},el("i"),el("i"),el("i"));
    const progress=el("div",{class:"calibration-progress"},el("i"));
    const status=el("p",{class:"calibration-status"},"Show both hands naturally inside the frame");
    this.node=el("section",{class:"calibration-overlay"},ring,el("p",{class:"eyebrow"},"STARK HAND CALIBRATION"),el("h2",{},"Mapping your interaction space"),status,progress,el("small",{},"Move naturally, open your hands and perform a few pinches. Sensitivity adapts automatically."));
    root.append(this.node);
    this.bus.on("calibration:start",()=>this.node.classList.add("visible"));
    this.bus.on("calibration:progress",x=>{progress.firstElementChild.style.width=`${Math.round(x.progress*100)}%`;status.textContent=x.handCount?x.progress<.35?"Measuring hand size and reach…":x.progress<.72?"Learning motion speed and stability…":"Tuning pinch sensitivity and jitter control…":"Show at least one hand to the camera"});
    this.bus.on("calibration:complete",p=>{status.textContent=`Calibrated · pinch ${p.pinchThreshold} · smoothing ${p.smoothing}`;this.node.classList.add("done");setTimeout(()=>this.node.classList.remove("visible"),700)});
    return this.node;
  }
}
