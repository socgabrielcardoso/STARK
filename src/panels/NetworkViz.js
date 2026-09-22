import {el} from "../utils/dom.js";
export class NetworkViz{
  constructor(bus){this.bus=bus;this.canvas=el("canvas",{class:"panel-canvas"});this.ctx=this.canvas.getContext("2d");this.data=null;this.phase=0;this.bus.on("telemetry:update",s=>{this.data=s.simulated;this.draw()});new ResizeObserver(()=>this.draw()).observe(this.canvas)}
  draw(){
    const c=this.ctx,box=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(!box.width||!box.height)return;
    this.canvas.width=box.width*dpr;this.canvas.height=box.height*dpr;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,box.width,box.height);if(!this.data)return;
    c.strokeStyle="rgba(98,231,255,.16)";c.lineWidth=1;
    for(const link of this.data.links){const a=this.data.hosts.find(h=>h.id===link.from),b=this.data.hosts.find(h=>h.id===link.to);if(!a||!b)continue;c.beginPath();c.moveTo(a.x*box.width,a.y*box.height);c.lineTo(b.x*box.width,b.y*box.height);c.stroke()}
    for(const h of this.data.hosts){const x=h.x*box.width,y=h.y*box.height;c.beginPath();c.fillStyle=h.risk>70?"rgba(255,124,141,.92)":h.risk>45?"rgba(255,215,131,.9)":"rgba(98,231,255,.9)";c.arc(x,y,4+h.risk/35,0,Math.PI*2);c.fill();c.font="8px monospace";c.fillStyle="rgba(223,251,255,.78)";c.fillText(h.name,x+8,y+3)}
  }
}
