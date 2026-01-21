import { describe, expect, it } from "vitest"
import {
  confirmPasswordRules,
  emailPattern,
  namePattern,
  passwordRules,
} from "./validation"

describe("Validation Utilities", () => {
  describe("emailPattern", () => {
    it("should validate correct email addresses", () => {
      const validEmails = [
        "user@example.com",
        "test.user@example.co.uk",
        "user+tag@example.com",
        "user123@test-domain.com",
        "UPPERCASE@EXAMPLE.COM",
      ]

      for (const email of validEmails) {
        expect(emailPattern.value.test(email)).toBe(true)
      }
    })

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user@.com",
        "user @example.com",
        "user@example",
        "",
      ]

      for (const email of invalidEmails) {
        expect(emailPattern.value.test(email)).toBe(false)
      }
    })

    it("should have correct error message", () => {
      expect(emailPattern.message).toBe("Invalid email address")
    })
  })

  describe("namePattern", () => {
    it("should validate correct names", () => {
      const validNames = [
        "John",
        "John Doe",
        "María García",
        "François Dupont",
        "José María",
        "A",
      ]

      for (const name of validNames) {
        expect(namePattern.value.test(name)).toBe(true)
      }
    })

    it("should reject invalid names", () => {
      const invalidNames = [
        "John123",
        "John@Doe",
        "John_Doe",
        "John-Doe",
        "John.Doe",
        "ThisNameIsWayTooLongAndExceedsTheLimit",
        "",
      ]

      for (const name of invalidNames) {
        expect(namePattern.value.test(name)).toBe(false)
      }
    })

    it("should have correct error message", () => {
      expect(namePattern.message).toBe("Invalid name")
    })
  })

  describe("passwordRules", () => {
    it("should return required rule when isRequired is true", () => {
      const rules = passwordRules(true)

      expect(rules.required).toBe("Password is required")
      expect(rules.minLength.value).toBe(8)
      expect(rules.minLength.message).toBe(
        "Password must be at least 8 characters",
      )
    })

    it("should not return required rule when isRequired is false", () => {
      const rules = passwordRules(false)

      expect(rules.required).toBeUndefined()
      expect(rules.minLength.value).toBe(8)
      expect(rules.minLength.message).toBe(
        "Password must be at least 8 characters",
      )
    })

    it("should default to required when no argument provided", () => {
      const rules = passwordRules()

      expect(rules.required).toBe("Password is required")
    })
  })

  describe("confirmPasswordRules", () => {
    it("should validate matching passwords with password field", () => {
      const getValues = () => ({ password: "mypassword" })
      const rules = confirmPasswordRules(getValues, true)

      expect(rules.required).toBe("Password confirmation is required")
      expect(rules.validate("mypassword")).toBe(true)
    })

    it("should validate matching passwords with new_password field", () => {
      const getValues = () => ({ new_password: "mypassword" })
      const rules = confirmPasswordRules(getValues, true)

      expect(rules.validate("mypassword")).toBe(true)
    })

    it("should reject non-matching passwords", () => {
      const getValues = () => ({ password: "mypassword" })
      const rules = confirmPasswordRules(getValues, true)

      expect(rules.validate("differentpassword")).toBe(
        "The passwords do not match",
      )
    })

    it("should prioritize password over new_password", () => {
      const getValues = () => ({
        password: "password1",
        new_password: "password2",
      })
      const rules = confirmPasswordRules(getValues, true)

      expect(rules.validate("password1")).toBe(true)
      expect(rules.validate("password2")).toBe("The passwords do not match")
    })

    it("should not return required rule when isRequired is false", () => {
      const getValues = () => ({ password: "mypassword" })
      const rules = confirmPasswordRules(getValues, false)

      expect(rules.required).toBeUndefined()
      expect(rules.validate("mypassword")).toBe(true)
    })

    it("should default to required when no second argument provided", () => {
      const getValues = () => ({ password: "mypassword" })
      const rules = confirmPasswordRules(getValues)

      expect(rules.required).toBe("Password confirmation is required")
    })

    it("should handle empty password field", () => {
      const getValues = () => ({ password: "", new_password: "" })
      const rules = confirmPasswordRules(getValues, true)

      expect(rules.validate("")).toBe(true)
      expect(rules.validate("something")).toBe("The passwords do not match")
    })
  })
})
