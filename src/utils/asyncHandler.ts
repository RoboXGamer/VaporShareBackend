const asyncHandler =
  (requestHandler: Function) => (req: any, res: any, next: any) => {
    return Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };

export { asyncHandler };
