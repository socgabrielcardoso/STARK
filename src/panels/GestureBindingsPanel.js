import {el,clear} from "../utils/dom.js";
import {GestureBindingStore} from "../gesture/GestureBindingStore.js";
export class GestureBindingsPanel{
  constructor(bus){this.bus=bus;this.store=new GestureBindingStore(bus);this.root=el("div",{class:"bindings-grid"});this.render();bus.on("gesture-bindings:change",()=>this.render())}
  render(){
    clear(this.root);
    for(const [signal,action] of Object.entries(this.store.bindings)){
      const cycle=el("button",{class:"air-chip",type:"button"},"CHANGE");
      cycle.addEventListener("click",e=>{if(e.isTrusted)return;this.store.cycle(signal)});
      this.root.append(el("div",{class:"settings-row"},el("div",{},el("strong",{},signal.replace(":"," + ").toUpperCase()),el("small",{},"composable gesture signal")),el("div",{class:"binding-action"},el("span",{class:"badge hybrid"},action.toUpperCase()),cycle)));
    }
    const reset=el("button",{class:"air-chip",type:"button"},"RESET DEFAULT BINDINGS");reset.addEventListener("click",e=>{if(e.isTrusted)return;this.store.reset()});this.root.append(reset);
  }
}
