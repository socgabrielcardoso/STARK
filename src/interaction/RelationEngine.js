const KEY="stark-relations-v1";
export class RelationEngine{
  constructor(bus){this.bus=bus;this.links=this.load();this.svg=null;this.pending=null}
  mount(root){
    this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg");this.svg.classList.add("relation-layer");root.append(this.svg);
    this.bus.on("relation:start",x=>{this.pending=x;this.bus.emit("relation:pending",x)});
    this.bus.on("relation:complete",x=>this.complete(x));
    this.bus.on("air:drop",x=>this.tryDrop(x));
    this.bus.on("workspace:change",()=>setTimeout(()=>this.render(),80));
    this.bus.on("air:panel-release",()=>this.render());
    addEventListener("resize",()=>this.render());return this.svg;
  }
  load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}
  save(){localStorage.setItem(KEY,JSON.stringify(this.links))}
  complete(target,source=this.pending){
    if(!source||!target||source.id===target.id)return null;
    const exists=this.links.some(l=>l.from.id===source.id&&l.to.id===target.id||l.from.id===target.id&&l.to.id===source.id);if(exists){this.pending=null;return null}
    const link={id:crypto.randomUUID?.()||String(Date.now()),from:source,to:target,time:Date.now()};this.links.push(link);this.pending=null;this.save();this.bus.emit("relation:created",link);this.render();return link;
  }
  tryDrop({payload,target}){
    const other=target?.closest?.("[data-air-draggable]");if(!payload||!other)return;
    const otherId=other.dataset.fileId||other.dataset.dataId||other.dataset.entityId,otherType=other.dataset.entityType||other.dataset.airDraggable;
    if(otherId&&otherId!==payload.id)this.complete({type:otherType,id:otherId,name:other.querySelector("strong")?.textContent||otherId},this.pending||payload);
  }
  render(){
    while(this.svg?.firstChild)this.svg.firstChild.remove();
    for(const link of this.links.slice(-30)){
      const a=document.querySelector(`[data-file-id="${CSS.escape(link.from.id)}"],[data-data-id="${CSS.escape(link.from.id)}"],[data-entity-id="${CSS.escape(link.from.id)}"]`);
      const b=document.querySelector(`[data-file-id="${CSS.escape(link.to.id)}"],[data-data-id="${CSS.escape(link.to.id)}"],[data-entity-id="${CSS.escape(link.to.id)}"]`);
      if(!a||!b)continue;const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),line=document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1",ar.left+ar.width/2);line.setAttribute("y1",ar.top+ar.height/2);line.setAttribute("x2",br.left+br.width/2);line.setAttribute("y2",br.top+br.height/2);line.setAttribute("class","relation-line");this.svg.append(line)
    }
  }
}
