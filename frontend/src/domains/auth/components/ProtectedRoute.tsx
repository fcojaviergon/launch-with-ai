import { Navigate } from "@tanstack/react-router"
import { isLoggedIn, useAuth } from "../hooks"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

/**
 * ProtectedRoute component that guards routes requiring authentication
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * <ProtectedRoute requireAdmin>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn() || !user) {
    return <Navigate to="/login" />
  }

  // Check admin requirement
  if (requireAdmin && !user.is_superuser) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}
