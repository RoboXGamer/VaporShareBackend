import swaggerJsdoc from "swagger-jsdoc";
import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VaporShare API Documentation",
      version,
      description:
        "Comprehensive API documentation for VaporShare Backend - A secure file sharing platform.",
    },
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
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/models/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
