export class StateStore{
  #state;#bus;
  constructor(initial,bus){this.#state=structuredClone(initial);this.#bus=bus}
  get(path){if(!path)return structuredClone(this.#state);return path.split(".").reduce((acc,key)=>acc?.[key],this.#state)}
  set(path,value){const parts=path.split(".");let cursor=this.#state;for(const key of parts.slice(0,-1))cursor=cursor[key]??={};cursor[parts.at(-1)]=value;this.#bus?.emit("state:change",{path,value});this.#bus?.emit(`state:${path}`,value)}
  patch(patch){Object.assign(this.#state,patch);this.#bus?.emit("state:change",{path:null,value:patch})}
}
