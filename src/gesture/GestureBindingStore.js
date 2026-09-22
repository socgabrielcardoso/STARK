const KEY="stark-gesture-bindings-v3";
export const ACTIONS=["target","control-menu","control-collapse","control-cancel","control-back","control-restore","home","undo","none"];
export const DEFAULT_BINDINGS={
  "primary:hold:point":"target",
  "control:hold:open-palm":"control-menu",
  "control:hold:fist":"control-collapse",
  "control:long:open-palm":"control-back",
  "control:swipe:left":"control-back",
  "control:swipe:down":"control-collapse",
  "control:swipe:up":"control-restore",
  "two:open-palm":"home",
  "two:fist":"undo"
};
export class GestureBindingStore{
  constructor(bus){this.bus=bus;this.bindings=this.load()}
  load(){try{return{...DEFAULT_BINDINGS,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return{...DEFAULT_BINDINGS}}}
  save(){localStorage.setItem(KEY,JSON.stringify(this.bindings));this.bus?.emit("gesture-bindings:change",this.bindings)}
  get(signal){return this.bindings[signal]||"none"}
  set(signal,action){this.bindings[signal]=action;this.save()}
  cycle(signal){const current=this.get(signal),i=ACTIONS.indexOf(current),next=ACTIONS[(i+1+ACTIONS.length)%ACTIONS.length];this.set(signal,next);return next}
  reset(){this.bindings={...DEFAULT_BINDINGS};this.save()}
}
