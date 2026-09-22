import {el,clear} from "../utils/dom.js";
import {VirtualFileSystem} from "../data/VirtualFileSystem.js";
export class FileExplorer{
  constructor(bus){
    this.bus=bus;this.fs=new VirtualFileSystem();this.root=el("div",{class:"air-files"});this.path=[];
    this.render();
    this.bus.on("air:drop",payload=>this.onDrop(payload));
    this.bus.on("vfs:reset",()=>{this.fs.reset();this.path=[];this.render()});
    this.bus.on("files:context-action",x=>this.contextAction(x));
    this.bus.on("air:activate",x=>{if(x.action==="files-home")this.home();if(x.action==="files-up")this.up()});
  }
  current(){return this.fs.findFolder(this.path)||this.fs.tree}
  render(){
    clear(this.root);
    const bar=el("div",{class:"file-toolbar"},
      el("button",{class:"air-chip",type:"button",dataset:{airAction:"files-home"}},"⌂ HOME"),
      el("div",{class:"file-path"},["STARK",...this.path].join("  /  ")),
      el("button",{class:"air-chip",type:"button",dataset:{airAction:"files-up"}},"↖ UP")
    );
    const grid=el("div",{class:"file-grid",dataset:{dropPath:this.path.join("/")||"/"}});
    for(const item of this.current().children||[]){
      const folder=item.type==="folder";
      const tile=el("div",{
        class:`file-tile ${folder?"folder":"file"} ${item.trash?"trash":""}`,
        dataset:{airDraggable:item.id?"file":"",fileId:item.id||"",entityType:item.id?"file":"folder",folderName:folder?item.name:"",airOpen:"true"}
      },el("span",{class:"icon"},item.icon||(folder?"▱":"◇")),el("strong",{},item.name),
      el("small",{class:"muted"},folder?`${item.children?.length||0} items`:(item.kind||item.type).toUpperCase()));
      tile.addEventListener("click",event=>{if(event.isTrusted)return;this.open(item)});
      grid.append(tile);
    }
    this.root.append(bar,grid);
  }
  open(item){if(item.type==="folder"){this.path.push(item.name);this.render();this.bus.emit("files:path",{path:[...this.path]});return}if(item.panel)this.bus.emit("panel:open",{id:item.panel})}
  home(){this.path=[];this.render()}
  up(){this.path.pop();this.render()}
  contextAction({action,payload}){
    const hit=this.fs.findItem(payload?.id);if(!hit)return;
    if(action==="open")this.open(hit.item);
    if(action==="archive"){this.fs.move(payload.id,["Archive"]);this.render();this.bus.emit("files:archived",{id:payload.id})}
    if(action==="trash"){this.fs.remove(payload.id);this.render();this.bus.emit("files:trashed",{id:payload.id})}
  }
  onDrop({payload,target}){
    if(payload?.type!=="file")return;
    const folderTile=target?.closest?.("[data-folder-name]"),dropGrid=target?.closest?.("[data-drop-path]");
    let destination=null;
    if(folderTile?.dataset.folderName)destination=[...this.path,folderTile.dataset.folderName];
    else if(dropGrid)destination=dropGrid.dataset.dropPath==="/"?[]:dropGrid.dataset.dropPath.split("/").filter(Boolean);
    if(!destination)return;
    const moved=this.fs.move(payload.id,destination);
    if(moved){this.render();this.bus.emit("files:moved",{id:payload.id,destination})}
  }
}
