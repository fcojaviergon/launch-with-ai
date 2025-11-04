import { z } from "zod"

// Reusable email schema
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required")

// Reusable password schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .min(1, "Password is required")

// Login schema
export const loginSchema = z.object({
  username: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Signup schema
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().optional(),
})

export type SignupFormData = z.infer<typeof signupSchema>

// Recover password schema
export const recoverPasswordSchema = z.object({
  email: emailSchema,
})

export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    new_password: passwordSchema,
    confirm_password: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
