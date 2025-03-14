const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Tasks API",
    description:
      "Documentation API. https://github.com/danielschmitz/tasks-node-knex-swagger <br/><br/> <strong>In the production server, you MUST use <u>HTTPS</u> scheme </strong>",
    version: "0.1",
    contact: {
      name: "Daniel Schmitz",
      email: "danieljfa@gmail.com",
      url: "https://github.com/danielschmitz",
    },
  },
  host: null,
  schemes: ["http", "https"],
  basePath: "/api",
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      scheme: "bearer",
      in: "header",
    },
  },
  security: [{ bearerAuth: [] }],
  definitions: {},
};

const outputFile = "./src/swagger.json";
const endpointsFiles = [
  "./src/api/hello-world.js",
  "./src/api/auth.js",
  "./src/api/categories.js",
  "./src/api/tasks.js",
  "./src/api/user.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
