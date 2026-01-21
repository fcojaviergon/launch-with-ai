/**
 * Projects API service
 */
import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request as __request } from "@/client/core/request"
import type {
  Document,
  DocumentProgress,
  DocumentUpdate,
  DocumentsResponse,
  Project,
  ProjectCapacity,
  ProjectCreate,
  ProjectUpdate,
  ProjectsResponse,
} from "../types/projects.types"

export class ProjectsService {
  /**
   * Get all projects for the current user
   */
  public static getProjects(): CancelablePromise<ProjectsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/projects",
    })
  }

  /**
   * Create a new project
   */
  public static createProject(data: {
    requestBody: ProjectCreate
  }): CancelablePromise<Project> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/projects",
      body: data.requestBody,
      mediaType: "application/json",
    })
  }

  /**
   * Get a project by ID
   */
  public static getProject(data: {
    projectId: string
  }): CancelablePromise<Project> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/projects/{project_id}",
      path: {
        project_id: data.projectId,
      },
    })
  }

  /**
   * Get project capacity information
   */
  public static getProjectCapacity(data: {
    projectId: string
  }): CancelablePromise<ProjectCapacity> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/projects/{project_id}/capacity",
      path: {
        project_id: data.projectId,
      },
    })
  }

  /**
   * Update a project
   */
  public static updateProject(data: {
    projectId: string
    requestBody: ProjectUpdate
  }): CancelablePromise<Project> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/projects/{project_id}",
      path: {
        project_id: data.projectId,
      },
      body: data.requestBody,
      mediaType: "application/json",
    })
  }

  /**
   * Delete a project
   */
  public static deleteProject(data: {
    projectId: string
  }): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/projects/{project_id}",
      path: {
        project_id: data.projectId,
      },
    })
  }

  /**
   * Get documents for a project
   */
  public static getProjectDocuments(data: {
    projectId: string
  }): CancelablePromise<DocumentsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/projects/{project_id}/documents",
      path: {
        project_id: data.projectId,
      },
    })
  }

  /**
   * Upload a document to a project
   */
  public static uploadDocument(data: {
    projectId: string
    file: File
    documentType?: string
  }): CancelablePromise<Document> {
    const formData = new FormData()
    formData.append("file", data.file)
    formData.append("document_type", data.documentType || "other")

    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/projects/{project_id}/documents",
      path: {
        project_id: data.projectId,
      },
      body: formData,
      mediaType: "multipart/form-data",
    })
  }

  /**
   * Get document details
   */
  public static getDocument(data: {
    documentId: string
  }): CancelablePromise<Document> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/documents/{document_id}",
      path: {
        document_id: data.documentId,
      },
    })
  }

  /**
   * Get document processing progress
   */
  public static getDocumentProgress(data: {
    documentId: string
  }): CancelablePromise<DocumentProgress> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/documents/{document_id}/progress",
      path: {
        document_id: data.documentId,
      },
    })
  }

  /**
   * Update document metadata
   */
  public static updateDocument(data: {
    documentId: string
    requestBody: DocumentUpdate
  }): CancelablePromise<Document> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/documents/{document_id}",
      path: {
        document_id: data.documentId,
      },
      body: data.requestBody,
      mediaType: "application/json",
    })
  }

  /**
   * Delete a document
   */
  public static deleteDocument(data: {
    documentId: string
  }): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/documents/{document_id}",
      path: {
        document_id: data.documentId,
      },
    })
  }

  /**
   * Retry processing a failed document
   */
  public static retryDocument(data: {
    documentId: string
  }): CancelablePromise<Document> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/documents/{document_id}/retry",
      path: {
        document_id: data.documentId,
      },
    })
  }
}
