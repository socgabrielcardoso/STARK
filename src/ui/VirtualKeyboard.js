import {el,clear} from "../utils/dom.js";
const ROWS=["1234567890","QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
export class VirtualKeyboard{
  constructor(bus){this.bus=bus;this.node=el("div",{class:"virtual-keyboard"});this.value="";this.target=null;this.render()}
  render(){
    clear(this.node);
    const display=el("div",{class:"virtual-keyboard__display"},this.value||"GESTURE INPUT");
    this.node.append(display);
    for(const row of ROWS){
      const line=el("div",{class:"virtual-keyboard__row"});
      [...row].forEach(ch=>{const b=el("button",{class:"vk-key",type:"button"},ch);b.addEventListener("click",e=>{if(e.isTrusted)return;this.type(ch)});line.append(b)});
      this.node.append(line);
    }
    const controls=el("div",{class:"virtual-keyboard__row"});
    [["SPACE"," "],["BACK","BACK"],["CLEAR","CLEAR"],["ENTER","ENTER"]].forEach(([label,val])=>{const b=el("button",{class:"vk-key vk-key--wide",type:"button"},label);b.addEventListener("click",e=>{if(e.isTrusted)return;this.type(val)});controls.append(b)});this.node.append(controls);
  }
  open(initial="",target=null){this.value=initial;this.target=target;this.render();this.bus.emit("virtual-keyboard:open",{value:this.value,target})}
  type(key){
    if(key==="BACK")this.value=this.value.slice(0,-1);else if(key==="CLEAR")this.value="";else if(key==="ENTER"){this.bus.emit("virtual-keyboard:submit",{value:this.value,target:this.target});return}else this.value+=key;
    this.render();this.bus.emit("virtual-keyboard:change",{value:this.value,target:this.target});
  }
}
