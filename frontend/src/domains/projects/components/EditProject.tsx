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
import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  NumberInputField,
  NumberInputRoot,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCustomToast } from "@shared/hooks"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaEdit } from "react-icons/fa"
import { useUpdateProject } from "../api/projects.api"
import { projectUpdateSchema, type ProjectUpdateFormData } from "../schemas"
import type { Project } from "../types/projects.types"

interface EditProjectProps {
  project: Project
}

export const EditProject = ({ project }: EditProjectProps) => {
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
          showSuccessToast("Project updated successfully.")
          reset()
          setIsOpen(false)
        },
      }
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
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the project details below.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Project Name"
              >
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="My Project"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label="Description"
              >
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Project description..."
                  rows={3}
                />
              </Field>

              <Field
                invalid={!!errors.system_prompt}
                errorText={errors.system_prompt?.message}
                label="System Prompt"
                helperText="Define the AI behavior for all conversations in this project"
              >
                <Textarea
                  id="system_prompt"
                  {...register("system_prompt")}
                  placeholder="You are a helpful assistant that..."
                  rows={4}
                />
              </Field>

              <Field
                invalid={!!errors.max_context_tokens}
                errorText={errors.max_context_tokens?.message}
                label="Max Context Tokens"
                helperText="Maximum tokens for documents + conversations (1K - 1M)"
              >
                <NumberInputRoot
                  id="max_context_tokens"
                  defaultValue={project.max_context_tokens.toString()}
                  min={1000}
                  max={1000000}
                  step={1000}
                >
                  <NumberInputField {...register("max_context_tokens", { valueAsNumber: true })} />
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
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Save
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
