// @ts-nocheck
const http = require("http");
const chalk = require("chalk");
const path = require("path");
const conf = require("./config/defaultconfig");
const route = require("./helpper/router");
const open = require("./helpper/open");

class Server {
  constructor(config) {
    this.conf = Object.assign({}, conf, config);
  }

  start() {
    const server = http.createServer((req, res) => {
      const filePath = path.join(this.conf.root, req.url);
      route(req, res, filePath, this.conf);
    });

    server.listen(this.conf.port, this.conf.hostname, () => {
      const addr = `http://${this.conf.hostname}:${this.conf.port}`;
      console.info(`server run ${chalk.green(addr)}`);
      open(addr);
    });
  }
}

module.exports = Server;
