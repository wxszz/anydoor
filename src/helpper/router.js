// @ts-nocheck
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const promisify = require("util").promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mimeType = require("./mime");
const compress = require("./compress");
const range = require("./range");
const isFresh = require("./cache");

const ejsPath = path.join(__dirname, "../complate/dir.ejs");
const source = fs.readFileSync(ejsPath);
const template = ejs.compile(source.toString());

module.exports = async (req, res, filePath, conf) => {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const contentType = mimeType(filePath);
      res.setHeader("Content-Type", contentType);

      if (isFresh(stats, req, res)) {
        res.statusCode = 304;
        res.end();
        return false;
      }

      let rs;
      const { code, start, end } = range(stats.size, req, res);
      if (code === 200) {
        res.statusCode = 200;
        rs = fs.createReadStream(filePath);
      } else {
        res.statusCode = 206;
        rs = fs.createReadStream(filePath, { start, end });
      }
      if (filePath.match(conf.compress)) {
        rs = compress(rs, req, res);
      }
      rs.pipe(res);
    }
    if (stats.isDirectory()) {
      const files = await readdir(filePath);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      const dir = path
        .relative(conf.root, filePath)
        .split("\\")
        .pop();
      const data = {
        files,
        title: path.basename(filePath),
        dir: dir ? dir : ""
      };
      res.end(template(data));
    }
  } catch (err) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end(`${filePath} is not a directory/${err}`);
  }
};
