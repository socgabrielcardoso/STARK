export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const mapRange=(v,inMin,inMax,outMin,outMax)=>outMin+(outMax-outMin)*((v-inMin)/(inMax-inMin));
export const distance2D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const average=(values)=>values.length?values.reduce((a,b)=>a+b,0)/values.length:0;
export const seeded=(seed)=>{let n=seed>>>0;return()=>((n=(n*1664525+1013904223)>>>0)/4294967296)};
export const randomBetween=(min,max,rng=Math.random)=>min+(max-min)*rng();
export const pct=(value,total)=>total?Math.round(value/total*100):0;
