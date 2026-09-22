import {el} from "../utils/dom.js";
export class GlobeViz{
  constructor(bus){this.bus=bus;this.canvas=el("canvas",{class:"panel-canvas"});this.ctx=this.canvas.getContext("2d");this.t=0;this.anim=0;new ResizeObserver(()=>this.paint()).observe(this.canvas)}
  start(){const loop=()=>{this.t+=.007;this.paint();this.anim=requestAnimationFrame(loop)};loop()}
  paint(){
    const box=this.canvas.getBoundingClientRect(),c=this.ctx,dpr=Math.min(devicePixelRatio||1,2);if(!box.width||!box.height)return;this.canvas.width=box.width*dpr;this.canvas.height=box.height*dpr;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,box.width,box.height);
    const cx=box.width/2,cy=box.height/2,r=Math.min(box.width,box.height)*.34;c.strokeStyle="rgba(98,231,255,.4)";c.lineWidth=1;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();
    for(let i=-2;i<=2;i++){c.beginPath();c.ellipse(cx,cy,r*Math.cos(i*.25),r,.1,0,Math.PI*2);c.stroke()}
    for(let i=0;i<7;i++){const a=this.t+i*.88,x=cx+Math.cos(a)*r*.92,y=cy+Math.sin(a*.7)*r*.52;c.beginPath();c.fillStyle=i%3===0?"rgba(131,255,194,.9)":"rgba(98,231,255,.9)";c.arc(x,y,3,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(cx,cy);c.lineTo(x,y);c.strokeStyle="rgba(98,231,255,.14)";c.stroke()}
  }
}
