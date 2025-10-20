const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const isVercel = !!process.env.VERCEL_URL;
const BASE_URL = isVercel
  ? `https://${process.env.VERCEL_URL}`
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
        description: isVercel ? "Production (Vercel)" : "Local development",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

// ✅ Dùng CDN CSS để tránh CSP + lỗi MIME trên Vercel
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

function swaggerDocs(app) {
  // Nếu chạy local → render mặc định
  if (!isVercel) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
    console.log(`✅ Swagger (local) at ${BASE_URL}/api-docs`);
    return;
  }

  // Nếu deploy trên Vercel → dùng customCssUrl để inject CSS từ CDN
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCssUrl: CSS_URL, // ✅ load CSS từ CDN
      customSiteTitle: "Swagger API Docs",
    })
  );

  console.log(`✅ Swagger (Vercel) at ${BASE_URL}/api-docs`);
}

module.exports = swaggerDocs;
