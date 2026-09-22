export class ObjectManager{
  constructor(bus){this.bus=bus;this.selected=new Set();this.favorite=new Set(JSON.parse(localStorage.getItem("stark-favorites")||"[]"));this.clipboard=[]}
  start(){
    this.bus.on("object:select",x=>this.select(x));this.bus.on("object:toggle",x=>this.toggle(x));this.bus.on("object:favorite",x=>this.favoriteObject(x));
    this.bus.on("object:clear",()=>this.clear());this.bus.on("object:copy",x=>this.copy(x));
  }
  key(x){return`${x.type||"object"}:${x.id||x.name||"unknown"}`}
  select(x,{multi=false}={}){if(!multi)this.selected.clear();this.selected.add(this.key(x));this.bus.emit("object:selection",{selected:[...this.selected],object:x})}
  toggle(x){const k=this.key(x);this.selected.has(k)?this.selected.delete(k):this.selected.add(k);this.bus.emit("object:selection",{selected:[...this.selected],object:x})}
  clear(){this.selected.clear();this.bus.emit("object:selection",{selected:[]})}
  favoriteObject(x){const k=this.key(x);this.favorite.has(k)?this.favorite.delete(k):this.favorite.add(k);localStorage.setItem("stark-favorites",JSON.stringify([...this.favorite]));this.bus.emit("object:favorites",{favorites:[...this.favorite]})}
  copy(x){this.clipboard=[x];this.bus.emit("object:clipboard",{items:this.clipboard})}
}
