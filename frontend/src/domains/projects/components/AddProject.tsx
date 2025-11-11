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
import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input"
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
import { FaPlus } from "react-icons/fa"
import { useCreateProject } from "../api/projects.api"
import { projectCreateSchema, type ProjectCreateFormData } from "../schemas"

export const AddProject = () => {
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
        showSuccessToast("Project created successfully.")
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
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Create a new project to organize your documents and conversations.</Text>
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
                  defaultValue="100000"
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
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Create Project
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
