/* eslint-disable strict */
"use strict";

const webExtension = require("sdk/webextension");
const simplePrefs = require("sdk/simple-prefs");
const clipboard = require("sdk/clipboard");

function setPrefsPort(port) {
  const prefNames = Object.keys(simplePrefs.prefs);
  
  const prefs = {};
  prefNames.forEach((name) => {
    prefs[name] = simplePrefs.prefs[name];
  });
  port.postMessage(prefs);
  
  prefNames.forEach((name) => {
    simplePrefs.on(name, () => {
      port.postMessage({
        [name]: simplePrefs.prefs[name],
      });
    });
  });
}

webExtension.startup().then(({browser}) => {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === "legacy-addon-sync-prefs") {
      setPrefsPort(port);
    }
  });
  
  browser.runtime.onMessage.addListener((message, sender, sendReply) => {
    if (message === "legacy-addon-clipboard-get") {
      const text = clipboard.get("text");
      
      sendReply({
        value: (text === null) ? "" : text,
      });
    }
  });
});
