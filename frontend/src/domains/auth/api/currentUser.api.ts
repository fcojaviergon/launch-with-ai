import { UsersService } from "@domains/users"
import type { UserPublic } from "@domains/users"
import { useQuery } from "@tanstack/react-query"
import { isLoggedIn } from "./login.api"

/**
 * Hook to fetch current user
 */
export const useCurrentUser = () => {
  return useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
