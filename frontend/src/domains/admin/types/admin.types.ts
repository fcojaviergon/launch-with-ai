// Admin domain types
export type {
  UserPublic,
  UserCreate,
  UserUpdate,
  UsersPublic,
} from "@domains/users"

export interface SystemStats {
  total_users: number
  active_users: number
  total_analyses: number
  total_documents: number
  total_embeddings: number
  storage_used: number
}

export interface AdminUserFilters {
  search?: string
  is_active?: boolean
  is_superuser?: boolean
  created_after?: string
  created_before?: string
}
