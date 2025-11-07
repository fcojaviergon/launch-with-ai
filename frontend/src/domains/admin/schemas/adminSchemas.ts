import { z } from "zod"

// Reusable email schema (matching other domains)
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required")

// Reusable password schema (matching other domains)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")

// Admin user creation schema with password confirmation
export const adminUserCreateSchema = z
  .object({
    email: emailSchema,
    full_name: z.string().optional(),
    password: passwordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
    is_superuser: z.boolean(),
    is_active: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords do not match",
    path: ["confirm_password"],
  })

export type AdminUserCreateFormData = z.infer<typeof adminUserCreateSchema>

// Admin user update schema with optional password
export const adminUserUpdateSchema = z
  .object({
    email: emailSchema,
    full_name: z.string().optional().nullable(),
    password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
    confirm_password: z.string().optional().or(z.literal("")),
    is_superuser: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If password is provided and not empty, confirm_password must match
      if (data.password && data.password !== "") {
        return data.password === data.confirm_password
      }
      return true
    },
    {
      message: "The passwords do not match",
      path: ["confirm_password"],
    }
  )

export type AdminUserUpdateFormData = z.infer<typeof adminUserUpdateSchema>
