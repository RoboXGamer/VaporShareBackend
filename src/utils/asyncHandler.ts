import { RequestHandler } from "express";

export const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    // ensure async errors are forwarded to Express error handling
    Promise.resolve(handler(req, res, next)).catch((err) => next(err));
  };
};
