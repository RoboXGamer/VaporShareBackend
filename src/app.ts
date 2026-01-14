import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./utils/logger";
//routes import
import userRouter from "./routes/user";
import { ApiResponse } from "./utils/ApiResponse";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();
const app = express();

const morganFormat =
  ":method :url :status :res[content-length] - :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

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

app.use("/api/v1/users", userRouter);

// Error Middleware
app.use(errorHandler);

export { app };
