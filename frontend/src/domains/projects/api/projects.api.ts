/**
 * React Query hooks for Projects API
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ProjectsService } from "../services/projects.service"
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectCapacity,
  Document,
  DocumentUpdate,
  DocumentProgress,
} from "../types/projects.types"
import { useCustomToast } from "@shared/hooks"

/**
 * Hook to fetch all projects
 */
export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await ProjectsService.getProjects()
      return response.data
    },
  })
}

/**
 * Hook to fetch a single project by ID
 */
export const useProject = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required")
      return ProjectsService.getProject({ projectId })
    },
    enabled: !!projectId,
  })
}

/**
 * Hook to fetch project capacity
 */
export const useProjectCapacity = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["projects", projectId, "capacity"],
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required")
      return ProjectsService.getProjectCapacity({ projectId })
    },
    enabled: !!projectId,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  })
}

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation<Project, Error, ProjectCreate>({
    mutationFn: (data) => ProjectsService.createProject({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

/**
 * Hook to update a project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation<
    Project,
    Error,
    { projectId: string; data: ProjectUpdate }
  >({
    mutationFn: ({ projectId, data }) =>
      ProjectsService.updateProject({ projectId, requestBody: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId],
      })
    },
  })
}

/**
 * Hook to delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (projectId) => ProjectsService.deleteProject({ projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

/**
 * Hook to fetch project documents
 */
export const useProjectDocuments = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["projects", projectId, "documents"],
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required")
      const response = await ProjectsService.getProjectDocuments({ projectId })
      return response.data
    },
    enabled: !!projectId,
    refetchInterval: 3000, // Refresh every 3 seconds for processing status
  })
}

/**
 * Hook to upload a document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient()

  return useMutation<
    Document,
    Error,
    { projectId: string; file: File; documentType?: string }
  >({
    mutationFn: ({ projectId, file, documentType }) =>
      ProjectsService.uploadDocument({ projectId, file, documentType }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "documents"],
      })
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "capacity"],
      })
    },
  })
}

/**
 * Hook to fetch document progress
 */
export const useDocumentProgress = (documentId: string | undefined) => {
  return useQuery({
    queryKey: ["documents", documentId, "progress"],
    queryFn: async () => {
      if (!documentId) throw new Error("Document ID is required")
      return ProjectsService.getDocumentProgress({ documentId })
    },
    enabled: !!documentId,
    refetchInterval: (data) => {
      // Stop polling if completed or failed
      if (
        data?.status === "completed" ||
        data?.status === "failed"
      ) {
        return false
      }
      return 1000 // Poll every second while processing
    },
  })
}

/**
 * Hook to update document metadata
 */
export const useUpdateDocument = () => {
  const queryClient = useQueryClient()

  return useMutation<
    Document,
    Error,
    { documentId: string; data: DocumentUpdate }
  >({
    mutationFn: ({ documentId, data }) =>
      ProjectsService.updateDocument({ documentId, requestBody: data }),
    onSuccess: (document) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", document.project_id, "documents"],
      })
    },
  })
}

/**
 * Hook to delete a document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { message: string },
    Error,
    { documentId: string; projectId: string }
  >({
    mutationFn: ({ documentId }) =>
      ProjectsService.deleteDocument({ documentId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "documents"],
      })
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "capacity"],
      })
    },
  })
}

/**
 * Hook to retry document processing
 */
export const useRetryDocument = () => {
  const queryClient = useQueryClient()

  return useMutation<Document, Error, string>({
    mutationFn: (documentId) => ProjectsService.retryDocument({ documentId }),
    onSuccess: (document) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", document.project_id, "documents"],
      })
    },
  })
}
