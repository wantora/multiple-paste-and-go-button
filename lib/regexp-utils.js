"use strict";

function escape(str) {
  return str.replace(/./g, (c) => {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

function union(...args) {
  return "(?:" + args.map((obj) => {
    if (typeof obj === "object" && "source" in obj) {
      return obj.source;
    }
    return escape(String(obj));
  }).join("|") + ")";
}

exports.escape = escape;
exports.union = union;
