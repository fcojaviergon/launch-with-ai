---
name: launch-frontend
description: >
  Frontend development for Launch With AI using Domain-Driven Design with
  React 18, TypeScript, Chakra UI, TanStack Router/Query, and React Hook Form.
  Use when creating new frontend domains, components, API hooks, forms, or
  services. Triggers on tasks like "add a new domain", "create a form",
  "add API hooks", or any React/TypeScript work in the frontend/ directory.
---

# Launch Frontend Development Skill

Frontend development for Launch With AI using Domain-Driven Design with React 18, TypeScript, Chakra UI, TanStack Router/Query, and React Hook Form.

---

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Stack** | React 18, TypeScript (strict), Chakra UI v3, Vite |
| **Routing** | TanStack Router (file-based) |
| **Data Fetching** | TanStack Query v5 |
| **Forms** | React Hook Form + Zod |
| **Linting** | Biome |
| **Architecture** | Domain-Driven Design (DDD) |

## IMPORTANTE - Reglas de UI/UX

### Navegación y Layout
- **SIEMPRE agregar nuevas rutas al Sidebar** — cada página nueva debe tener entrada en navegación
- **SIEMPRE usar light/dark mode** — tokens de Chakra UI, nunca colores hardcodeados
- UI intuitiva: breadcrumbs, estados vacíos claros, feedback visual en acciones

### Data Fetching
- **Paginación por defecto: 20 registros** — no usar límites arbitrarios
- **NO hacer mocks de consultas** — coordinar con backend para datos reales desde el inicio
- **Autocomplete seguro**: debounce 300ms, sanitizar input, manejar loading/error/empty
- `useInfiniteQuery` para listas largas, `useQuery` con paginación para tablas

## Domain Structure

```
frontend/src/domains/[domain]/
├── api/                    # React Query hooks
│   ├── [entity].api.ts     # useQuery/useMutation hooks
│   └── index.ts            # Barrel export
├── services/               # API client (manual, uses generated types)
│   ├── service.ts          # Service class with static methods
│   └── index.ts
├── components/             # Domain-specific UI
│   ├── [Entity]List.tsx
│   ├── Add[Entity].tsx
│   ├── Edit[Entity].tsx
│   └── index.ts
├── types/                  # TypeScript types
│   ├── types.ts            # Generated/synced from OpenAPI
│   ├── [domain].types.ts   # Re-exports + custom types
│   └── index.ts
├── schemas/                # Zod validation (for forms)
│   └── [domain]Schemas.ts
├── hooks/                  # Domain-specific hooks (optional)
└── index.ts                # Public API (barrel export)
```

## Commands

```bash
# Development
npm run dev                      # Start dev server (Vite)
npm run build                    # Build for production

# Types & Linting
npm run lint                     # Lint and fix with Biome
./scripts/generate-types.sh     # Regenerate types from backend

# Testing
npm run test                     # Run tests
npm run test:ui                  # Tests with UI
```

## Type Generation Workflow

```
Backend changes API
       ↓
./scripts/generate-types.sh
       ↓
Types updated in src/client/
       ↓
TypeScript flags service mismatches
       ↓
Update domains/*/services/ if needed
```

## Path Aliases

```typescript
import { useAuth } from "@domains/auth"      // src/domains/auth
import { Button } from "@shared/components"  // src/shared/components
import { ApiError } from "@/client"          // src/client
```

---

## Checklists

### Adding a New Domain

1. [ ] Create folder: `src/domains/[domain]/`
2. [ ] Create subfolders: `api/`, `services/`, `components/`, `types/`
3. [ ] Create `types/types.ts` with types from OpenAPI (or manual)
4. [ ] Create `types/[domain].types.ts` with re-exports + custom types
5. [ ] Create `services/service.ts` with API methods
6. [ ] Create `api/[entity].api.ts` with React Query hooks
7. [ ] Create `index.ts` with barrel exports
8. [ ] Add route in `src/routes/`

### Adding a New Form

1. [ ] Create Zod schema in `schemas/[domain]Schemas.ts`
2. [ ] Create form component using `useForm` + `zodResolver`
3. [ ] Create mutation hook in `api/[entity].api.ts`
4. [ ] Connect form to mutation with `onSubmit`

---

## Extended Examples

### Example: Creating a New Domain (notifications)

**Step 1: Types**
```typescript
// domains/notifications/types/types.ts
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface NotificationCreate {
  title: string
  message: string
}

export interface NotificationsPublic {
  data: Notification[]
  count: number
}
```

```typescript
// domains/notifications/types/notification.types.ts
export type { Notification, NotificationCreate, NotificationsPublic } from "./types"

// Custom types for the domain
export interface NotificationFilters {
  read?: boolean
  since?: string
}
```

**Step 2: Service**
```typescript
// domains/notifications/services/service.ts
import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request as __request } from "@/client/core/request"
import type { Notification, NotificationsPublic } from "../types"

export class NotificationsService {
  public static getNotifications(params: {
    skip?: number
    limit?: number
  }): CancelablePromise<NotificationsPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/notifications/",
      query: params,
    })
  }

  public static markAsRead(id: string): CancelablePromise<Notification> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/api/v1/notifications/${id}/read`,
    })
  }
}
```

**Step 3: API Hooks**
```typescript
// domains/notifications/api/notifications.api.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { NotificationsService } from "../services"
import type { ApiError } from "@/client"
import { handleError } from "@shared/utils"

export const useNotifications = (skip = 0, limit = 50) => {
  return useQuery({
    queryKey: ["notifications", { skip, limit }],
    queryFn: () => NotificationsService.getNotifications({ skip, limit }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => NotificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: (err: ApiError) => handleError(err),
  })
}
```

**Step 4: Barrel Export**
```typescript
// domains/notifications/index.ts
export * from "./api"
export * from "./services"
export * from "./types"
export * from "./components"
```

---

### Example: Form with Zod Validation

```typescript
// domains/items/schemas/itemSchemas.ts
import { z } from "zod"

export const itemCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
})

export type ItemCreateFormData = z.infer<typeof itemCreateSchema>
```

```typescript
// domains/items/components/AddItem.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Textarea, FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react"
import { itemCreateSchema, type ItemCreateFormData } from "../schemas/itemSchemas"
import { useCreateItem } from "../api"

export function AddItem({ onSuccess }: { onSuccess?: () => void }) {
  const createItem = useCreateItem()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemCreateFormData>({
    resolver: zodResolver(itemCreateSchema),
  })

  const onSubmit = async (data: ItemCreateFormData) => {
    await createItem.mutateAsync(data)
    reset()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.title} mb={4}>
        <FormLabel>Title</FormLabel>
        <Input {...register("title")} placeholder="Enter title" />
        <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.description} mb={4}>
        <FormLabel>Description</FormLabel>
        <Textarea {...register("description")} placeholder="Enter description" />
        <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
      </FormControl>

      <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
        Create Item
      </Button>
    </form>
  )
}
```

---

### Example: API Hook with Optimistic Updates

```typescript
// domains/items/api/items.api.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ItemsService } from "../services"
import type { ItemPublic, ItemsPublic } from "../types"

export const useDeleteItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ItemsService.deleteItem({ id }),

    // Optimistic update
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["items"] })

      const previousItems = queryClient.getQueryData<ItemsPublic>(["items"])

      queryClient.setQueryData<ItemsPublic>(["items"], (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((item) => item.id !== deletedId),
          count: old.count - 1,
        }
      })

      return { previousItems }
    },

    // Rollback on error
    onError: (err, deletedId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems)
      }
    },

    // Refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })
}
```

---

## Common Patterns

### Error Handling
```typescript
import { handleError } from "@shared/utils"
import type { ApiError } from "@/client"

// In mutation
onError: (err: ApiError) => handleError(err)
```

### Loading States
```typescript
const { data, isLoading, isError, error } = useItems()

if (isLoading) return <Spinner />
if (isError) return <ErrorMessage error={error} />
```

### Protected Routes
```typescript
// In route file
export const Route = createFileRoute("/_layout/items")({
  component: ItemsPage,
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
})
```
