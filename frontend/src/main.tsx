import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

import { OpenAPI } from "./client"
import { CustomProvider } from "./components/ui/provider"

// TypeScript needs this declaration to understand Vite's import.meta.env
declare global {
  interface ImportMeta {
    env: Record<string, string>
  }
}

OpenAPI.BASE = import.meta.env.VITE_API_URL
// Enable credentials (cookies) for all API requests
// httpOnly cookies are automatically sent with requests - no manual token handling needed
OpenAPI.WITH_CREDENTIALS = true

// Configuration to use system theme by default
const USE_SYSTEM_THEME = true

// QueryClient without global error handlers
// Auth redirects are handled by route guards (beforeLoad) to avoid infinite loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Create router with context - provides queryClient to all routes
const router = createRouter({
  routeTree,
  context: { queryClient },
})
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomProvider useSystemTheme={USE_SYSTEM_THEME}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </CustomProvider>
  </StrictMode>,
)
