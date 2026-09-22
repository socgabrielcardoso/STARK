import {el,clear} from "../utils/dom.js";
export class InfoLens{
  constructor({bus,root,spatial}){this.bus=bus;this.root=root;this.spatial=spatial;this.node=null;this.current=null}
  mount(){
    this.node=el("aside",{class:"info-lens","aria-label":"Information lens"});
    this.root.append(this.node);this.renderEmpty();
    this.bus.on("info:open",x=>this.open(x.payload||x,x.point));this.bus.on("info:close",()=>this.close());
    return this.node;
  }
  inspect(payload){
    const node=payload?.node,raw=(node?.textContent||payload?.name||payload?.id||"").replace(/\s+/g," ").trim();
    const panel=node?.closest?.(".hud-panel"),source=panel?.querySelector(".hud-panel__title strong")?.textContent||payload?.originPanel||"FLOATING SPACE";
    const details=[];
    for(const part of raw.split(/\s{2,}| · | \| /).map(x=>x.trim()).filter(Boolean).slice(0,12))details.push(part);
    return{type:(payload?.type||payload?.entityType||"data").toUpperCase(),id:payload?.id||node?.dataset?.spatialId||"—",title:payload?.name||node?.querySelector?.("strong,label")?.textContent?.trim()||raw.slice(0,72)||"INFORMATION",source,raw,details,node};
  }
  open(payload,point=null){
    this.current=this.inspect(payload);clear(this.node);this.node.classList.add("visible");
    if(point){this.node.style.setProperty("--lens-x",Math.round(point.x)+"px");this.node.style.setProperty("--lens-y",Math.round(point.y)+"px")}
    const head=el("div",{class:"info-lens__head"},el("div",{},el("small",{},this.current.type),el("strong",{},this.current.title)),this.button("×",()=>this.close(),"info-lens__close"));
    const meta=el("div",{class:"info-lens__meta"},el("span",{},this.current.source),el("span",{},this.current.id));
    const body=el("div",{class:"info-lens__body"},...this.current.details.map((d,i)=>el("div",{class:"info-lens__field"},el("small",{},i===0?"PRIMARY":"DETAIL "+i),el("strong",{},d))));
    const actions=el("div",{class:"info-lens__actions"},this.button("FLOAT",()=>this.float()),this.button("FOCUS",()=>this.focus()),this.button("CLOSE",()=>this.close()));
    this.node.append(head,meta,body,actions);this.bus.emit("info:shown",{info:this.current});return this.current;
  }
  button(label,fn,className="air-chip"){const b=el("button",{class:className,type:"button"},label);b.addEventListener("click",fn);return b}
  float(){
    const source=this.current?.node;if(!source)return;
    const r=source.getBoundingClientRect(),point={x:Math.min(innerWidth-80,Math.max(80,r.left+r.width/2)),y:Math.min(innerHeight-80,Math.max(80,r.top+r.height/2))};
    const payload={type:"spatial",entityType:this.current.type.toLowerCase(),id:this.current.id,name:this.current.title};
    this.spatial?.promote(source,payload,point,document.elementFromPoint(point.x,point.y));this.bus.emit("info:floated",{id:this.current.id});this.close();
  }
  focus(){this.current?.node?.classList.add("object-selected");this.current?.node?.scrollIntoView?.({block:"nearest",inline:"nearest",behavior:"smooth"});this.bus.emit("info:focused",{id:this.current?.id})}
  close(){this.node?.classList.remove("visible");this.current=null;this.bus.emit("info:hidden",{})}
  renderEmpty(){this.node.textContent=""}
}
