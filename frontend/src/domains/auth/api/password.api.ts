import type { ApiError } from "@/client"
import { handleError } from "@shared/utils"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { LoginService } from "../services"
import type { NewPassword } from "../types/auth.types"

/**
 * Hook for password recovery
 */
export const useRecoverPassword = () => {
  return useMutation({
    mutationFn: (email: string) => LoginService.recoverPassword({ email }),
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}

/**
 * Hook for password reset
 */
export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: NewPassword) =>
      LoginService.resetPassword({ requestBody: data }),
    onSuccess: () => {
      navigate({ to: "/login" })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })
}
