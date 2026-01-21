import { z } from "zod"

// Reusable email schema (matching auth domain pattern)
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required")

// Reusable password schema (matching auth domain pattern)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .min(1, "Password is required")

// Update password schema with confirmation
export const updatePasswordSchema = z
  .object({
    current_password: passwordSchema,
    new_password: passwordSchema,
    confirm_password: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "The passwords do not match",
    path: ["confirm_password"],
  })

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>

// User information update schema
export const userUpdateMeSchema = z.object({
  full_name: z
    .string()
    .max(30, "Name must be 30 characters or less")
    .optional(),
  email: emailSchema,
})

export type UserUpdateMeFormData = z.infer<typeof userUpdateMeSchema>
