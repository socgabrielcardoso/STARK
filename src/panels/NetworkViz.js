import {el} from "../utils/dom.js";
import {clamp} from "../utils/math.js";
export class NetworkViz{
  constructor(bus){
    this.bus=bus;this.canvas=el("canvas",{class:"panel-canvas spatial-surface",dataset:{spatialSurface:"network"}});
    this.ctx=this.canvas.getContext("2d");this.data=null;this.active=false;this.selected=null;this.dragging=false;this.zoom=1;this.offset={x:0,y:0};
    this.bus.on("telemetry:update",s=>{this.data=s.simulated;this.draw()});
    this.bus.on("panel:focus",x=>this.active=x.id==="network");
    this.bus.on("intent:select-start",x=>this.selectStart(x.payload));
    this.bus.on("intent:select-hold",x=>this.selectMove(x.payload));
    this.bus.on("intent:select-end",()=>this.selectEnd());
    this.bus.on("gesture:swipe-up",()=>{if(this.active)this.pan(0,-.05)});
    this.bus.on("gesture:swipe-down",()=>{if(this.active)this.pan(0,.05)});
    new ResizeObserver(()=>this.draw()).observe(this.canvas);
  }
  pointFromGesture(g){
    const rect=this.canvas.getBoundingClientRect(),x=(g?.tip?.x??-1)*innerWidth,y=(g?.tip?.y??-1)*innerHeight;
    if(x<rect.left||x>rect.right||y<rect.top||y>rect.bottom)return null;
    return{x:(x-rect.left)/rect.width,y:(y-rect.top)/rect.height,rect};
  }
  nearest(p){
    if(!p||!this.data)return null;let best=null,dist=Infinity;
    for(const h of this.data.hosts){const hx=.5+(h.x-.5)*this.zoom+this.offset.x,hy=.5+(h.y-.5)*this.zoom+this.offset.y,d=Math.hypot(hx-p.x,hy-p.y);if(d<dist){dist=d;best=h}}
    return dist<.09?best:null;
  }
  selectStart(g){
    if(!this.active)return;const p=this.pointFromGesture(g),node=this.nearest(p);if(!node)return;
    this.selected=node;this.dragging=true;this.bus.emit("network:node-selected",{node});this.draw();
  }
  selectMove(g){
    if(!this.active||!this.dragging||!this.selected)return;const p=this.pointFromGesture(g);if(!p)return;
    this.selected.x=clamp(.5+(p.x-.5-this.offset.x)/this.zoom,0.03,.97);this.selected.y=clamp(.5+(p.y-.5-this.offset.y)/this.zoom,0.05,.95);this.bus.emit("network:node-moved",{node:this.selected});this.draw();
  }
  selectEnd(){if(this.dragging)this.bus.emit("network:node-release",{node:this.selected});this.dragging=false}
  pan(dx,dy){this.offset.x=clamp(this.offset.x+dx,-.3,.3);this.offset.y=clamp(this.offset.y+dy,-.3,.3);this.draw()}
  draw(){
    const c=this.ctx,box=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(!box.width||!box.height)return;
    this.canvas.width=box.width*dpr;this.canvas.height=box.height*dpr;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,box.width,box.height);if(!this.data)return;
    const pos=h=>({x:(.5+(h.x-.5)*this.zoom+this.offset.x)*box.width,y:(.5+(h.y-.5)*this.zoom+this.offset.y)*box.height});
    c.strokeStyle="rgba(98,231,255,.16)";c.lineWidth=1;
    for(const link of this.data.links){const a=this.data.hosts.find(h=>h.id===link.from),b=this.data.hosts.find(h=>h.id===link.to);if(!a||!b)continue;const A=pos(a),B=pos(b);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke()}
    for(const h of this.data.hosts){
      const p=pos(h),selected=h===this.selected;c.beginPath();c.fillStyle=h.risk>70?"rgba(255,124,141,.92)":h.risk>45?"rgba(255,215,131,.9)":"rgba(98,231,255,.9)";c.arc(p.x,p.y,(selected?8:4)+h.risk/35,0,Math.PI*2);c.fill();
      if(selected){c.beginPath();c.strokeStyle="rgba(131,255,194,.9)";c.arc(p.x,p.y,18,0,Math.PI*2);c.stroke()}
      c.font="8px monospace";c.fillStyle="rgba(223,251,255,.78)";c.fillText(h.name,p.x+10,p.y+3);
    }
  }
}
