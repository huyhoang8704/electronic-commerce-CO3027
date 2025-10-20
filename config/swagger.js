const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerUiDist = require("swagger-ui-dist");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

const isVercel = !!process.env.VERCEL_URL;
const BASE_URL = isVercel
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${PORT}`;

// ✅ Swagger definition
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
  if (isVercel) {
    // ✅ Dùng swagger-ui-dist khi chạy trên Vercel
    const swaggerUiPath = swaggerUiDist.getAbsoluteFSPath();
    app.use("/swagger-ui", express.static(swaggerUiPath));

    // Serve swagger.json
    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    // Serve giao diện Swagger
    app.get("/api-docs", (req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Swagger UI</title>
          <link rel="stylesheet" href="/swagger-ui/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="/swagger-ui/swagger-ui-bundle.js"></script>
          <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
          <script>
            window.onload = function() {
              SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: "BaseLayout",
              });
            };
          </script>
        </body>
        </html>
      `);
    });

    console.log(`✅ Swagger (Vercel) at ${BASE_URL}/api-docs`);
  } else {
    // ✅ Dùng swagger-ui-express khi chạy local
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
    console.log(`✅ Swagger (Local) at ${BASE_URL}/api-docs`);
  }
}

module.exports = swaggerDocs;
