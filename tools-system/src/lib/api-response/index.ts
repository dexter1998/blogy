import { NextResponse } from "next/server";

export type ApiMeta = {
  requestId: string;
  apiVersion: string;
  durationMs: number;
  cached: boolean;
  rateLimit?: { limit: number; remaining: number; resetAt: string };
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta: ApiMeta;
};

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: Pick<ApiMeta, "requestId" | "apiVersion" | "durationMs">;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const API_VERSION = "v1";

export function newRequestId(): string {
  return (
    "req_" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36)
  );
}

export function success<T>(
  data: T,
  meta: Omit<ApiMeta, "apiVersion">,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json<ApiSuccess<T>>(
    { ok: true, data, meta: { ...meta, apiVersion: API_VERSION } },
    { status: 200 },
  );
}

export function failure(
  status: number,
  code: string,
  message: string,
  meta: { requestId: string; durationMs: number },
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json<ApiError>(
    {
      ok: false,
      error: { code, message, ...(details !== undefined && { details }) },
      meta: { ...meta, apiVersion: API_VERSION },
    },
    { status },
  );
}

export const ErrorCodes = {
  ValidationError: "validation_error",
  RateLimited: "rate_limited",
  Unauthorized: "unauthorized",
  Timeout: "timeout",
  ScrapeFailed: "scrape_failed",
  Internal: "internal_error",
} as const;
