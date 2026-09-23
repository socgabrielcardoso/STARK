const CONNECTIONS=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
export class HandRenderer{
  constructor(canvas,bus){this.canvas=canvas;this.ctx=canvas.getContext("2d");this.bus=bus;this.unsub=null;this.resize=()=>{const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=innerWidth*dpr;this.canvas.height=innerHeight*dpr;this.canvas.style.width=`${innerWidth}px`;this.canvas.style.height=`${innerHeight}px`;this.ctx.setTransform(dpr,0,0,dpr,0,0)}}
  start(){this.resize();addEventListener("resize",this.resize);this.unsub=this.bus.on("gestures:frame",f=>this.draw(f.hands))}
  stop(){removeEventListener("resize",this.resize);this.unsub?.()}
  draw(hands){
    const c=this.ctx;c.clearRect(0,0,innerWidth,innerHeight);
    for(const hand of hands){
      const marks=hand.landmarks,primary=hand.role==="primary",far=hand.far,line=primary?"rgba(98,231,255,.62)":"rgba(255,215,131,.54)",tip=primary?"rgba(131,255,194,.98)":"rgba(255,176,105,.98)";
      c.lineWidth=far?1.55:(primary?1.35:1.05);c.strokeStyle=line;
      for(const [a,b] of CONNECTIONS){c.beginPath();c.moveTo((1-marks[a].x)*innerWidth,marks[a].y*innerHeight);c.lineTo((1-marks[b].x)*innerWidth,marks[b].y*innerHeight);c.stroke()}
      for(const [i,p] of marks.entries()){c.beginPath();c.fillStyle=i===8?tip:line;c.arc((1-p.x)*innerWidth,p.y*innerHeight,i===8?(far?6.4:primary?5.4:4.4):(far?2.8:2.2),0,Math.PI*2);c.fill()}
      const xs=marks.map(p=>(1-p.x)*innerWidth),ys=marks.map(p=>p.y*innerHeight),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      if(far){c.save();c.setLineDash([4,5]);c.strokeStyle=primary?"rgba(131,255,194,.52)":"rgba(255,215,131,.46)";c.strokeRect(minX-10,minY-10,maxX-minX+20,maxY-minY+20);c.restore()}
      const wrist=marks[0],x=(1-wrist.x)*innerWidth,y=wrist.y*innerHeight;c.font="700 9px monospace";c.fillStyle=primary?"rgba(131,255,194,.96)":"rgba(255,215,131,.92)";c.fillText(`${primary?"PRIMARY":"CONTROL"}${far?" · FAR":""}`,x+10,y+4);
    }
  }
}
