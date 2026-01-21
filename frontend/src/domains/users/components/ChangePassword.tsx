import type { ApiError } from "@/client"
import { PasswordInput } from "@/components/ui/password-input"
import { Box, Button, Container, Heading, VStack } from "@chakra-ui/react"
import type { UpdatePassword } from "@domains/users"
import {
  type UpdatePasswordFormData,
  UsersService,
  updatePasswordSchema,
} from "@domains/users"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCustomToast } from "@shared/hooks"
import { handleError } from "@shared/utils"
import { useMutation } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock } from "react-icons/fi"

export const ChangePassword = () => {
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Password updated successfully.")
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<UpdatePasswordFormData> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <Container maxW="full">
      <Heading size="sm" py={4}>
        Change Password
      </Heading>
      <Box
        w={{ sm: "full", md: "300px" }}
        as="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <VStack gap={4}>
          <PasswordInput
            type="current_password"
            startElement={<FiLock />}
            {...register("current_password")}
            placeholder="Current Password"
            errors={errors}
          />
          <PasswordInput
            type="new_password"
            startElement={<FiLock />}
            {...register("new_password")}
            placeholder="New Password"
            errors={errors}
          />
          <PasswordInput
            type="confirm_password"
            startElement={<FiLock />}
            {...register("confirm_password")}
            placeholder="Confirm Password"
            errors={errors}
          />
        </VStack>
        <Button
          variant="solid"
          mt={4}
          type="submit"
          loading={isSubmitting}
          disabled={!isValid}
        >
          Save
        </Button>
      </Box>
    </Container>
  )
}
