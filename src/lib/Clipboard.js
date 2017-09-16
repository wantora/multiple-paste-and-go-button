const textarea = document.createElement("textarea");
textarea.contentEditable = "true";
document.body.appendChild(textarea);

export function getClipboard() {
  textarea.textContent = "";
  textarea.focus();
  document.execCommand("Paste");
  
  const value = Array.from(textarea.childNodes).map((node) => {
    if (node.nodeName.toLowerCase() === "br") {
      return "\n";
    } else {
      return node.nodeValue;
    }
  }).join("");
  
  return Promise.resolve(value);
}
