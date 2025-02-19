require("express-async-errors");
const express = require("express");
const app = express();

//
// swagger
//
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", function (_req, res) {
  res.redirect("/swagger");
});

//
// cors
//
const cors = require("cors");
app.use(
  cors({
    exposedHeaders: "Authorization",
  }),
);

//
// body parser
//
const BodyParser = require("body-parser");
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

//
// loading api
//
const api = require("./api");
let api_log = "";
api.forEach((router) => {
  api_log += `${router} `;
  app.use("/api", require(`./api/${router}`));
});

//
// start
//
// eslint-disable-next-line no-undef
const port = process.env.PORT || 3000;
app.listen(port, () => {
  const yellow_color = "\x1b[33m%s\x1b[0m";
  console.log(yellow_color, `[Server Started with APIs: ${api_log}]`);
  console.log(`Check docs at http://localhost:${port}/swagger`);
});
