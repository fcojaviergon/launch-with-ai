// Utils and common types - auto-generated from OpenAPI spec

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type Message = {
  message: string
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

// Request/Response types
export type UtilsTestEmailData = {
  email_to: string
}

export type UtilsTestEmailResponse = Message

export type UtilsHealthCheckResponse = boolean
