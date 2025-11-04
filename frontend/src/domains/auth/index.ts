/**
 * Auth Domain
 *
 * This module handles all authentication-related functionality including:
 * - User login/logout
 * - User registration
 * - Password recovery and reset
 * - Current user management
 * - Protected routes
 *
 * @module domains/auth
 */

// Components
export * from "./components"

// Hooks & API
export * from "./hooks"
export * from "./api"

// Services (OpenAPI client)
export * from "./services"

// Types
export type * from "./types/auth.types"

// Schemas (explicit exports to avoid conflicts)
export {
  emailSchema,
  passwordSchema,
  loginSchema,
  signupSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
} from "./schemas/authSchemas"
