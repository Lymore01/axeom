/**
 * Base error class for all Axeom-related failures.
 * These are automatically caught and converted into structured JSON responses.
 */
export class AxeomError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code: string = "INTERNAL_SERVER_ERROR",
    public details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AxeomError {
  constructor(message: string = "Resource not found", details?: any) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class UnauthorizedError extends AxeomError {
  constructor(message: string = "Unauthorized access", details?: any) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class BadRequestError extends AxeomError {
  constructor(message: string = "Bad request", details?: any) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class ForbiddenError extends AxeomError {
  constructor(message: string = "Forbidden", details?: any) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class InternalServerError extends AxeomError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}
