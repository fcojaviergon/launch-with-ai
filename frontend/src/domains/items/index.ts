/**
 * Items Domain
 *
 * This module handles all item management functionality including:
 * - Item CRUD operations
 * - Item listing and pagination
 *
 * @module domains/items
 */

// Components
export * from "./components"

// API & Hooks
export * from "./api"

// Services (OpenAPI client)
export * from "./services"

// Types (only export item.types which re-exports from types.ts)
export type * from "./types/item.types"
