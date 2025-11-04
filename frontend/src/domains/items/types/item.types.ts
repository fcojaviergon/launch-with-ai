// Items domain types - re-export from types.ts (OpenAPI generated)
export type {
  ItemPublic,
  ItemCreate,
  ItemUpdate,
  ItemsPublic,
} from "./types"

export interface ItemFilters {
  search?: string
  owner_id?: string
}

export interface ItemListParams {
  skip?: number
  limit?: number
  filters?: ItemFilters
}
