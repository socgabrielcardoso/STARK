import {el,clear} from "../utils/dom.js";
import {FILE_CATALOG} from "../data/fileCatalog.js";
export class FileExplorer{
  constructor(bus){this.bus=bus;this.root=el("div");this.path=[];this.render(FILE_CATALOG)}
  render(items){
    clear(this.root);
    const grid=el("div",{class:"file-grid"});
    for(const item of items){
      const tile=el("button",{class:"file-tile",type:"button"},el("span",{class:"icon"},item.icon||"◇"),el("strong",{},item.name));
      tile.addEventListener("click",()=>item.children?this.render(item.children):item.panel&&this.bus.emit("panel:open",{id:item.panel}));
      grid.append(tile);
    }
    this.root.append(grid);return this.root;
  }
}
