import type { ApiError } from "@/client"
import { UsersService } from "@domains/users"
import type { UserCreate, UserUpdate } from "@domains/users"
import { handleError } from "@shared/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/**
 * Hook to fetch paginated users list
 */
export const useUsers = (skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ["users", { skip, limit }],
    queryFn: () => UsersService.readUsers({ skip, limit }),
  })
}

/**
 * Hook to fetch a single user by ID
 */
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => UsersService.readUserById({ userId }),
    enabled: !!userId,
  })
}

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserCreate) =>
      UsersService.createUser({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

/**
 * Hook to update a user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdate }) =>
      UsersService.updateUser({ userId, requestBody: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => UsersService.deleteUser({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}
