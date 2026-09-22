import {CONFIG} from "../config.js";
export class HandTracking{
  constructor({video,bus}){this.video=video;this.bus=bus;this.landmarker=null;this.stream=null;this.raf=0;this.lastVideoTime=-1}
  async init(){
    const {FilesetResolver,HandLandmarker}=await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
    const vision=await FilesetResolver.forVisionTasks(CONFIG.visionWasmUrl);
    this.landmarker=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:CONFIG.handModelUrl,delegate:"GPU"},runningMode:"VIDEO",numHands:CONFIG.maxHands,minHandDetectionConfidence:.55,minHandPresenceConfidence:.5,minTrackingConfidence:.5});
    return this;
  }
  async start(){
    this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:false});
    this.video.srcObject=this.stream;await this.video.play();this.loop();
  }
  loop=()=>{
    if(this.video.readyState>=2&&this.video.currentTime!==this.lastVideoTime){
      this.lastVideoTime=this.video.currentTime;
      const result=this.landmarker?.detectForVideo(this.video,performance.now());
      this.bus.emit("hands:frame",{landmarks:result?.landmarks||[],handedness:result?.handedness||[],width:this.video.videoWidth,height:this.video.videoHeight,time:performance.now()});
    }
    this.raf=requestAnimationFrame(this.loop);
  }
  stop(){cancelAnimationFrame(this.raf);this.stream?.getTracks().forEach(t=>t.stop());this.stream=null}
}
