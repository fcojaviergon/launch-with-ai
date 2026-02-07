import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { NumberInputField, NumberInputRoot } from "@/components/ui/number-input"
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCustomToast } from "@shared/hooks"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FaPlus } from "react-icons/fa"
import { useCreateProject } from "../api/projects.api"
import { type ProjectCreateFormData, projectCreateSchema } from "../schemas"

export const AddProject = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const createProject = useCreateProject()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProjectCreateFormData>({
    resolver: zodResolver(projectCreateSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      system_prompt: "",
      max_context_tokens: 100000,
    },
  })

  const onSubmit: SubmitHandler<ProjectCreateFormData> = (data) => {
    createProject.mutate(data, {
      onSuccess: () => {
        showSuccessToast(t("projects:projectCreatedSuccess"))
        reset()
        setIsOpen(false)
      },
    })
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "lg" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-project" my={4}>
          <FaPlus fontSize="16px" />
          {t("projects:newProject")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("projects:createNewProject")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              {t("projects:createProjectDescription")}
            </Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label={t("projects:projectName")}
              >
                <Input
                  id="name"
                  {...register("name")}
                  placeholder={t("projects:projectNamePlaceholder")}
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label={t("projects:description")}
              >
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder={t("projects:descriptionPlaceholder")}
                  rows={3}
                />
              </Field>

              <Field
                invalid={!!errors.system_prompt}
                errorText={errors.system_prompt?.message}
                label={t("projects:systemPrompt")}
                helperText={t("projects:systemPromptHelper")}
              >
                <Textarea
                  id="system_prompt"
                  {...register("system_prompt")}
                  placeholder={t("projects:systemPromptPlaceholder")}
                  rows={4}
                />
              </Field>

              <Field
                invalid={!!errors.max_context_tokens}
                errorText={errors.max_context_tokens?.message}
                label={t("projects:maxContextTokens")}
                helperText={t("projects:maxContextTokensHelper")}
              >
                <NumberInputRoot
                  id="max_context_tokens"
                  defaultValue="100000"
                  min={1000}
                  max={1000000}
                  step={1000}
                >
                  <NumberInputField
                    {...register("max_context_tokens", { valueAsNumber: true })}
                  />
                </NumberInputRoot>
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                {t("common:cancel")}
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              {t("projects:createProject")}
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
