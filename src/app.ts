import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./utils/uploadthing";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger";
import logger from "./utils/logger";
// Routes Import
import userRouter from "./routes/user";
import fileRouter from "./routes/file";
import { ApiResponse } from "./utils/ApiResponse";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

const morganFormat =
  ":method :url :status :res[content-length] - :response-time ms";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

app.use(helmet());
app.use(limiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(
    new ApiResponse(200, {
      message: "VaporShare API | Server is running",
    }),
  );
});

app.get("/health", (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { status: "OK" }, "Health check passed"));
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/uploadthing", createRouteHandler({ router: uploadRouter }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/files", fileRouter);

// Error Middleware
app.use(errorHandler);

export { app };
