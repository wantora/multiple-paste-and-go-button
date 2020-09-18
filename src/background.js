import {urlListParser, parseURLHeuristic} from "./lib/urlListParser";
import Prefs from "./lib/Prefs";
import {getClipboardHTMLLinks} from "./lib/Clipboard";

let listenerSwitchToNewTabs;
let listenerDiscardNewTabs;
let listenerIndex = 0;
let listenerUrls = [];
function tabListener(tabId, changeInfo, tabInfo) {
  // only create new tab when last one has finished loading
  if (changeInfo.status === "complete") {
    listenerIndex += 1;
    if (listenerIndex < listenerUrls.length) {
      const active = listenerSwitchToNewTabs && listenerIndex === listenerUrls.length - 1;
      browser.tabs.create({
        url: listenerUrls[listenerIndex],
        active: active,
        discarded: listenerDiscardNewTabs && !active,
      });
    } else {
      browser.tabs.onUpdated.removeListener(tabListener);
    }
  }
}

async function openTabs(urls) {
  const {switchToNewTabs, discardNewTabs, newTabTimeout} = await Prefs.get([
    "switchToNewTabs",
    "discardNewTabs",
    "newTabTimeout",
  ]);

  if (newTabTimeout < 0 && urls.length > 0) {
    // setup callback for tab status events
    if (browser.tabs.onUpdated.hasListener(tabListener)) {
      browser.tabs.onUpdated.removeListener(tabListener);
    }
    listenerSwitchToNewTabs = switchToNewTabs;
    listenerDiscardNewTabs = discardNewTabs;
    listenerIndex = 0;
    listenerUrls = urls;

    const filter = {
      urls: urls,
      properties: "status",
      windowId: browser.windows.WINDOW_ID_CURRENT
    }
    browser.tabs.onUpdated.addListener(tabListener, filter);
  }

  for (let i = 0; i < urls.length; ++i) {
    const active = switchToNewTabs && i === urls.length - 1;
    const tabProps = {
      url: urls[i],
      active: active,
      discarded: discardNewTabs && !active,
    };
    if (i > 0 && newTabTimeout > 0) {
      window.setTimeout(() => browser.tabs.create(tabProps), newTabTimeout);
    } else {
      browser.tabs.create(tabProps);
      // rest of the tabs are processed in tabListener callback
      if (newTabTimeout < 0) {
        break;
      }
    }
  }
}

async function pasteAndGo() {
  const {
    heuristicMode,
    additionalSchemes,
    removeURLDup,
    supportHTMLLink,
  } = await Prefs.get([
    "heuristicMode",
    "additionalSchemes",
    "removeURLDup",
    "supportHTMLLink",
  ]);

  const text = await navigator.clipboard.readText();

  let urls = urlListParser(text, {heuristicMode, additionalSchemes});

  if (supportHTMLLink) {
    for (const url of getClipboardHTMLLinks()) {
      if (!urls.includes(url)) {
        urls.push(url);
      }
    }
  }

  if (urls.length === 0) {
    const url = parseURLHeuristic(text);
    if (url !== null) {
      urls = [url];
    }
  }

  if (removeURLDup) {
    urls = [...new Set(urls)];
  }

  await openTabs(urls);
}

// Button

browser.browserAction.onClicked.addListener(() => {
  pasteAndGo();
});
