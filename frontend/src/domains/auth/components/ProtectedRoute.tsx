import { Center, Spinner } from "@chakra-ui/react"
import { Navigate } from "@tanstack/react-router"
import { useAuth } from "../hooks"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

/**
 * ProtectedRoute component that guards routes requiring authentication
 *
 * With httpOnly cookies, we can't check auth from JS directly.
 * Instead, we rely on the useAuth hook which tries to fetch the current user.
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
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />
  }

  // Check admin requirement
  if (requireAdmin && !user.is_superuser) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}
