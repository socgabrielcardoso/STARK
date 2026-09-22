export const DIMENSIONS=Object.freeze({
  gesture:["point","pinch","open-palm","fist","victory","two-pinch","two-palm","two-fist"],
  direction:["none","left","right","up","down","toward","away"],
  duration:["tap","hold","long-hold"],
  velocity:["still","slow","normal","fast","throw"],
  position:["center","top","bottom","left-edge","right-edge","corner"],
  hands:["one","two","asymmetric"],
  context:["empty","window","file","data","ip","device","user","alert","incident","log","graph","map","timeline","menu"],
  state:["idle","hover","targeted","dragging","scaling","rotating","release"]
});
export const COMPOSITION_CAPACITY=Object.values(DIMENSIONS).reduce((n,v)=>n*v.length,1);
export const RULES=[
  {id:"select",when:{gesture:"pinch",duration:"tap"},intent:"select"},
  {id:"grab",when:{gesture:"pinch",duration:"hold"},intent:"grab"},
  {id:"context-menu",when:{gesture:"open-palm",duration:"hold"},intent:"menu"},
  {id:"back",when:{gesture:"open-palm",duration:"long-hold"},intent:"back"},
  {id:"minimize",when:{gesture:"fist",duration:"hold",context:"window"},intent:"minimize"},
  {id:"workspace-next",when:{gesture:"open-palm",direction:"right",velocity:"fast"},intent:"workspace-next"},
  {id:"workspace-prev",when:{gesture:"open-palm",direction:"left",velocity:"fast"},intent:"workspace-prev"},
  {id:"scroll-up",when:{gesture:"point",direction:"up",velocity:"fast"},intent:"scroll-up"},
  {id:"scroll-down",when:{gesture:"point",direction:"down",velocity:"fast"},intent:"scroll-down"},
  {id:"transform",when:{gesture:"two-pinch",hands:"two"},intent:"transform"},
  {id:"home",when:{gesture:"two-palm",duration:"hold",hands:"two"},intent:"home"},
  {id:"undo",when:{gesture:"two-fist",duration:"hold",hands:"two"},intent:"undo"}
];
export function signature(parts={}){return Object.entries(parts).filter(([,v])=>v!=null).map(([k,v])=>`${k}:${v}`).join("|")}
export function classifyPosition(point={x:.5,y:.5},dead=.08){
  if(point.x<dead)return"left-edge";if(point.x>1-dead)return"right-edge";if(point.y<dead)return"top";if(point.y>1-dead)return"bottom";return"center";
}
export function classifyVelocity(speed=0){if(speed<.08)return"still";if(speed<.35)return"slow";if(speed<.9)return"normal";if(speed<1.55)return"fast";return"throw"}
