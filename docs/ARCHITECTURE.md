# Frontend Architecture - Domain-Driven Design

## 📋 Overview

The frontend follows a **Domain-Driven Design (DDD)** architecture, organizing code by business domains rather than technical layers. This approach improves cohesion, scalability, and maintainability.

## 🏗️ Directory Structure

```
frontend/src/
├── domains/              # 🎯 Business domains (self-contained)
│   ├── auth/            # Authentication & Authorization
│   ├── users/           # User profile management
│   ├── items/           # Items CRUD
│   ├── chat/            # Chat & Conversations
│   └── admin/           # User management (admin-only)
├── shared/              # 🔧 Shared across all domains
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Global hooks (useCustomToast)
│   └── utils/           # Shared utilities (validation, errors)
├── routes/              # 🛣️ TanStack Router routes
├── components/ui/       # 🎨 Base UI components (Chakra UI)
├── client/              # 🤖 OpenAPI infrastructure
│   ├── core/           # ApiError, request, OpenAPI config
│   └── modules/utils/  # Common types (Message, ValidationError)
├── theme/              # ⚙️ Chakra UI theme (system, recipes)
└── utils/              # Theme utilities
```

## 🎯 Domain Structure

Each domain is **self-contained** with all functionality in one place:

```
domains/[domain-name]/
├── api/                 # React Query hooks (data fetching)
│   ├── [entity].api.ts # useItems, useCreateItem, etc.
│   └── index.ts
├── components/          # Domain-specific UI components
│   ├── Add[Entity].tsx
│   ├── Edit[Entity].tsx
│   └── index.ts
├── services/            # OpenAPI client services (AUTO-GENERATED)
│   ├── service.ts      # ItemsService, UsersService, etc.
│   └── index.ts
├── types/              # TypeScript types
│   ├── types.ts        # AUTO-GENERATED from OpenAPI
│   ├── [domain].types.ts  # Custom domain types
│   └── index.ts
├── schemas/            # Zod validation schemas (OPTIONAL)
│   └── [entity]Schemas.ts
└── index.ts            # Public API (barrel export)
```

## 📚 Domains

### 1. Auth Domain (`domains/auth/`)

Handles authentication and authorization:
- User login/logout
- User registration
- Password recovery/reset
- Current user management
- Protected routes

**Key exports:**
```typescript
import {
  useAuth,           // Main auth hook
  useLogin,          // Login mutation
  useSignup,         // Signup mutation
  LoginForm,         // Login component
  SignupForm,        // Signup component
  ProtectedRoute,    // Route guard component
  isLoggedIn,        // Auth utility
} from '@domains/auth'
```

### 2. Users Domain (`domains/users/`)

Manages user data and profiles:
- User CRUD operations
- User listing with pagination
- User profile management

**Key exports:**
```typescript
import {
  useUsers,          // Fetch users list
  useUser,           // Fetch single user
  useCreateUser,     // Create user
  useUpdateUser,     // Update user
  useDeleteUser,     // Delete user
} from '@domains/users'
```

### 3. Items Domain (`domains/items/`)

Manages items/resources:
- Item CRUD operations
- Item listing with pagination

**Key exports:**
```typescript
import {
  useItems,          // Fetch items list
  useItem,           // Fetch single item
  useCreateItem,     // Create item
  useUpdateItem,     // Update item
  useDeleteItem,     // Delete item
} from '@domains/items'
```

### 4. Chat Domain (`domains/chat/`)

Handles real-time chat functionality:
- Conversation management
- Message sending/receiving
- AI chat integration
- Document-based chat

**Key exports:**
```typescript
import {
  useChat,              // Main chat hook
  useConversations,     // Fetch conversations
  useCreateConversation,// Create conversation
  useSendMessage,       // Send message
  useDeleteConversation,// Delete conversation
} from '@domains/chat'
```

### 5. Analysis Domain (`domains/analysis/`)

Manages analysis workflows and documents:
- Analysis CRUD operations
- Document upload and management
- Embeddings generation
- Task management

**Key exports:**
```typescript
import {
  useAnalyses,       // Fetch analyses
  useAnalysis,       // Fetch single analysis
  useCreateAnalysis, // Create analysis
  useUpdateAnalysis, // Update analysis
  useDeleteAnalysis, // Delete analysis
  useDocuments,      // Fetch documents
  useUploadDocument, // Upload document
} from '@domains/analysis'
```

### 6. Admin Domain (`domains/admin/`)

Admin-only operations:
- User management (admin)
- System statistics
- Admin operations

**Key exports:**
```typescript
import {
  useAdminUsers,        // Fetch users (admin)
  useAdminCreateUser,   // Create user (admin)
  useAdminUpdateUser,   // Update user (admin)
  useAdminDeleteUser,   // Delete user (admin)
} from '@domains/admin'
```

## 🔧 Shared Code

### Components (`shared/components/`)
Reusable UI components used across domains:
- Button, Input, Modal, etc.
- Layout components
- Generic data display components

### Hooks (`shared/hooks/`)
Global hooks available to all domains:
- `useCustomToast` - Toast notifications
- `useDebounce` - Debounce values
- `useLocalStorage` - Local storage management

### Utils (`shared/utils/`)
Utility functions:
- API error handling
- Form validation helpers
- Date/time formatting
- String manipulation

## 🎨 Design Patterns

### 1. API Layer Pattern
Each domain has dedicated API hooks using React Query:

```typescript
// domains/users/api/users.api.ts
export const useUsers = (skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ["users", { skip, limit }],
    queryFn: () => UsersService.readUsers({ skip, limit }),
  })
}
```

### 2. Component Composition Pattern
Components are small, focused, and composable:

```typescript
// domains/auth/components/LoginForm.tsx
export const LoginForm = () => {
  const { login } = useAuth()
  // Component logic...
}
```

### 3. Hook Abstraction Pattern
Complex logic is abstracted into custom hooks:

```typescript
// domains/chat/hooks/useChat.ts
export function useChat(analysisId: string) {
  // Combines multiple API hooks
  // Manages local state
  // Provides simplified interface
}
```

## 🚀 Usage Examples

### Using Auth Domain
```typescript
import { useAuth, ProtectedRoute } from '@domains/auth'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute>
      <h1>Welcome {user?.full_name}</h1>
      <button onClick={logout}>Logout</button>
    </ProtectedRoute>
  )
}
```

### Using Chat Domain
```typescript
import { useChat } from '@domains/chat'

function ChatInterface({ analysisId }: { analysisId: string }) {
  const {
    conversations,
    activeConversation,
    sendMessage,
    createNewConversation,
  } = useChat(analysisId)

  return (
    <div>
      <ConversationList conversations={conversations} />
      <MessageList messages={activeConversation?.messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  )
}
```

### Using Analysis Domain
```typescript
import { useAnalyses, useUploadDocument } from '@domains/analysis'

function AnalysisPage() {
  const { data: analyses } = useAnalyses()
  const uploadDocument = useUploadDocument()

  const handleUpload = (file: File, analysisId: string) => {
    uploadDocument.mutate({ analysisId, file })
  }

  return <AnalysisList analyses={analyses} onUpload={handleUpload} />
}
```

## 📦 Barrel Exports

Each domain uses barrel exports (`index.ts`) for clean imports:

```typescript
// Instead of:
import { useAuth } from '@domains/auth/hooks/useAuth'
import { LoginForm } from '@domains/auth/components/LoginForm'
import { isLoggedIn } from '@domains/auth/api/login.api'

// Use:
import { useAuth, LoginForm, isLoggedIn } from '@domains/auth'
```

## 🎯 Benefits of This Architecture

1. **Domain Cohesion**: Related code lives together
2. **Scalability**: Easy to add new domains
3. **Maintainability**: Changes isolated to domains
4. **Testability**: Test domains independently
5. **Developer Experience**: Clear structure, easy to navigate
6. **Code Reuse**: Shared code in `shared/`
7. **Type Safety**: Strong TypeScript support

## 🔄 Migration Guide

When adding a new feature:

1. **Identify the domain** (auth, users, chat, etc.)
2. **Add API hooks** in `domains/[domain]/api/`
3. **Create types** in `domains/[domain]/types/`
4. **Add schemas** (if forms) in `domains/[domain]/schemas/`
5. **Build components** in `domains/[domain]/components/`
6. **Export from index** in `domains/[domain]/index.ts`
7. **Use in routes** from `routes/`

## 📝 Path Aliases

The following path aliases are configured:

```typescript
@/*          -> src/*
@domains/*   -> src/domains/*
@shared/*    -> src/shared/*
@config/*    -> src/config/*
```

Use them for clean imports:
```typescript
import { useAuth } from '@domains/auth'
import { Button } from '@shared/components'
import { API_URL } from '@config/constants'
```

## 🧪 Testing Strategy

Each domain can be tested independently:

```typescript
// domains/auth/__tests__/useAuth.test.ts
describe('useAuth', () => {
  it('should login user', async () => {
    // Test auth domain in isolation
  })
})
```

## 🚀 Future Enhancements

Potential additions to the architecture:
- State management per domain (Zustand stores)
- Domain-specific error boundaries
- Domain-specific routing
- Micro-frontend architecture
- Feature flags per domain

---

**Last Updated**: October 2025
**Architecture Version**: 1.0
**Maintained by**: Development Team
