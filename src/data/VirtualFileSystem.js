const DEFAULT_TREE={
  type:"folder",name:"STARK",children:[
    {type:"folder",name:"Security",icon:"🛡",children:[
      {id:"f-defender",type:"file",name:"Defender_Status.snapshot",panel:"defender",kind:"real"},
      {id:"f-events",type:"file",name:"Windows_Events.snapshot",panel:"event-intel",kind:"real"},
      {id:"f-validation",type:"file",name:"Validation_Matrix.lab",panel:"validation",kind:"hybrid"}
    ]},
    {type:"folder",name:"Network",icon:"◉",children:[
      {id:"f-connections",type:"file",name:"Connections.snapshot",panel:"connections",kind:"real"},
      {id:"f-map",type:"file",name:"Network_Map.sim",panel:"network",kind:"simulated"},
      {id:"f-globe",type:"file",name:"Global_Links.sim",panel:"globe",kind:"simulated"}
    ]},
    {type:"folder",name:"SOC",icon:"⌁",children:[
      {id:"f-radar",type:"file",name:"Threat_Radar.sim",panel:"radar",kind:"simulated"},
      {id:"f-logs",type:"file",name:"Live_Log_Mixer.lab",panel:"logs",kind:"hybrid"},
      {id:"f-incidents",type:"file",name:"Incident_Desk.lab",panel:"incidents",kind:"hybrid"}
    ]},
    {type:"folder",name:"Interfaces",icon:"✦",children:[
      {id:"f-gestures",type:"file",name:"Gesture_Lab.tool",panel:"gestures",kind:"hybrid"},
      {id:"f-donna",type:"file",name:"Donna_AI.console",panel:"donna",kind:"hybrid"},
      {id:"f-command",type:"file",name:"Cyber_Command.hud",panel:"command",kind:"hybrid"}
    ]},
    {type:"folder",name:"Archive",icon:"▱",children:[]},
    {type:"folder",name:"Trash",icon:"⌫",trash:true,children:[]}
  ]
};
const clone=x=>JSON.parse(JSON.stringify(x));
export class VirtualFileSystem{
  constructor(storageKey="stark-vfs-v2"){this.storageKey=storageKey;this.tree=this.load()}
  load(){try{return JSON.parse(localStorage.getItem(this.storageKey))||clone(DEFAULT_TREE)}catch{return clone(DEFAULT_TREE)}}
  save(){localStorage.setItem(this.storageKey,JSON.stringify(this.tree))}
  reset(){this.tree=clone(DEFAULT_TREE);this.save()}
  findFolder(path=[]){let node=this.tree;for(const name of path){node=node.children?.find(x=>x.type==="folder"&&x.name===name);if(!node)break}return node}
  findItem(id,node=this.tree,parent=null,path=[]){
    if(node.id===id)return{item:node,parent,path};
    for(const child of node.children||[]){const hit=this.findItem(id,child,node,node===this.tree?path:[...path,node.name]);if(hit)return hit}return null;
  }
  move(id,destinationPath=[]){
    const hit=this.findItem(id),dest=this.findFolder(destinationPath);if(!hit||!hit.parent||!dest||dest.type!=="folder")return false;
    if(hit.parent===dest)return false;
    hit.parent.children=hit.parent.children.filter(x=>x!==hit.item);dest.children.push(hit.item);this.save();return true;
  }
  remove(id){return this.move(id,["Trash"])}
  restore(id,target=["Archive"]){return this.move(id,target)}
}
