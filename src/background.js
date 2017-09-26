import {urlListParser, parseURLHeuristic} from "./lib/urlListParser";
import Prefs from "./lib/Prefs";
import {getClipboard} from "./lib/Clipboard";

function openTabs(urls) {
  return Prefs.get(["switchToNewTabs"]).then(({switchToNewTabs}) => {
    urls.forEach((url) => {
      browser.tabs.create({
        url: url,
        active: switchToNewTabs,
      });
    });
  });
}

function pasteAndGo() {
  return Prefs.get([
    "heuristicMode",
    "additionalSchemes",
    "removeURLDup",
  ]).then(({heuristicMode, additionalSchemes, removeURLDup}) => {
    return getClipboard().then((text) => {
      let urls = urlListParser(text, {heuristicMode, additionalSchemes});
      
      if (urls.length === 0) {
        const url = parseURLHeuristic(text);
        if (url !== null) {
          urls = [url];
        }
      }
      
      if (removeURLDup) {
        urls = [...new Set(urls)];
      }
      
      return openTabs(urls);
    });
  });
}

// Button

browser.browserAction.onClicked.addListener(() => {
  pasteAndGo();
});
