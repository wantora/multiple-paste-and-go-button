
export function getClipboard() {
  // Legacy addon port
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage("legacy-addon-clipboard-get").then((reply) => {
      if (reply) {
        resolve(reply.value);
      } else {
        reject(new Error("clipboard.get"));
      }
    });
  });
  
  /*
  // Firefox 54~ (https://bugzilla.mozilla.org/show_bug.cgi?id=1312260)
  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);
  textarea.focus();
  document.execCommand("Paste");
  document.body.removeChild(textarea);
  
  return Promise.resolve(textarea.value);
  */
}
