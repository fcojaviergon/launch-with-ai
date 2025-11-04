// User domain types - re-export from types.ts (OpenAPI generated)
export type {
  UserPublic,
  UserCreate,
  UserUpdate,
  UserRegister,
  UsersPublic,
  UpdatePassword,
  UserUpdateMe,
} from "./types"

// Additional domain-specific types
export interface UserFilters {
  search?: string
  is_active?: boolean
  is_superuser?: boolean
}

export interface UserListParams {
  skip?: number
  limit?: number
  filters?: UserFilters
}
