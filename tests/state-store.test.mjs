import test from "node:test";
import assert from "node:assert/strict";
import { StateStore } from "../src/core/StateStore.js";

test("nested writes work and emit state-change events", () => {
  const events = [];
  const store = new StateStore({ settings: { mode: "balanced" } }, {
    emit(name, payload) { events.push({ name, payload }); }
  });
  store.set("settings.mode", "efficient");
  store.set("settings.layout.compact", true);
  assert.equal(store.get("settings.mode"), "efficient");
  assert.equal(store.get("settings.layout.compact"), true);
  assert.ok(events.some(event => event.name === "state:settings.mode"));
});

test("unsafe dotted paths and prototype-bearing patches are rejected", () => {
  const store = new StateStore({ settings: {} });
  for (const path of ["__proto__.polluted", "settings.constructor.prototype.polluted",
    "settings..mode", "prototype", ""]) {
    assert.throws(() => store.set(path, true), TypeError);
  }
  assert.throws(() => store.patch(JSON.parse('{"__proto__":{"polluted":true}}')), TypeError);
  assert.equal({}.polluted, undefined);
  assert.deepEqual(store.get("settings"), {});
});

test("reads and writes do not leak mutable internal references", () => {
  const store = new StateStore({ settings: { mode: "balanced" } });
  const input = { active: true };
  store.set("settings.flags", input);
  input.active = false;
  assert.equal(store.get("settings.flags.active"), true);

  const copy = store.get("settings");
  copy.flags.active = false;
  assert.equal(store.get("settings.flags.active"), true);

  const patch = { next: { enabled: true } };
  store.patch(patch);
  patch.next.enabled = false;
  assert.equal(store.get("next.enabled"), true);
});
