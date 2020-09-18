import {urlListParser, parseURLHeuristic} from "./lib/urlListParser";
import Prefs from "./lib/Prefs";
import {getClipboardHTMLLinks} from "./lib/Clipboard";

async function openTabs(urls) {
  const {switchToNewTabs, discardNewTabs, newTabTimeout} = await Prefs.get([
    "switchToNewTabs",
    "discardNewTabs",
    "newTabTimeout",
  ]);

  for (let i = 0; i < urls.length; ++i) {
    const active = switchToNewTabs && i === urls.length - 1;
    const tabProps = {
      url: urls[i],
      active: active,
      discarded: discardNewTabs && !active,
    };
    if (i > 0 && newTabTimeout > 0) {
      window.setTimeout(() => browser.tabs.create(tabProps), newTabTimeout);
    } else if (newTabTimeout < 0) {
      await browser.tabs.create(tabProps);
    } else {
      browser.tabs.create(tabProps);
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
