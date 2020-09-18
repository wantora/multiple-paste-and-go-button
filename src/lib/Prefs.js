import events from "events";

class Prefs {
  constructor(defaultKeys) {
    this._defaultKeys = defaultKeys;
    this._emitter = new events.EventEmitter();

    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local") {
        Object.keys(changes).forEach((key) => {
          this._emitter.emit(key, changes[key].newValue, changes[key].oldValue);
        });
      }
    });
  }
  get(keysArray) {
    const keysObject = {};
    keysArray.forEach((key) => {
      keysObject[key] = this._defaultKeys[key];
    });
    return browser.storage.local.get(keysObject);
  }
  set(keysObject) {
    return browser.storage.local.set(keysObject).then(() => null);
  }
  on(keyName, listener) {
    this._emitter.on(keyName, listener);
  }
  off(keyName, listener) {
    this._emitter.removeListener(keyName, listener);
  }
}

export default new Prefs({
  switchToNewTabs: false,
  discardNewTabs: false,
  heuristicMode: true,
  supportHTMLLink: true,
  removeURLDup: true,
  additionalSchemes: "",
  newTabTimeout: 0,
});
