import type { ApiError } from "@/client"
import { PasswordInput } from "@/components/ui/password-input"
import { Box, Button, Container, Heading, VStack } from "@chakra-ui/react"
import type { UpdatePassword } from "@domains/users"
import { UsersService } from "@domains/users"
import { useCustomToast } from "@shared/hooks"
import { confirmPasswordRules, handleError, passwordRules } from "@shared/utils"
import { useMutation } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock } from "react-icons/fi"

interface UpdatePasswordForm extends UpdatePassword {
  confirm_password: string
}

export const ChangePassword = () => {
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UpdatePasswordForm>({
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

  const onSubmit: SubmitHandler<UpdatePasswordForm> = async (data) => {
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
            {...register("current_password", passwordRules())}
            placeholder="Current Password"
            errors={errors}
          />
          <PasswordInput
            type="new_password"
            startElement={<FiLock />}
            {...register("new_password", passwordRules())}
            placeholder="New Password"
            errors={errors}
          />
          <PasswordInput
            type="confirm_password"
            startElement={<FiLock />}
            {...register("confirm_password", confirmPasswordRules(getValues))}
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
