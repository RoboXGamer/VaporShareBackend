import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    logger.error(
      `${req.method} ${req.originalUrl} - ApiError: ${err.message}`,
      {
        statusCode: err.statusCode,
        errors: err.errors,
        stack: err.stack,
      },
    );
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // Handle unexpected errors
  logger.error(
    `${req.method} ${req.originalUrl} - Unexpected Error: ${err.message}`,
    {
      stack: err.stack,
      error: err,
    },
  );
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
