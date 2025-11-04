// Auth domain types - re-export from types.ts (OpenAPI generated)
export type {
  Body_login_login_access_token as LoginCredentials,
  Token,
  NewPassword,
} from "./types"

export interface AuthUser {
  id: string
  email: string
  is_active: boolean
  is_superuser: boolean
  full_name: string | null
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginFormData {
  username: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  full_name?: string
}

export interface ResetPasswordFormData {
  token: string
  new_password: string
  confirm_password: string
}

export interface RecoverPasswordFormData {
  email: string
}
