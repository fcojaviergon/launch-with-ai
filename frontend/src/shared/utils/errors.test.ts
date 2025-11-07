import { describe, expect, it } from "vitest"
import { ApiError } from "@/client"
import {
  getErrorMessage,
  isApiError,
  isStringDetail,
  isValidationErrorArray,
} from "./errors"

// Helper to create mock ApiError instances
function createMockApiError(
  status: number,
  statusText: string,
  body: unknown
): ApiError {
  return new ApiError(
    { method: "GET", url: "/test" },
    { url: "/test", ok: false, status, statusText, body },
    "Mock error"
  )
}

describe("Error Handling Utilities", () => {
  describe("isApiError", () => {
    it("should return true for valid ApiError objects", () => {
      const apiError = {
        body: { detail: "Error message" },
        status: 400,
        statusText: "Bad Request",
      }

      expect(isApiError(apiError)).toBe(true)
    })

    it("should return false for objects missing body", () => {
      const invalidError = {
        status: 400,
        statusText: "Bad Request",
      }

      expect(isApiError(invalidError)).toBe(false)
    })

    it("should return false for objects missing status", () => {
      const invalidError = {
        body: { detail: "Error message" },
        statusText: "Bad Request",
      }

      expect(isApiError(invalidError)).toBe(false)
    })

    it("should return false for null", () => {
      expect(isApiError(null)).toBe(false)
    })

    it("should return false for undefined", () => {
      expect(isApiError(undefined)).toBe(false)
    })

    it("should return false for primitives", () => {
      expect(isApiError("string")).toBe(false)
      expect(isApiError(123)).toBe(false)
      expect(isApiError(true)).toBe(false)
    })
  })

  describe("isValidationErrorArray", () => {
    it("should return true for valid validation error array", () => {
      const validationErrors = [
        {
          loc: ["body", "email"],
          msg: "Invalid email format",
          type: "value_error",
        },
      ]

      expect(isValidationErrorArray(validationErrors)).toBe(true)
    })

    it("should return true for multiple validation errors", () => {
      const validationErrors = [
        {
          loc: ["body", "email"],
          msg: "Invalid email format",
          type: "value_error",
        },
        {
          loc: ["body", "password"],
          msg: "Password too short",
          type: "value_error",
        },
      ]

      expect(isValidationErrorArray(validationErrors)).toBe(true)
    })

    it("should return false for empty array", () => {
      expect(isValidationErrorArray([])).toBe(false)
    })

    it("should return false for non-array", () => {
      expect(isValidationErrorArray("not an array")).toBe(false)
      expect(isValidationErrorArray({ msg: "error" })).toBe(false)
    })

    it("should return false for array with invalid objects", () => {
      const invalidArray = [{ invalid: "structure" }]
      expect(isValidationErrorArray(invalidArray)).toBe(false)
    })

    it("should return false for array missing msg field", () => {
      const invalidArray = [{ loc: ["body", "email"], type: "value_error" }]
      expect(isValidationErrorArray(invalidArray)).toBe(false)
    })

    it("should return false for array missing loc field", () => {
      const invalidArray = [{ msg: "Error message", type: "value_error" }]
      expect(isValidationErrorArray(invalidArray)).toBe(false)
    })
  })

  describe("isStringDetail", () => {
    it("should return true for strings", () => {
      expect(isStringDetail("Error message")).toBe(true)
      expect(isStringDetail("")).toBe(true)
    })

    it("should return false for non-strings", () => {
      expect(isStringDetail(123)).toBe(false)
      expect(isStringDetail(null)).toBe(false)
      expect(isStringDetail(undefined)).toBe(false)
      expect(isStringDetail({})).toBe(false)
      expect(isStringDetail([])).toBe(false)
    })
  })

  describe("getErrorMessage", () => {
    it("should extract message from validation error array", () => {
      const apiError = createMockApiError(422, "Unprocessable Entity", {
        detail: [
          {
            loc: ["body", "email"],
            msg: "Invalid email format",
            type: "value_error",
          },
        ],
      })

      expect(getErrorMessage(apiError)).toBe("Invalid email format")
    })

    it("should extract first message from multiple validation errors", () => {
      const apiError = createMockApiError(422, "Unprocessable Entity", {
        detail: [
          {
            loc: ["body", "email"],
            msg: "First error",
            type: "value_error",
          },
          {
            loc: ["body", "password"],
            msg: "Second error",
            type: "value_error",
          },
        ],
      })

      expect(getErrorMessage(apiError)).toBe("First error")
    })

    it("should extract string error detail", () => {
      const apiError = createMockApiError(404, "Not Found", {
        detail: "User not found",
      })

      expect(getErrorMessage(apiError)).toBe("User not found")
    })

    it("should return fallback message for unknown error format", () => {
      const apiError = createMockApiError(500, "Internal Server Error", {
        detail: { some: "unknown format" },
      })

      expect(getErrorMessage(apiError)).toBe("Something went wrong.")
    })

    it("should return fallback message when detail is missing", () => {
      const apiError = createMockApiError(500, "Internal Server Error", {})

      expect(getErrorMessage(apiError)).toBe("Something went wrong.")
    })

    it("should return fallback message when body is missing", () => {
      const apiError = createMockApiError(
        500,
        "Internal Server Error",
        undefined
      )

      expect(getErrorMessage(apiError)).toBe("Something went wrong.")
    })
  })
})
