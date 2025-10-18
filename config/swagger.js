const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

// ✅ Nếu deploy trên Vercel, VERCEL_URL sẽ có dạng "your-app.vercel.app"
const isVercel = !!process.env.VERCEL_URL;
const BASE_URL = isVercel
  ? `https://${process.env.VERCEL_URL}` // dùng domain thực của Vercel
  : `http://localhost:${PORT}`;        // còn nếu chạy local thì dùng localhost

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
        description: isVercel ? "Production (Vercel)" : "Local development",
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
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
  );

  console.log(`✅ Swagger docs available at ${BASE_URL}/api-docs`);
}

module.exports = swaggerDocs;
