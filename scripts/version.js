"use strict";
const fs = require("fs");
const childProcess = require("child_process");

(async () => {
  const packageData = JSON.parse(
    fs.readFileSync("package.json", {encoding: "utf8"})
  );

  const manifestStr = fs.readFileSync("src/webext/manifest.json", {
    encoding: "utf8",
  });
  fs.writeFileSync(
    "src/webext/manifest.json",
    manifestStr.replace(
      /("version"\s*:\s*")[^"]*(")/,
      (_, p1, p2) => p1 + packageData.version + p2
    )
  );

  childProcess.execSync(`git add src/webext/manifest.json`, {
    stdio: "inherit",
  });
})();
