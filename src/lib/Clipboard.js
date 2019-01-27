const editableArea = document.createElement("div");
editableArea.contentEditable = "true";
document.body.appendChild(editableArea);

function parseLink(element, urls) {
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    const nodeName = node.nodeName.toLowerCase();

    if (nodeName === "a" || nodeName === "area") {
      if (node.hasAttribute("href")) {
        urls.push(node.href);
      }
    } else {
      parseLink(node, urls);
    }
  });
}

export function getClipboardHTMLLinks() {
  editableArea.textContent = "";
  editableArea.focus();
  document.execCommand("Paste");

  const urls = [];
  parseLink(editableArea, urls);
  return urls;
}
