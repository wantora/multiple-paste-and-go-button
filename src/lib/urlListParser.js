import {regexpUnion} from "./RegexpUtils";

const GENERAL_SCHEMES = ["http", "https"];

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

const URL_CHARS_SOURCE = regexpUnion(...URL_CHARS);

function getSchemes(additionalSchemes) {
  return GENERAL_SCHEMES.concat(
    additionalSchemes
      .split(",")
      .map((scheme) => scheme.trim())
      .filter((scheme) => scheme !== "")
  );
}

function parseLineHeuristic(line, schemes) {
  const urlRe = new RegExp(`\\b(?:${regexpUnion(...schemes)}|ttps?):${URL_CHARS_SOURCE}*`, "g");
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

function parseLine(line, schemes) {
  const schemesRe = new RegExp(`^${regexpUnion(...schemes)}:`);
  const line2 = line.trim();

  if (schemesRe.test(line2)) {
    return [line2];
  } else {
    return [];
  }
}

export function parseURLHeuristic(text) {
  const trimmedText = text.replace(/[\r\n]/g, "").trim();

  if (trimmedText !== "") {
    const texts = [trimmedText, "http://" + trimmedText, "http://" + encodeURI(trimmedText)];

    for (let index = 0; index < texts.length; index++) {
      try {
        return new URL(texts[index]).href;
      } catch (error) {
        // pass
      }
    }
  }

  return null;
}

export function urlListParser(text, {heuristicMode, additionalSchemes}) {
  const schemes = getSchemes(additionalSchemes);
  const urls = [].concat(
    ...text.split(/[\r\n]+/).map((line) => {
      if (heuristicMode) {
        return parseLineHeuristic(line, schemes);
      } else {
        return parseLine(line, schemes);
      }
    })
  );

  return urls;
}
