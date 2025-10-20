const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerUiDist = require("swagger-ui-dist");
const express = require("express");
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

function swaggerDocs(app) {
  const swaggerDistPath = swaggerUiDist.getAbsoluteFSPath();

  if (isVercel) {
    // ✅ 1. Serve static Swagger UI assets (JS/CSS)
    app.use("/swagger-ui", express.static(swaggerDistPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".css")) res.type("text/css");
        if (filePath.endsWith(".js")) res.type("application/javascript");
      },
    }));

    // ✅ 2. Serve swagger.json
    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    // ✅ 3. Serve swagger UI page
    app.get("/api-docs", (req, res) => {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
      );
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Swagger UI</title>
          <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
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

    console.log(`✅ Swagger (Vercel) ready at ${BASE_URL}/api-docs`);
  } else {
    // ✅ Local dùng swagger-ui-express như bình thường
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`✅ Swagger (Local) ready at ${BASE_URL}/api-docs`);
  }
}

module.exports = swaggerDocs;
