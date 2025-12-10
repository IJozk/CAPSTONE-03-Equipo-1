/**
 * Clases de error personalizadas para manejo consistente de errores
 */

/**
 * Error base para todos los errores de la aplicación
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error de validación (400 Bad Request)
 */
export class ValidationError extends AppError {
  public readonly field?: string
  public readonly details?: any

  constructor(message: string, field?: string, details?: any) {
    super(message, 400)
    this.field = field
    this.details = details
  }
}

/**
 * Error de recurso no encontrado (404 Not Found)
 */
export class NotFoundError extends AppError {
  public readonly resource: string

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} con identificador '${identifier}' no encontrado`
      : `${resource} no encontrado`

    super(message, 404)
    this.resource = resource
  }
}

/**
 * Error de conflicto de datos (409 Conflict)
 */
export class ConflictError extends AppError {
  public readonly conflictType: string

  constructor(message: string, conflictType: string = 'duplicate') {
    super(message, 409)
    this.conflictType = conflictType
  }
}

/**
 * Error de autorización (403 Forbidden)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'No tiene permisos para realizar esta acción') {
    super(message, 403)
  }
}

/**
 * Error de autenticación (401 Unauthorized)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 401)
  }
}

/**
 * Error de regla de negocio (422 Unprocessable Entity)
 */
export class BusinessRuleError extends AppError {
  public readonly rule: string

  constructor(message: string, rule: string) {
    super(message, 422)
    this.rule = rule
  }
}

/**
 * Helper para crear errores de validación de campos
 */
export function createFieldValidationError(field: string, message: string): ValidationError {
  return new ValidationError(`${field}: ${message}`, field)
}

/**
 * Helper para formatear respuesta de error
 */
export function formatErrorResponse(error: AppError | Error) {
  if (error instanceof AppError) {
    const response: any = {
      error: error.message,
      statusCode: error.statusCode
    }

    // Agregar información adicional según el tipo de error
    if (error instanceof ValidationError) {
      if (error.field) response.field = error.field
      if (error.details) response.details = error.details
    } else if (error instanceof NotFoundError) {
      response.resource = error.resource
    } else if (error instanceof ConflictError) {
      response.conflictType = error.conflictType
    } else if (error instanceof BusinessRuleError) {
      response.rule = error.rule
    }

    return response
  }

  // Error genérico
  return {
    error: 'Error interno del servidor',
    statusCode: 500,
    message: error.message
  }
}
