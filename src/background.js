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
  return getClipboard().then((text) => {
    return Prefs.get(["heuristicMode", "additionalSchemes"]).then((options) => {
      const urls = urlListParser(text, options);
      
      if (urls.length === 0) {
        const url = parseURLHeuristic(text);
        if (url !== null) {
          return [url];
        }
      }
      
      return urls;
    });
  }).then((urls) => {
    return openTabs(urls);
  });
}

// Button

browser.browserAction.onClicked.addListener(() => {
  pasteAndGo();
});
