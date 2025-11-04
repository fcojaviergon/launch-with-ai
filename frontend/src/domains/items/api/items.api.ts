import type { ApiError } from "@/client"
import type { ItemCreate, ItemUpdate } from "@domains/items"
import { handleError } from "@shared/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ItemsService } from "../services"

/**
 * Hook to fetch paginated items list
 */
export const useItems = (skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ["items", { skip, limit }],
    queryFn: () => ItemsService.readItems({ skip, limit }),
  })
}

/**
 * Hook to fetch a single item by ID
 */
export const useItem = (itemId: string) => {
  return useQuery({
    queryKey: ["items", itemId],
    queryFn: () => ItemsService.readItem({ id: itemId }),
    enabled: !!itemId,
  })
}

/**
 * Hook to create a new item
 */
export const useCreateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ItemCreate) =>
      ItemsService.createItem({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

/**
 * Hook to update an item
 */
export const useUpdateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: ItemUpdate }) =>
      ItemsService.updateItem({ id: itemId, requestBody: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      queryClient.invalidateQueries({ queryKey: ["items", variables.itemId] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

/**
 * Hook to delete an item
 */
export const useDeleteItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => ItemsService.deleteItem({ id: itemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}
