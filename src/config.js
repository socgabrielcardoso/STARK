export const CONFIG = Object.freeze({
  appName:"STARK",build:"2026.09",maxHands:2,gestureFps:30,pinchThreshold:.055,openPalmHoldMs:900,fistHoldMs:850,pointerSmoothing:.34,panelMinWidth:260,panelMinHeight:170,simulationTickMs:1000,validationTarget:3072,defaultWorkspace:"COMMAND",
  handModelUrl:"https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  visionWasmUrl:"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
  commands:["help","status","defender","events","connections","panels","reset","workspace","validate","clear"]
});
