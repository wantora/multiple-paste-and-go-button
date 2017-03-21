"use strict";

const _ = require("sdk/l10n").get;
const self = require("sdk/self");
const ui = require("sdk/ui");
const clipboard = require("sdk/clipboard");
const tabs = require("sdk/tabs");
const simplePrefs = require("sdk/simple-prefs");
const regexpUtils = require("./lib/regexp-utils");
const {Hotkey} = require("sdk/hotkeys");

const GENERAL_SCHEMES = [
  "http",
  "https",
];

const URL_CHARS = [
  /[A-Za-z]/,
  /[0-9]/,
  "-",
  ".",
  "_",
  "~",
  "%",
  "!",
  "$",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  ";",
  "=",
  ":",
  "@",
  "/",
  "?",
  "#",
];

const URL_CHARS_SOURCE = regexpUtils.union(...URL_CHARS);

function getSpecialSchemes() {
  return simplePrefs.prefs.specialSchemes.split(",").map((scheme) => {
    return scheme.trim();
  }).filter((scheme) => {
    return scheme !== "";
  });
}

function getSchemesSource() {
  let schemes = GENERAL_SCHEMES;
  
  if (simplePrefs.prefs.allowSpecialSchemes) {
    schemes = schemes.concat(getSpecialSchemes());
  }
  
  return regexpUtils.union(...schemes);
}

function parseLineHeuristic(line) {
  const urlRe = new RegExp(`\\b(?:${getSchemesSource()}|ttps?):${URL_CHARS_SOURCE}*`, "g");
  const urls = [];
  let result = null;
  
  while ((result = urlRe.exec(line)) !== null) {
    let url = result[0];
    
    if (url.match(/^ttps?:/)) {
      url = "h" + url;
    }
    if (result.index >= 1 && result.input[result.index - 1] === "(" && url.slice(-1) === ")") {
      url = url.slice(0, -1);
    }
    urls.push(url);
  }
  
  return urls;
}

function parseLine(line) {
  const schemesRe = new RegExp(`^${getSchemesSource()}:`);
  const line2 = line.trim();
  
  if (schemesRe.test(line2)) {
    return [line2];
  }
  return [];
}

function parseText(text) {
  const heuristicMode = simplePrefs.prefs.heuristicMode;
  const urls = [].concat(...text.split(/[\r\n]+/).map((line) => {
    if (heuristicMode) {
      return parseLineHeuristic(line);
    }
    return parseLine(line);
  }));
  
  if (urls.length === 0) {
    const text2 = text.replace(/[\r\n]/g, "").trim();
    
    if (text2 === "") {
      return [];
    } else if (text2.includes(":")) {
      return [text2];
    }
    return ["http://" + text2];
  }
  return urls;
}

function openTabs(urls) {
  const switchToNewTabs = simplePrefs.prefs.switchToNewTabs;
  
  urls.forEach((url) => {
    tabs.open({
      url: url,
      inBackground: !switchToNewTabs,
    });
  });
}

function pasteAndGo() {
  const text = clipboard.get("text");
  
  if (text !== null) {
    const urls = parseText(text);
    
    openTabs(urls);
  }
}

// Button

ui.ActionButton({
  id: "paste-and-go-button",
  label: _("paste_and_go_button_label"),
  icon: self.data.url("paste-and-go.svg"),
  onClick: pasteAndGo,
});

// Hotkey

let pasteAndGoHotkey = null;

function assignHotkey() {
  const combo = simplePrefs.prefs.shortcutKey;
  
  if (pasteAndGoHotkey) {
    pasteAndGoHotkey.destroy();
  }
  
  if (combo === "") {
    pasteAndGoHotkey = null;
  } else {
    try {
      pasteAndGoHotkey = Hotkey({
        combo: combo,
        onPress: pasteAndGo,
      });
    } catch (e) {
      pasteAndGoHotkey = null;
    }
  }
}

simplePrefs.on("shortcutKey", assignHotkey);

assignHotkey();
