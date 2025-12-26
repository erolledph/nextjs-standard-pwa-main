/**
 * Centralized API error handling
 * Provides consistent error responses across all API routes
 */

import { NextResponse } from 'next/server'
import logger from '@/lib/logger-pino'

export interface ApiErrorResponse {
  error: string
  details?: string | string[]
  code?: string
  requestId?: string
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Handle API errors with consistent response format
 */
export function handleApiError(
  error: unknown,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const isProduction = process.env.NODE_ENV === 'production'

  if (error instanceof ApiError) {
    const response: ApiErrorResponse = {
      error: error.message,
      code: error.code,
      requestId,
    }

    logger.warn('API Error', {
      status: error.statusCode,
      code: error.code,
      message: error.message,
      requestId,
    })

    return NextResponse.json(response, { status: error.statusCode })
  }

  if (error instanceof SyntaxError) {
    logger.error('Request parsing error', {
      error: error.message,
      requestId,
    })

    return NextResponse.json(
      {
        error: 'Invalid request format',
        code: 'INVALID_JSON',
        requestId,
      },
      { status: 400 }
    )
  }

  // Handle Firebase/Firestore errors
  if (error instanceof Error && error.message.includes('firebase')) {
    logger.error('Database error', {
      error: error.message,
      requestId,
    })

    return NextResponse.json(
      {
        error: isProduction
          ? 'Database operation failed'
          : error.message,
        code: 'DATABASE_ERROR',
        requestId,
      },
      { status: 500 }
    )
  }

  // Generic error handling
  if (error instanceof Error) {
    logger.error('Unexpected error', {
      error: error.message,
      stack: error.stack,
      requestId,
    })

    return NextResponse.json(
      {
        error: isProduction
          ? 'An unexpected error occurred'
          : error.message,
        code: 'INTERNAL_ERROR',
        requestId,
      },
      { status: 500 }
    )
  }

  // Unknown error
  logger.error('Unknown error type', {
    error: String(error),
    requestId,
  })

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      requestId,
    },
    { status: 500 }
  )
}

/**
 * Validate required fields in request
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`${field} is required`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate field types
 */
export function validateFieldTypes(
  data: Record<string, any>,
  schema: Record<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const [field, expectedType] of Object.entries(schema)) {
    if (data[field] === undefined || data[field] === null) continue

    const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field]

    if (actualType !== expectedType) {
      errors.push(`${field} must be ${expectedType}, got ${actualType}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
