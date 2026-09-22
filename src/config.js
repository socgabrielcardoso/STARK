export const CONFIG = Object.freeze({
  appName:"STARK",build:"2026.09-SPATIAL-4",inputMode:"hybrid",maxHands:2,gestureFps:30,
  pinchThreshold:.058,pinchReleaseThreshold:.078,pinchRatioThreshold:.34,pointerSmoothing:.27,
  openPalmHoldMs:620,fistHoldMs:660,victoryHoldMs:780,pointDwellMs:820,
  dragThresholdPx:14,throwThreshold:1.45,swipeThreshold:1.18,
  panelMinWidth:220,panelMinHeight:145,panelMaxScale:2.4,panelMinScale:.48,
  farHandDetectionConfidence:.38,farHandPresenceConfidence:.34,farHandTrackingConfidence:.38,
  cameraWidth:1920,cameraHeight:1080,cameraFps:30,
  depthClickPulses:3,depthClickWindowMs:1450,depthClickPulseThreshold:.115,depthClickCooldownMs:620,
  virtualWorldX:.82,virtualWorldY:.68,offscreenRevealMargin:42,
  simulationTickMs:1000,validationTarget:3072,defaultWorkspace:"COMMAND",
  handModelUrl:"https://storage.googleapis.com/mediapi-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task".replace("mediapi-models","mediapipe-models"),
  visionWasmUrl:"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
});
