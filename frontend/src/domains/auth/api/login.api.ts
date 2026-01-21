import type { ApiError } from "@/client"
import { OpenAPI } from "@/client"
import { request as __request } from "@/client/core/request"
import { handleError } from "@shared/utils"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { LoginService } from "../services"
import type { LoginCredentials } from "../types/auth.types"

/**
 * Hook for user login
 *
 * Authentication now uses httpOnly cookies (XSS-immune).
 * The cookie is automatically set by the server on successful login
 * and sent with subsequent requests by the browser.
 */
export const useLogin = () => {
  const navigate = useNavigate()

  const loginFn = async (data: LoginCredentials) => {
    // Server sets httpOnly cookie automatically on successful login
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    return response
  }

  return useMutation({
    mutationFn: loginFn,
    onSuccess: () => {
      navigate({ to: "/" })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

/**
 * Check if user is logged in by calling the test-token endpoint.
 * Since we use httpOnly cookies, we can't check cookie existence from JS.
 * Instead, we rely on the currentUser query to determine auth state.
 *
 * @deprecated Use useCurrentUser() hook instead to check authentication state
 */
export const isLoggedIn = (): boolean => {
  // We can't reliably check httpOnly cookies from JavaScript
  // The app should rely on the currentUser query state instead
  console.warn(
    "isLoggedIn() is deprecated with httpOnly cookies. Use useCurrentUser() hook instead.",
  )
  return false
}

/**
 * Get access token from storage
 *
 * @deprecated Token is now stored in httpOnly cookie (not accessible from JS)
 */
export const getAccessToken = (): string | null => {
  console.warn(
    "getAccessToken() is deprecated. Token is stored in httpOnly cookie.",
  )
  return null
}

/**
 * Logout by calling the server endpoint to clear the httpOnly cookie.
 */
export const logout = async (): Promise<void> => {
  await __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/logout",
  })
}

/**
 * Remove access token - calls server logout endpoint
 *
 * @deprecated Use logout() instead
 */
export const removeAccessToken = async (): Promise<void> => {
  await logout()
}
