const express = require("express");
const expressJSDocSwagger = require("../../..");
const config = require("./config");

const app = express();

const swaggerService = expressJSDocSwagger(app);
swaggerService(config);

app.listen(3131, "0.0.0.0", () => {
  console.log("Server is running on http://127.0.0.1:3131");
});
