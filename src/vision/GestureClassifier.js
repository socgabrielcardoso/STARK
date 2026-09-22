import {distance2D} from "../utils/math.js";
const TIPS={thumb:4,index:8,middle:12,ring:16,pinky:20};
const PIPS={index:6,middle:10,ring:14,pinky:18};
export class GestureClassifier{
  constructor({pinchThreshold=.055,pinchRatioThreshold=.34}={}){this.pinchThreshold=pinchThreshold;this.pinchRatioThreshold=pinchRatioThreshold}
  classify(landmarks){
    if(!landmarks?.length)return{name:"none",confidence:0,pinch:false,handScale:0,far:true};
    const extended={
      index:landmarks[TIPS.index].y<landmarks[PIPS.index].y,
      middle:landmarks[TIPS.middle].y<landmarks[PIPS.middle].y,
      ring:landmarks[TIPS.ring].y<landmarks[PIPS.ring].y,
      pinky:landmarks[TIPS.pinky].y<landmarks[PIPS.pinky].y
    };
    const palmWidth=distance2D(landmarks[5],landmarks[17]),palmLength=distance2D(landmarks[0],landmarks[9]);
    const handScale=Math.max(.018,(palmWidth+palmLength)/2),pinchDistance=distance2D(landmarks[TIPS.thumb],landmarks[TIPS.index]),pinchRatio=pinchDistance/handScale;
    const adaptiveAbsolute=this.pinchThreshold*Math.max(.42,Math.min(1.08,handScale/.11));
    const pinch=pinchRatio<this.pinchRatioThreshold||pinchDistance<adaptiveAbsolute*.72;
    const count=Object.values(extended).filter(Boolean).length,far=handScale<.065;
    let name="neutral",confidence=.58;
    if(pinch){name="pinch";confidence=Math.max(.6,1-Math.min(1,pinchRatio/Math.max(.01,this.pinchRatioThreshold))*.35)}
    else if(count>=4){name="open-palm";confidence=.9}
    else if(extended.index&&!extended.middle&&!extended.ring&&!extended.pinky){name="point";confidence=.86}
    else if(extended.index&&extended.middle&&!extended.ring&&!extended.pinky){name="victory";confidence=.82}
    else if(count===0){name="fist";confidence=.84}
    return{name,confidence,pinch,pinchDistance,pinchRatio,handScale,far,extended,indexTip:landmarks[8],thumbTip:landmarks[4],wrist:landmarks[0]};
  }
}
