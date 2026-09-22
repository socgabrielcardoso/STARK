export class EventBus{
  #events=new Map();
  on(name,handler){const set=this.#events.get(name)||new Set();set.add(handler);this.#events.set(name,set);return()=>set.delete(handler)}
  once(name,handler){const off=this.on(name,(payload)=>{off();handler(payload)});return off}
  emit(name,payload){const set=this.#events.get(name);if(!set)return;for(const handler of [...set]){try{handler(payload)}catch(error){console.error(`[STARK] event ${name}`,error)}}}
  clear(name){if(name)this.#events.delete(name);else this.#events.clear()}
}
