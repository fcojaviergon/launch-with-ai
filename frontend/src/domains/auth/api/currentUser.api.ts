import { UsersService } from "@domains/users"
import type { UserPublic } from "@domains/users"
import { useQuery } from "@tanstack/react-query"

/**
 * Hook to fetch current user
 *
 * With httpOnly cookies, we always try to fetch the user.
 * The browser sends the cookie automatically, and if it's invalid/missing,
 * the server returns 401 and we know the user is not authenticated.
 */
export const useCurrentUser = () => {
  return useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401
  })
}
