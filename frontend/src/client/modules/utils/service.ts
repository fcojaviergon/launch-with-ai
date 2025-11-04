// Utils service - auto-generated from OpenAPI spec
import type { CancelablePromise } from "../../core/CancelablePromise"
import { OpenAPI } from "../../core/OpenAPI"
import { request as __request } from "../../core/request"
import type {
  UtilsHealthCheckResponse,
  UtilsTestEmailData,
  UtilsTestEmailResponse,
} from "./types"

export class UtilsService {
  /**
   * Test Email
   * Test emails.
   * @param data The data for the request.
   * @param data.emailTo
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(
    data: UtilsTestEmailData,
  ): CancelablePromise<UtilsTestEmailResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email/",
      query: {
        email_to: data.email_to,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Health Check
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static healthCheck(): CancelablePromise<UtilsHealthCheckResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/utils/health-check/",
    })
  }
}
