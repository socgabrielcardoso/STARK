const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);

function safePath(path) {
  if (typeof path !== "string" || !path) throw new TypeError("Invalid state path");
  const parts = path.split(".");
  if (parts.some(key => !key || forbiddenKeys.has(key))) {
    throw new TypeError("Unsafe state path");
  }
  return parts;
}

export class StateStore {
  #state; #bus;
  constructor(initial, bus) { this.#state = structuredClone(initial); this.#bus = bus; }

  get(path) {
    if (!path) return structuredClone(this.#state);
    const value = safePath(path).reduce((acc, key) => acc?.[key], this.#state);
    return value === undefined ? undefined : structuredClone(value);
  }

  set(path, value) {
    const parts = safePath(path);
    let cursor = this.#state;
    for (const key of parts.slice(0, -1)) {
      if (!Object.hasOwn(cursor, key) || cursor[key] == null) cursor[key] = {};
      if (typeof cursor[key] !== "object" || Array.isArray(cursor[key])) {
        throw new TypeError("Cannot descend into a non-object state value");
      }
      cursor = cursor[key];
    }
    const stored = structuredClone(value);
    cursor[parts.at(-1)] = stored;
    this.#bus?.emit("state:change", { path, value: structuredClone(stored) });
    this.#bus?.emit(`state:${path}`, structuredClone(stored));
  }

  patch(patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      throw new TypeError("Invalid state patch");
    }
    const entries = Object.entries(patch);
    if (entries.some(([key]) => forbiddenKeys.has(key))) {
      throw new TypeError("Unsafe state patch");
    }
    const safe = structuredClone(patch);
    Object.assign(this.#state, safe);
    this.#bus?.emit("state:change", { path: null, value: structuredClone(safe) });
  }
}
