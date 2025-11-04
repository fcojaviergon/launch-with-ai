import type { ApiError } from "@/client"
import { handleError } from "@shared/utils"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { LoginService } from "../services"
import type { LoginCredentials } from "../types/auth.types"

/**
 * Hook for user login
 */
export const useLogin = () => {
  const navigate = useNavigate()

  const loginFn = async (data: LoginCredentials) => {
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    localStorage.setItem("access_token", response.access_token)
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
 * Check if user is logged in
 */
export const isLoggedIn = (): boolean => {
  return localStorage.getItem("access_token") !== null
}

/**
 * Get access token from storage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token")
}

/**
 * Remove access token from storage
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem("access_token")
}
