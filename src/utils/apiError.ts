class apiError extends Error {
  statusCode: number;
  errors: any[] = [];
  data: null;
  success: boolean;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: any[] = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
