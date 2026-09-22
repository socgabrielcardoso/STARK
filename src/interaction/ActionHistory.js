export class ActionHistory{
  constructor(bus,limit=60){this.bus=bus;this.limit=limit;this.undoStack=[];this.redoStack=[]}
  record(entry){if(!entry?.undo)return;this.undoStack.push({...entry,time:Date.now()});if(this.undoStack.length>this.limit)this.undoStack.shift();this.redoStack=[];this.bus.emit("history:change",this.snapshot())}
  undo(){const entry=this.undoStack.pop();if(!entry)return false;entry.undo();this.redoStack.push(entry);this.bus.emit("history:undo",entry);this.bus.emit("history:change",this.snapshot());return true}
  redo(){const entry=this.redoStack.pop();if(!entry?.redo)return false;entry.redo();this.undoStack.push(entry);this.bus.emit("history:redo",entry);this.bus.emit("history:change",this.snapshot());return true}
  snapshot(){return{undo:this.undoStack.length,redo:this.redoStack.length,last:this.undoStack.at(-1)?.label||null}}
}
