const CONNECTIONS=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
export class HandRenderer{
  constructor(canvas,bus){this.canvas=canvas;this.ctx=canvas.getContext("2d");this.bus=bus;this.unsub=null;this.resize=()=>{const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=innerWidth*dpr;this.canvas.height=innerHeight*dpr;this.canvas.style.width=`${innerWidth}px`;this.canvas.style.height=`${innerHeight}px`;this.ctx.setTransform(dpr,0,0,dpr,0,0)}}
  start(){this.resize();addEventListener("resize",this.resize);this.unsub=this.bus.on("gestures:frame",f=>this.draw(f.hands))}
  stop(){removeEventListener("resize",this.resize);this.unsub?.()}
  draw(hands){
    const c=this.ctx;c.clearRect(0,0,innerWidth,innerHeight);
    for(const hand of hands){const marks=hand.landmarks,primary=hand.role==="primary",line=primary?"rgba(98,231,255,.58)":"rgba(255,215,131,.48)",tip=primary?"rgba(131,255,194,.96)":"rgba(255,176,105,.96)";
      c.lineWidth=primary?1.35:1.05;c.strokeStyle=line;
      for(const [a,b] of CONNECTIONS){c.beginPath();c.moveTo((1-marks[a].x)*innerWidth,marks[a].y*innerHeight);c.lineTo((1-marks[b].x)*innerWidth,marks[b].y*innerHeight);c.stroke()}
      for(const [i,p] of marks.entries()){c.beginPath();c.fillStyle=i===8?tip:line;c.arc((1-p.x)*innerWidth,p.y*innerHeight,i===8?(primary?5.4:4.4):2.2,0,Math.PI*2);c.fill()}
      const wrist=marks[0],x=(1-wrist.x)*innerWidth,y=wrist.y*innerHeight;c.font="700 9px monospace";c.fillStyle=primary?"rgba(131,255,194,.95)":"rgba(255,215,131,.9)";c.fillText(primary?"PRIMARY":"CONTROL",x+10,y+4);
    }
  }
}
