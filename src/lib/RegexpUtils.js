export function regexpEscape(str) {
  return str.replace(/./g, (c) => {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

export function regexpUnion(...args) {
  return (
    "(?:" +
    args
      .map((obj) => {
        if (typeof obj === "object" && "source" in obj) {
          return obj.source;
        }
        return regexpEscape(String(obj));
      })
      .join("|") +
    ")"
  );
}
