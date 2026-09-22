import {CONFIG} from "../config.js";
export class HandTracking{
  constructor({video,bus}){this.video=video;this.bus=bus;this.landmarker=null;this.stream=null;this.raf=0;this.lastVideoTime=-1;this.lastEmit=0;this.fps=0;this.frames=0;this.fpsStarted=performance.now()}
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
    const constraints={video:{
      facingMode:"user",
      width:{ideal:CONFIG.cameraWidth,min:960},
      height:{ideal:CONFIG.cameraHeight,min:540},
      frameRate:{ideal:CONFIG.cameraFps,min:24}
    },audio:false};
    this.stream=await navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject=this.stream;await this.video.play();
    const track=this.stream.getVideoTracks()[0],settings=track.getSettings?.()||{};
    this.bus.emit("camera:ready",{width:settings.width||this.video.videoWidth,height:settings.height||this.video.videoHeight,frameRate:settings.frameRate||0,label:track.label||"camera"});
    this.loop();
  }
  loop=()=>{
    if(this.video.readyState>=2&&this.video.currentTime!==this.lastVideoTime){
      this.lastVideoTime=this.video.currentTime;
      const now=performance.now(),result=this.landmarker?.detectForVideo(this.video,now);
      this.frames++;
      if(now-this.fpsStarted>=1000){this.fps=Math.round(this.frames*1000/(now-this.fpsStarted));this.frames=0;this.fpsStarted=now;this.bus.emit("camera:fps",{fps:this.fps})}
      this.bus.emit("hands:frame",{
        landmarks:result?.landmarks||[],worldLandmarks:result?.worldLandmarks||[],
        handedness:result?.handedness||[],width:this.video.videoWidth,height:this.video.videoHeight,
        time:now,fps:this.fps
      });
    }
    this.raf=requestAnimationFrame(this.loop);
  }
  stop(){cancelAnimationFrame(this.raf);this.stream?.getTracks().forEach(t=>t.stop());this.stream=null}
}
