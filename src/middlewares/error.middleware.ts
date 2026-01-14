import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
