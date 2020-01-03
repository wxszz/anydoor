// @ts-ignore
const { exec } = require("child_process");

module.exports = url => {
  // @ts-ignore
  switch (process.platform) {
  case "darwin":
    exec(`open ${url}`);
    break;
  case "win32":
    exec(`start ${url}`);
    break;
  }
};
