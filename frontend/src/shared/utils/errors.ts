// Error handling utilities with type guards

import type { ApiError } from "@/client"
import { useCustomToast } from "@shared/hooks"

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    "status" in error
  )
}

/**
 * Type guard to check if error detail is a validation error array
 */
interface ValidationError {
  loc: string[]
  msg: string
  type: string
}

export function isValidationErrorArray(
  detail: unknown,
): detail is ValidationError[] {
  return (
    Array.isArray(detail) &&
    detail.length > 0 &&
    typeof detail[0] === "object" &&
    detail[0] !== null &&
    "msg" in detail[0] &&
    "loc" in detail[0]
  )
}

/**
 * Type guard to check if error detail is a string
 */
export function isStringDetail(detail: unknown): detail is string {
  return typeof detail === "string"
}

/**
 * Extract error message from ApiError with proper type checking
 */
export function getErrorMessage(err: ApiError): string {
  const errDetail = (err.body as Record<string, unknown> | undefined)?.detail

  if (isValidationErrorArray(errDetail)) {
    // FastAPI validation errors
    return errDetail[0].msg
  }

  if (isStringDetail(errDetail)) {
    // Simple string error
    return errDetail
  }

  // Fallback for unknown error formats
  return "Something went wrong."
}

/**
 * Handle API errors with toast notifications
 */
export const handleError = (err: ApiError) => {
  const { showErrorToast } = useCustomToast()
  const errorMessage = getErrorMessage(err)
  showErrorToast(errorMessage)
}

/**
 * Safe error handler for unknown error types
 */
export const handleUnknownError = (error: unknown) => {
  const { showErrorToast } = useCustomToast()

  if (isApiError(error)) {
    handleError(error)
  } else if (error instanceof Error) {
    showErrorToast(error.message)
  } else {
    showErrorToast("An unexpected error occurred.")
  }
}
