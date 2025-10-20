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
  const isVercel = !!process.env.VERCEL_URL;

  if (isVercel) {
    // Dùng CDN Swagger UI trên Vercel
    app.get("/api-docs", (req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Swagger UI</title>
            <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
          </head>
          <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
            <script>
              const ui = SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui'
              });
            </script>
          </body>
        </html>
      `);
    });
    app.get("/swagger.json", (req, res) => res.json(swaggerSpec));
  } else {
    // Dùng swagger-ui-express khi chạy local
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  console.log(`✅ Swagger docs available at ${isVercel ? "Vercel" : "Local"} /api-docs`);
}


module.exports = swaggerDocs;
