export class CyberModuleEngine{
  constructor(bus){this.bus=bus;this.modules=new Map();this.actions=new Map();this.context={}}
  register(id,definition){this.modules.set(id,{id,...definition});for(const action of definition.actions||[])this.actions.set(`${id}:${action.id}`,action);return this}
  get(id){return this.modules.get(id)}
  actionsFor(type){return [...this.modules.values()].filter(m=>m.entityTypes?.includes(type)).flatMap(m=>m.actions||[])}
  activate(moduleId,actionId,payload){const action=this.actions.get(`${moduleId}:${actionId}`);if(!action)return false;this.bus.emit("cyber:action",{moduleId,actionId,payload});action.run?.(payload,this.bus);return true}
  seed(){
    this.register("investigation",{entityTypes:["alert","incident","log","ip","device","user"],actions:[
      {id:"inspect",label:"Inspect",run:(p,b)=>b.emit("cyber:inspect",p)},{id:"timeline",label:"Timeline",run:(p,b)=>b.emit("cyber:timeline",p)},{id:"evidence",label:"Evidence",run:(p,b)=>b.emit("cyber:evidence",p)},{id:"link",label:"Relate",run:(p,b)=>b.emit("relation:start",p)}
    ]});
    this.register("workspace",{entityTypes:["file","data"],actions:[{id:"archive",label:"Archive"},{id:"favorite",label:"Favorite"},{id:"trash",label:"Trash"}]});return this;
  }
}
