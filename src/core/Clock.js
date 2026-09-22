export class Clock{
  constructor(target){this.target=target;this.timer=null;this.formatter=new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"medium"})}
  start(){const update=()=>{if(this.target)this.target.textContent=this.formatter.format(new Date())};update();this.timer=setInterval(update,1000)}
  stop(){clearInterval(this.timer)}
}
