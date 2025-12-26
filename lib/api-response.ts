/**
 * Standardized API response wrapper
 * Consistent format for all API responses (success and error)
 */

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  timestamp: string
  requestId?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
  requestId?: string
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

export enum ApiErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND'
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  requestId?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId
  }
}

/**
 * Create an error response
 */
export function errorResponse(
  code: ApiErrorCode | string,
  message: string,
  details?: Record<string, any>,
  requestId?: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString(),
    requestId
  }
}

/**
 * Map HTTP status code to API error code
 */
export function httpStatusToErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return ApiErrorCode.BAD_REQUEST
    case 401:
      return ApiErrorCode.UNAUTHORIZED
    case 403:
      return ApiErrorCode.FORBIDDEN
    case 404:
      return ApiErrorCode.NOT_FOUND
    case 409:
      return ApiErrorCode.CONFLICT
    case 429:
      return ApiErrorCode.RATE_LIMITED
    case 503:
      return ApiErrorCode.SERVICE_UNAVAILABLE
    default:
      return ApiErrorCode.INTERNAL_SERVER_ERROR
  }
}

/**
 * Map API error code to HTTP status code
 */
export function errorCodeToHttpStatus(code: ApiErrorCode | string): number {
  switch (code) {
    case ApiErrorCode.BAD_REQUEST:
    case ApiErrorCode.VALIDATION_ERROR:
      return 400
    case ApiErrorCode.UNAUTHORIZED:
    case ApiErrorCode.AUTHENTICATION_FAILED:
      return 401
    case ApiErrorCode.FORBIDDEN:
    case ApiErrorCode.PERMISSION_DENIED:
      return 403
    case ApiErrorCode.NOT_FOUND:
    case ApiErrorCode.RESOURCE_NOT_FOUND:
      return 404
    case ApiErrorCode.CONFLICT:
      return 409
    case ApiErrorCode.RATE_LIMITED:
      return 429
    case ApiErrorCode.SERVICE_UNAVAILABLE:
      return 503
    case ApiErrorCode.INTERNAL_SERVER_ERROR:
    default:
      return 500
  }
}

/**
 * Build API error response with HTTP status
 */
export function buildErrorResponse(
  code: ApiErrorCode | string,
  message: string,
  status?: number,
  details?: Record<string, any>,
  requestId?: string
): { response: ApiErrorResponse; status: number } {
  const httpStatus = status || errorCodeToHttpStatus(code)
  return {
    response: errorResponse(code, message, details, requestId),
    status: httpStatus
  }
}

/**
 * Response builder class for fluent API
 */
export class ResponseBuilder<T = any> {
  private data?: T
  private errorCode?: string
  private errorMessage?: string
  private errorDetails?: Record<string, any>
  private requestId?: string
  private httpStatus?: number

  withData(data: T): this {
    this.data = data
    return this
  }

  withError(code: string, message: string, details?: Record<string, any>): this {
    this.errorCode = code
    this.errorMessage = message
    this.errorDetails = details
    return this
  }

  withRequestId(id: string): this {
    this.requestId = id
    return this
  }

  withStatus(status: number): this {
    this.httpStatus = status
    return this
  }

  build(): ApiResponse<T> {
    if (this.errorCode && this.errorMessage) {
      return errorResponse(
        this.errorCode,
        this.errorMessage,
        this.errorDetails,
        this.requestId
      )
    }

    if (!this.data) {
      return errorResponse(
        ApiErrorCode.INTERNAL_SERVER_ERROR,
        'No data provided for success response',
        undefined,
        this.requestId
      )
    }

    return successResponse(this.data, this.requestId)
  }

  buildWithStatus(): { response: ApiResponse<T>; status: number } {
    const response = this.build()
    const status = this.httpStatus || (response.success ? 200 : errorCodeToHttpStatus(response.error.code))
    return { response, status }
  }
}

/**
 * Helper to create a response builder
 */
export function createResponse<T = any>(): ResponseBuilder<T> {
  return new ResponseBuilder<T>()
}

export default {
  successResponse,
  errorResponse,
  httpStatusToErrorCode,
  errorCodeToHttpStatus,
  buildErrorResponse,
  createResponse,
  ApiErrorCode
}
