const CONNECTIONS=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
export class HandRenderer{
  constructor(canvas,bus){this.canvas=canvas;this.ctx=canvas.getContext("2d");this.bus=bus;this.unsub=null;this.resize=()=>{const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=innerWidth*dpr;this.canvas.height=innerHeight*dpr;this.canvas.style.width=`${innerWidth}px`;this.canvas.style.height=`${innerHeight}px`;this.ctx.setTransform(dpr,0,0,dpr,0,0)}}
  start(){this.resize();addEventListener("resize",this.resize);this.unsub=this.bus.on("hands:frame",f=>this.draw(f.landmarks))}
  stop(){removeEventListener("resize",this.resize);this.unsub?.()}
  draw(hands){
    const c=this.ctx;c.clearRect(0,0,innerWidth,innerHeight);c.lineWidth=1.25;c.strokeStyle="rgba(98,231,255,.54)";
    for(const marks of hands){
      for(const [a,b] of CONNECTIONS){c.beginPath();c.moveTo((1-marks[a].x)*innerWidth,marks[a].y*innerHeight);c.lineTo((1-marks[b].x)*innerWidth,marks[b].y*innerHeight);c.stroke()}
      for(const [i,p] of marks.entries()){c.beginPath();c.fillStyle=i===8?"rgba(131,255,194,.95)":"rgba(98,231,255,.72)";c.arc((1-p.x)*innerWidth,p.y*innerHeight,i===8?5:2.3,0,Math.PI*2);c.fill()}
    }
  }
}
