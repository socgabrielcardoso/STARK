export class MotionAnalyzer{
  constructor(){this.history=new Map();this.cooldown=new Map()}
  push(id,point,time){
    const h=this.history.get(id)||[];h.push({x:point.x,y:point.y,t:time});while(h.length>8)h.shift();this.history.set(id,h);
    if(h.length<3)return{vx:0,vy:0,speed:0,swipe:null};
    const first=h[0],last=h[h.length-1],dt=Math.max(16,last.t-first.t),vx=(last.x-first.x)/(dt/1000),vy=(last.y-first.y)/(dt/1000),speed=Math.hypot(vx,vy);
    let swipe=null;const now=time,ready=now-(this.cooldown.get(id)||0)>700;
    if(ready&&speed>1.25&&Math.abs(last.x-first.x)+Math.abs(last.y-first.y)>.16){
      if(Math.abs(vx)>Math.abs(vy)*1.25)swipe=vx>0?"right":"left";
      else if(Math.abs(vy)>Math.abs(vx)*1.25)swipe=vy>0?"down":"up";
      if(swipe)this.cooldown.set(id,now);
    }
    return{vx,vy,speed,swipe};
  }
  clear(id){this.history.delete(id)}
}
