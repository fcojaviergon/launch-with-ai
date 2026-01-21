import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useCurrentUser } from "../api/currentUser.api"
import { logout as logoutApi, useLogin } from "../api/login.api"
import { useSignup } from "../api/signup.api"

/**
 * Main Auth hook - Provides all authentication functionality
 *
 * This is the primary hook for auth operations in the application.
 * It combines login, signup, logout, and current user functionality.
 *
 * Authentication uses httpOnly cookies (XSS-immune):
 * - Login: Server sets httpOnly cookie automatically
 * - Requests: Browser sends cookie automatically
 * - Logout: Server clears the cookie
 *
 * @example
 * ```tsx
 * const { user, login, signup, logout, isLoading } = useAuth()
 *
 * // Login
 * await login.mutateAsync({ username: 'user@example.com', password: 'pass' })
 *
 * // Logout
 * await logout()
 *
 * // Check user
 * if (user) {
 *   console.log(`Welcome ${user.full_name}`)
 * }
 * ```
 */
export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // API hooks
  const loginMutation = useLogin()
  const signupMutation = useSignup()
  const { data: user, isLoading } = useCurrentUser()

  /**
   * Logout user and redirect to login page.
   * Calls the server to clear the httpOnly cookie.
   */
  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore logout errors - cookie might already be expired
    }
    queryClient.clear()
    navigate({ to: "/login" })
  }

  return {
    // Mutations
    login: loginMutation,
    signup: signupMutation,
    logout,

    // User data
    user,
    isAuthenticated: !!user,
    isLoading,

    // Legacy support (for backward compatibility)
    loginMutation,
    signUpMutation: signupMutation,
  }
}

export default useAuth
