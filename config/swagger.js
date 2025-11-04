const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

const BASE_URL =
  NODE_ENV === "production"
    ? "https://electronic-commerce-co3027.onrender.com"
    : `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend API",
      version: "1.0.0",
      description: "API documentation for backend services",
    },
    servers: [
      {
        url: BASE_URL,
        description:
          NODE_ENV === "production"
            ? "Production (Render)"
            : "Local development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

function swaggerDocs(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCssUrl: CSS_URL,
      customSiteTitle: "Swagger API Docs",
    })
  );
  console.log(`✅ Swagger docs ready at ${BASE_URL}/api-docs`);
}

module.exports = swaggerDocs;
