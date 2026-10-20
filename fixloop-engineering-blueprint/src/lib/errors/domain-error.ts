export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_STATE_TRANSITION"
  | "VALIDATION_FAILED"
  | "CONFLICT"
  | "STALE_VERSION"
  | "EFFECTIVENESS_INSUFFICIENT"
  | "UNVERIFIED_EVIDENCE"
  | "AI_SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class DomainError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  static unauthenticated(message = "Authentication required"): DomainError {
    return new DomainError("UNAUTHENTICATED", message, 401);
  }

  static forbidden(message = "Access denied for this tenant or operation"): DomainError {
    return new DomainError("FORBIDDEN", message, 403);
  }

  static notFound(resource = "Resource"): DomainError {
    return new DomainError("NOT_FOUND", `${resource} not found`, 404);
  }

  static invalidTransition(fromState: string, toState: string, reason?: string): DomainError {
    const msg = reason 
      ? `Cannot transition from ${fromState} to ${toState}: ${reason}` 
      : `Invalid state transition from ${fromState} to ${toState}`;
    return new DomainError("INVALID_STATE_TRANSITION", msg, 409);
  }

  static staleVersion(expected: number, actual: number): DomainError {
    return new DomainError(
      "STALE_VERSION",
      `Version conflict: entity is at version ${actual}, but update specified version ${expected}`,
      409
    );
  }

  static validation(message: string, details?: unknown): DomainError {
    return new DomainError("VALIDATION_FAILED", message, 422, details);
  }

  static internal(message = "An unexpected error occurred"): DomainError {
    return new DomainError("INTERNAL_ERROR", message, 500);
  }
}
