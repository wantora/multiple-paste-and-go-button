import {EventEmitter} from "events";

const emitter = new EventEmitter();

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    Object.keys(changes).forEach((key) => {
      emitter.emit(key, changes[key].newValue, changes[key].oldValue);
    });
  }
});

export default {
  get(keys) {
    return browser.storage.local.get(keys);
  },
  set(keys) {
    return browser.storage.local.set(keys);
  },
  on(keyName, listener) {
    emitter.on(keyName, listener);
  },
  off(keyName, listener) {
    emitter.removeListener(keyName, listener);
  },
};
