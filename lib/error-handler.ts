import { NextResponse } from 'next/server'

/**
 * Unified error handling and response system for the API
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public field?: string) {
    super(400, message, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(403, message, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not found') {
    super(404, message, 'NOT_FOUND')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(409, message, 'CONFLICT')
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT')
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', public originalError?: Error) {
    super(500, message, 'INTERNAL_ERROR')
  }
}

/**
 * Format error response with consistent structure
 */
export function formatErrorResponse(error: any) {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      code: error.code,
      field: (error as ValidationError).field,
      details: error.details,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    console.error('[v0] Unhandled error:', error)
    return {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    }
  }

  return {
    error: String(error),
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  }
}

/**
 * Safely wrap API handler with error handling
 */
export function handleApiError(error: any): NextResponse {
  const formatted = formatErrorResponse(error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code, ...(error.details && { details: error.details }) },
      { status: error.statusCode }
    )
  }

  // Log unhandled errors
  if (error instanceof Error) {
    console.error('[v0] Unhandled API error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
  }

  return NextResponse.json(
    { error: formatted.error, code: formatted.code },
    { status: formatted.statusCode }
  )
}

/**
 * Validate required fields in request
 */
export function validateRequired(data: any, ...fields: string[]) {
  const missing = fields.filter(field => !data[field] || (typeof data[field] === 'string' && !data[field].trim()))

  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`)
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate strong password
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) errors.push('Password must be at least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number')
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain a special character (!@#$%^&*)')

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: any, fieldName: string = 'Value'): number {
  const num = Number(value)
  if (isNaN(num) || num <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`)
  }
  return num
}

/**
 * Sanitize string input to prevent injection
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return String(input)
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000) // Limit length
}

/**
 * Validate array is not empty
 */
export function validateArray(arr: any, fieldName: string = 'Array'): any[] {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`)
  }
  return arr
}

/**
 * Validate enum value
 */
export function validateEnum(value: any, validValues: any[], fieldName: string = 'Value'): any {
  if (!validValues.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${validValues.join(', ')}`)
  }
  return value
}

/**
 * Validate price in cents
 */
export function validatePrice(priceCents: any): number {
  const price = validatePositiveNumber(priceCents, 'Price')
  if (!Number.isInteger(price)) {
    throw new ValidationError('Price must be in cents (integer)')
  }
  return price
}

/**
 * Create audit log for errors
 */
export async function logError(
  userId: string | null,
  action: string,
  error: Error | string,
  details?: any
) {
  try {
    const { sql } = await import('@/lib/neon/server')
    
    await sql`
      INSERT INTO error_logs (user_id, action, error_message, details, created_at)
      VALUES (
        ${userId},
        ${action},
        ${error instanceof Error ? error.message : String(error)},
        ${JSON.stringify(details || {})},
        NOW()
      )
    `
  } catch (logError) {
    console.error('[v0] Failed to log error:', logError)
  }
}

/**
 * Centralized error response handler for API routes
 */
export async function apiHandler<T>(
  handler: () => Promise<T>,
  onError?: (error: ApiError) => void
): Promise<NextResponse> {
  try {
    const result = await handler()
    return NextResponse.json(result)
  } catch (error) {
    if (onError && error instanceof ApiError) {
      onError(error)
    }
    return handleApiError(error)
  }
}
