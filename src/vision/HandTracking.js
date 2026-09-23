import {CONFIG} from "../config.js";
export class HandTracking{
  constructor({video,bus}){
    this.video=video;this.bus=bus;this.landmarker=null;this.stream=null;this.raf=0;this.lastVideoTime=-1;this.fps=0;this.frames=0;this.fpsStarted=performance.now();
    this.missStreak=0;this.frameIndex=0;this.farAssistUntil=0;this.zoomCanvas=document.createElement("canvas");this.zoomCanvas.width=960;this.zoomCanvas.height=540;this.zoomCtx=this.zoomCanvas.getContext("2d",{alpha:false});
  }
  async init(){
    const {FilesetResolver,HandLandmarker}=await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
    const vision=await FilesetResolver.forVisionTasks(CONFIG.visionWasmUrl);
    this.landmarker=await HandLandmarker.createFromOptions(vision,{
      baseOptions:{modelAssetPath:CONFIG.handModelUrl,delegate:"GPU"},
      runningMode:"VIDEO",numHands:CONFIG.maxHands,
      minHandDetectionConfidence:CONFIG.farHandDetectionConfidence,
      minHandPresenceConfidence:CONFIG.farHandPresenceConfidence,
      minTrackingConfidence:CONFIG.farHandTrackingConfidence
    });
    return this;
  }
  async start(){
    const constraints={video:{facingMode:"user",width:{ideal:CONFIG.cameraWidth,min:960},height:{ideal:CONFIG.cameraHeight,min:540},frameRate:{ideal:CONFIG.cameraFps,min:24}},audio:false};
    this.stream=await navigator.mediaDevices.getUserMedia(constraints);this.video.srcObject=this.stream;await this.video.play();
    const track=this.stream.getVideoTracks()[0],settings=track.getSettings?.()||{};
    this.bus.emit("camera:ready",{width:settings.width||this.video.videoWidth,height:settings.height||this.video.videoHeight,frameRate:settings.frameRate||0,label:track.label||"camera"});this.loop();
  }
  sourceForFrame(){
    const locked=performance.now()<this.farAssistUntil,useZoom=locked||this.missStreak>10&&this.frameIndex%2===0;if(!useZoom)return{source:this.video,crop:null,farAssist:false};
    const vw=this.video.videoWidth||1280,vh=this.video.videoHeight||720,ratio=this.missStreak>45?.58:.72,cw=vw*ratio,ch=vh*ratio,cx=(vw-cw)/2,cy=(vh-ch)/2;
    this.zoomCtx.drawImage(this.video,cx,cy,cw,ch,0,0,this.zoomCanvas.width,this.zoomCanvas.height);
    return{source:this.zoomCanvas,crop:{x:cx/vw,y:cy/vh,w:cw/vw,h:ch/vh},farAssist:true};
  }
  remap(landmarks,crop){if(!crop)return landmarks;return landmarks.map(hand=>hand.map(p=>({...p,x:crop.x+p.x*crop.w,y:crop.y+p.y*crop.h})))}
  loop=()=>{
    if(this.video.readyState>=2&&this.video.currentTime!==this.lastVideoTime){
      this.lastVideoTime=this.video.currentTime;this.frameIndex++;const now=performance.now(),input=this.sourceForFrame();
      const result=this.landmarker?.detectForVideo(input.source,now),landmarks=this.remap(result?.landmarks||[],input.crop);
      if(landmarks.length){this.missStreak=0;if(input.farAssist){const small=landmarks.some(m=>Math.hypot(m[0].x-m[9].x,m[0].y-m[9].y)<.075);if(small)this.farAssistUntil=now+1800}}else this.missStreak++;
      this.frames++;if(now-this.fpsStarted>=1000){this.fps=Math.round(this.frames*1000/(now-this.fpsStarted));this.frames=0;this.fpsStarted=now;this.bus.emit("camera:fps",{fps:this.fps})}
      this.bus.emit("hands:frame",{landmarks,worldLandmarks:result?.worldLandmarks||[],handedness:result?.handedness||[],width:this.video.videoWidth,height:this.video.videoHeight,time:now,fps:this.fps,farAssist:input.farAssist,missStreak:this.missStreak});
      if(input.farAssist)this.bus.emit("vision:far-assist",{active:true,missStreak:this.missStreak});
    }
    this.raf=requestAnimationFrame(this.loop);
  }
  stop(){cancelAnimationFrame(this.raf);this.stream?.getTracks().forEach(t=>t.stop());this.stream=null}
}
