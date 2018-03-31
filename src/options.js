import Prefs from "./lib/Prefs";

function initI18n() {
  Array.from(document.querySelectorAll("[data-i18n]")).forEach((ele) => {
    const key = ele.getAttribute("data-i18n");
    ele.textContent = browser.i18n.getMessage(key);
  });
}

function getValue(input) {
  if (input.type === "checkbox") {
    return input.checked;
  } else {
    return input.value;
  }
}

function setValue(input, value) {
  if (input.type === "checkbox") {
    input.checked = value;
  } else {
    input.value = value;
  }
}

initI18n();

Prefs.get([
  "switchToNewTabs",
  "heuristicMode",
  "supportHTMLLink",
  "removeURLDup",
  "additionalSchemes",
]).then((obj) => {
  Object.keys(obj).forEach((key) => {
    const input = document.getElementById(key);
    setValue(input, obj[key]);

    input.addEventListener("change", () => {
      Prefs.set({[key]: getValue(input)});
    });
  });
});
