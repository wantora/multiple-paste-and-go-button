import {urlListParser, parseURLHeuristic} from "./lib/urlListParser";
import Prefs from "./lib/Prefs";
import {getClipboardHTMLLinks} from "./lib/Clipboard";

async function openTabs(urls) {
  const {switchToNewTabs} = await Prefs.get(["switchToNewTabs"]);

  urls.forEach((url) => {
    browser.tabs.create({
      url: url,
      active: switchToNewTabs,
    });
  });
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
