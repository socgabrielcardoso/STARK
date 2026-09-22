import {el,clear} from "../utils/dom.js";
export class DiagnosticsPanel{
  constructor(bus){this.bus=bus;this.root=el("div",{class:"diagnostics-grid"});this.state={hands:0,fps:0,last:performance.now(),frames:0,gesture:"none",intent:"none",target:"empty",history:{undo:0,redo:0}};this.bind()}
  bind(){
    this.bus.on("gestures:frame",x=>{this.state.hands=x.hands.length;this.state.gesture=x.hands.map(h=>h.name).join(" + ")||"none";this.state.frames++;const now=performance.now();if(now-this.state.last>1000){this.state.fps=this.state.frames;this.state.frames=0;this.state.last=now;this.render()}});
    this.bus.on("intent",x=>{this.state.intent=x.name;this.render()});this.bus.on("interaction:context",x=>{this.state.target=x.type||"empty";this.render()});this.bus.on("history:change",x=>{this.state.history=x;this.render()});
  }
  render(){clear(this.root);for(const [k,v] of Object.entries({Hands:this.state.hands,"Gesture FPS":this.state.fps,Gesture:this.state.gesture,Intent:this.state.intent,Target:this.state.target,Undo:this.state.history.undo||0,Redo:this.state.history.redo||0}))this.root.append(el("div",{class:"metric"},el("label",{},k),el("strong",{},String(v))))}
}
