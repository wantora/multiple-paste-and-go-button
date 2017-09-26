import urlListParser from "./lib/urlListParser";
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
    return urlListParser(text);
  }).then((urls) => {
    return openTabs(urls);
  });
}

// Button

browser.browserAction.onClicked.addListener(() => {
  pasteAndGo();
});
