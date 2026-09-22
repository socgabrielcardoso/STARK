const ENTITY_TYPES=["ip","device","user","alert","incident","log","file","data","process","event","connection"];
export class DataEngine{
  constructor(bus){this.bus=bus;this.entities=new Map();this.relations=[];this.filters={};this.timeline=[]}
  register(entity){
    if(!entity?.id)return null;const normalized={type:"data",label:entity.id,...entity};
    if(!ENTITY_TYPES.includes(normalized.type))normalized.type="data";
    this.entities.set(normalized.id,normalized);this.bus?.emit("data:entity-registered",normalized);return normalized;
  }
  registerMany(items=[]){return items.map(x=>this.register(x)).filter(Boolean)}
  get(id){return this.entities.get(id)||null}
  query({type,text,riskMin,source}={}){
    const q=String(text||"").toLowerCase();
    return [...this.entities.values()].filter(x=>
      (!type||x.type===type)&&(!source||x.source===source)&&
      (riskMin==null||Number(x.risk||0)>=riskMin)&&
      (!q||JSON.stringify(x).toLowerCase().includes(q))
    );
  }
  relate(from,to,meta={}){
    if(!from||!to||from===to)return null;const link={id:crypto.randomUUID?.()||String(Date.now()),from,to,time:Date.now(),...meta};this.relations.push(link);this.timeline.push({kind:"relation",...link});this.bus?.emit("data:relation",link);return link;
  }
  update(id,patch){
    const current=this.get(id);if(!current)return null;const next={...current,...patch};this.entities.set(id,next);this.timeline.push({kind:"update",id,patch,time:Date.now()});this.bus?.emit("data:entity-updated",next);return next;
  }
  remove(id){const item=this.get(id);if(!item)return null;this.entities.delete(id);this.timeline.push({kind:"remove",id,time:Date.now()});this.bus?.emit("data:entity-removed",item);return item}
  snapshot(){return{entities:[...this.entities.values()],relations:[...this.relations],timeline:[...this.timeline]}}
}
