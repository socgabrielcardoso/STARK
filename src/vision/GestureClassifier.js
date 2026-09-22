import {distance2D} from "../utils/math.js";
const TIPS={thumb:4,index:8,middle:12,ring:16,pinky:20};
const PIPS={index:6,middle:10,ring:14,pinky:18};
export class GestureClassifier{
  constructor({pinchThreshold=.055}={}){this.pinchThreshold=pinchThreshold}
  classify(landmarks){
    if(!landmarks?.length)return{name:"none",confidence:0,pinch:false};
    const extended={
      index:landmarks[TIPS.index].y<landmarks[PIPS.index].y,
      middle:landmarks[TIPS.middle].y<landmarks[PIPS.middle].y,
      ring:landmarks[TIPS.ring].y<landmarks[PIPS.ring].y,
      pinky:landmarks[TIPS.pinky].y<landmarks[PIPS.pinky].y
    };
    const pinchDistance=distance2D(landmarks[TIPS.thumb],landmarks[TIPS.index]),pinch=pinchDistance<this.pinchThreshold,count=Object.values(extended).filter(Boolean).length;
    let name="neutral",confidence=.58;
    if(pinch){name="pinch";confidence=Math.max(.6,1-pinchDistance/this.pinchThreshold*.35)}
    else if(count>=4){name="open-palm";confidence=.9}
    else if(extended.index&&!extended.middle&&!extended.ring&&!extended.pinky){name="point";confidence=.86}
    else if(extended.index&&extended.middle&&!extended.ring&&!extended.pinky){name="victory";confidence=.82}
    else if(count===0){name="fist";confidence=.84}
    return{name,confidence,pinch,pinchDistance,extended,indexTip:landmarks[8],thumbTip:landmarks[4],wrist:landmarks[0]};
  }
}
