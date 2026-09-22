import {clamp} from "../utils/math.js";
const SLOT_MAP={
  COMMAND:["tl","tr","bl","br"],
  SOC:["tl","tr","bl","br"],
  NETWORK:["left","right","br","tr"],
  LAB:["tl","tr","bl","br"]
};
export class SpatialLayout{
  constructor(layer,bus){this.layer=layer;this.bus=bus}
  rect(slot,index=0){
    const box=this.layer.getBoundingClientRect(),gap=18,w=Math.max(290,Math.min(430,(box.width-gap*3)/2)),h=Math.max(220,Math.min(330,(box.height-gap*3)/2));
    const slots={
      tl:{x:gap,y:gap,w,h},tr:{x:box.width-w-gap,y:gap,w,h},
      bl:{x:gap,y:box.height-h-gap,w,h},br:{x:box.width-w-gap,y:box.height-h-gap,w,h},
      left:{x:gap,y:Math.max(gap,(box.height-h)/2),w,h},right:{x:box.width-w-gap,y:Math.max(gap,(box.height-h)/2),w,h}
    };
    return slots[slot]||slots[["tl","tr","bl","br"][index%4]];
  }
  arrange(panels,workspace="COMMAND"){
    const slots=SLOT_MAP[workspace]||SLOT_MAP.COMMAND;
    panels.forEach((panel,index)=>this.snap(panel,this.rect(slots[index]||slots[index%slots.length],index)));
    this.bus?.emit("layout:arranged",{workspace,count:panels.length});
  }
  snap(panel,target){
    if(!panel||!target)return;
    panel.classList.remove("maximized","minimized");
    panel.style.left=`${target.x}px`;panel.style.top=`${target.y}px`;
    panel.style.width=`${target.w}px`;panel.style.height=`${target.h}px`;
    panel.style.transform="";panel.dataset.snapped="true";
  }
  snapToNearest(panel){
    const box=this.layer.getBoundingClientRect(),r=panel.getBoundingClientRect(),cx=r.left-box.left+r.width/2,cy=r.top-box.top+r.height/2;
    const horizontal=cx<box.width/2?"l":"r",vertical=cy<box.height/2?"t":"b";
    this.snap(panel,this.rect(vertical+horizontal));
  }
  keepInBounds(panel){
    const box=this.layer.getBoundingClientRect(),r=panel.getBoundingClientRect();
    panel.style.left=`${clamp(r.left-box.left,0,Math.max(0,box.width-r.width))}px`;
    panel.style.top=`${clamp(r.top-box.top,0,Math.max(0,box.height-r.height))}px`;
  }
}
