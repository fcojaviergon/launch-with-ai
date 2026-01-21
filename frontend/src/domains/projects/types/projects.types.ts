/**
 * Projects domain types - Re-exported from auto-generated OpenAPI client
 * DO NOT duplicate types here - import from @/client/types.gen instead
 */

// Re-export core project types from OpenAPI
export type {
  ProjectCreate,
  ProjectPublic,
  ProjectsPublic,
  ProjectUpdate,
  ProjectCapacity,
  DocumentPublic,
  DocumentsPublic,
  DocumentProgress,
  DocumentStatus,
  DocumentUpdate,
  Message,
  Body_projects_upload_document,
} from "@/client/types.gen"

// Re-export request/response types from OpenAPI
export type {
  ProjectsCreateProjectData,
  ProjectsCreateProjectResponse,
  ProjectsGetProjectsData,
  ProjectsGetProjectsResponse,
  ProjectsGetProjectData,
  ProjectsGetProjectResponse,
  ProjectsUpdateProjectData,
  ProjectsUpdateProjectResponse,
  ProjectsDeleteProjectData,
  ProjectsDeleteProjectResponse,
  ProjectsGetProjectCapacityData,
  ProjectsGetProjectCapacityResponse,
  ProjectsGetProjectDocumentsData,
  ProjectsGetProjectDocumentsResponse,
  ProjectsUploadDocumentData,
  ProjectsUploadDocumentResponse,
  DocumentsGetDocumentData,
  DocumentsGetDocumentResponse,
  DocumentsUpdateDocumentData,
  DocumentsUpdateDocumentResponse,
  DocumentsDeleteDocumentData,
  DocumentsDeleteDocumentResponse,
  DocumentsGetDocumentProgressData,
  DocumentsGetDocumentProgressResponse,
  DocumentsRetryDocumentProcessingData,
  DocumentsRetryDocumentProcessingResponse,
} from "@/client/types.gen"

// =============================================================================
// Type aliases for backward compatibility with existing code
// =============================================================================

/** @deprecated Use ProjectPublic from OpenAPI instead */
export type Project = import("@/client/types.gen").ProjectPublic

/** @deprecated Use DocumentPublic from OpenAPI instead */
export type Document = import("@/client/types.gen").DocumentPublic

/** @deprecated Use ProjectsPublic from OpenAPI instead */
export type ProjectsResponse = import("@/client/types.gen").ProjectsPublic

/** @deprecated Use DocumentsPublic from OpenAPI instead */
export type DocumentsResponse = import("@/client/types.gen").DocumentsPublic
