export const CONFIG = Object.freeze({
  appName:"STARK",build:"2026.09-HAND",inputMode:"hands-only",maxHands:2,gestureFps:30,
  pinchThreshold:.058,pinchReleaseThreshold:.078,pointerSmoothing:.30,
  openPalmHoldMs:650,fistHoldMs:700,victoryHoldMs:800,pointDwellMs:900,
  dragThresholdPx:18,throwThreshold:1.55,swipeThreshold:1.25,
  panelMinWidth:260,panelMinHeight:170,panelMaxScale:2.15,panelMinScale:.55,
  simulationTickMs:1000,validationTarget:3072,defaultWorkspace:"COMMAND",
  handModelUrl:"https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  visionWasmUrl:"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
});
