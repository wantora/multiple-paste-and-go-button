import Prefs from "./Prefs";

const editableArea = document.createElement("div");
editableArea.contentEditable = "true";
document.body.appendChild(editableArea);

function parseLink(element) {
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    const nodeName = node.nodeName.toLowerCase();

    if (nodeName === "a" || nodeName === "area") {
      if (node.hasAttribute("href")) {
        const newNode = document.createElement("span");
        newNode.appendChild(document.createElement("br"));
        newNode.appendChild(document.createTextNode(node.href));
        newNode.appendChild(document.createElement("br"));
        node.parentNode.replaceChild(newNode, node);
      }
    } else {
      parseLink(node);
    }
  });
}

export function getClipboard() {
  editableArea.textContent = "";
  editableArea.focus();
  document.execCommand("Paste");

  return Prefs.get(["supportHTMLLink"]).then(({supportHTMLLink}) => {
    /* eslint-disable no-console */
    if (process.env.NODE_ENV !== "production") {
      console.log("innerHTML:", editableArea.innerHTML);
      console.log("innerText:", editableArea.innerText);
    }

    if (supportHTMLLink) {
      parseLink(editableArea);
    }
    const value = editableArea.innerText;

    if (process.env.NODE_ENV !== "production") {
      console.log("parse: innerHTML:", editableArea.innerHTML);
      console.log("parse: innerText:", editableArea.innerText);
    }
    /* eslint-enable no-console */

    return value;
  });
}
