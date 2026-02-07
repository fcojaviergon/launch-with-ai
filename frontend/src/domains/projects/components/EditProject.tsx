import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { NumberInputField, NumberInputRoot } from "@/components/ui/number-input"
import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
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
import { FaEdit } from "react-icons/fa"
import { useUpdateProject } from "../api/projects.api"
import { type ProjectUpdateFormData, projectUpdateSchema } from "../schemas"
import type { Project } from "../types/projects.types"

interface EditProjectProps {
  project: Project
}

export const EditProject = ({ project }: EditProjectProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const updateProject = useUpdateProject()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectUpdateFormData>({
    resolver: zodResolver(projectUpdateSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: project.name,
      description: project.description ?? undefined,
      system_prompt: project.system_prompt ?? undefined,
      max_context_tokens: project.max_context_tokens,
    },
  })

  const onSubmit: SubmitHandler<ProjectUpdateFormData> = async (data) => {
    updateProject.mutate(
      { projectId: project.id, data },
      {
        onSuccess: () => {
          showSuccessToast(t("projects:projectUpdatedSuccess"))
          reset()
          setIsOpen(false)
        },
      },
    )
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "lg" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FaEdit fontSize="16px" />
          {t("common:edit")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("projects:editProject")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>{t("projects:editProjectDescription")}</Text>
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
                  defaultValue={(
                    project.max_context_tokens ?? 128000
                  ).toString()}
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
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  {t("common:cancel")}
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                {t("common:save")}
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
