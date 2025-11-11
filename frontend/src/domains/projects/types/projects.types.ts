/**
 * Projects domain types
 */

export type DocumentStatus = "pending" | "processing" | "completed" | "failed"

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  system_prompt: string | null
  max_context_tokens: number
  created_at: string
  updated_at: string
  documents?: Document[]
  capacity?: ProjectCapacity
}

export interface Document {
  id: string
  project_id: string
  filename: string
  file_path: string
  file_size: number
  file_type: string
  document_type: string
  status: DocumentStatus
  error_message: string | null
  total_chunks: number
  processed_chunks: number
  estimated_tokens: number
  task_id: string | null
  uploaded_at: string
  processing_started_at: string | null
  processing_completed_at: string | null
}

export interface ProjectCapacity {
  documents_tokens: number
  conversations_tokens: number
  total_tokens: number
  max_tokens: number
  usage_percentage: number
  remaining_tokens: number
  is_near_limit: boolean
  is_over_limit: boolean
}

export interface DocumentProgress {
  document_id: string
  status: DocumentStatus
  total_chunks: number
  processed_chunks: number
  progress_percentage: number
  error_message: string | null
}

// Create types
export interface ProjectCreate {
  name: string
  description?: string | null
  system_prompt?: string | null
  max_context_tokens?: number
}

export interface ProjectUpdate {
  name?: string
  description?: string | null
  system_prompt?: string | null
  max_context_tokens?: number
}

export interface DocumentUpdate {
  document_type?: string
}

// List responses
export interface ProjectsResponse {
  data: Project[]
  count: number
}

export interface DocumentsResponse {
  data: Document[]
  count: number
}
