import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import React, { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

import { ApiError, OpenAPI } from "./client"
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

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    // No need to clear localStorage - cookies are managed by the browser
    window.location.href = "/login"
  }
}
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })
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
