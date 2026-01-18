import { Request, Response, NextFunction } from "express";

type AsyncHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown>;

const asyncHandler =
  (requestHandler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };

export { asyncHandler };
