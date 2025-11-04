import type { ApiError } from "@/client"
import { UsersService } from "@domains/users"
import type { UserCreate, UserUpdate } from "@domains/users"
import { handleError } from "@shared/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/**
 * Hook to fetch all users (admin only)
 */
export const useAdminUsers = (skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ["admin", "users", { skip, limit }],
    queryFn: () => UsersService.readUsers({ skip, limit }),
  })
}

/**
 * Hook to create a user (admin only)
 */
export const useAdminCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserCreate) =>
      UsersService.createUser({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

/**
 * Hook to update a user (admin only)
 */
export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdate }) =>
      UsersService.updateUser({ userId, requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

/**
 * Hook to delete a user (admin only)
 */
export const useAdminDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => UsersService.deleteUser({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}
