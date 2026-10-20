import { NextRequest, NextResponse } from "next/server";
import { DomainError } from "@/lib/errors/domain-error";
import { ZodError } from "zod";

export function handleApiError(err: unknown) {
  if (err instanceof DomainError) {
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      },
      { status: err.statusCode }
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "Request payload failed schema validation",
          details: err.format(),
        },
      },
      { status: 422 }
    );
  }

  console.error("Unhandled API error:", err);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An internal server error occurred",
      },
    },
    { status: 500 }
  );
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
