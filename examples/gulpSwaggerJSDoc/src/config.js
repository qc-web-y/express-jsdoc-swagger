const path = require("path");

module.exports = {
  info: {
    version: "1.0.0",
    title: "Albums store",
    license: {
      name: "MIT",
    },
  },
  swaggerUIPath: '/',
  filesPattern: path.join(__dirname, "./routes.d.ts"),
  baseDir: __dirname,
  test: true
};
