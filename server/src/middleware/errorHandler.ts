import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

/**
 * Centralized Error Handler
 *
 * Professor Note:
 * Without a central error handler, every controller needs its own error logic.
 * With it, you handle all error types in one place consistently.
 *
 * Express identifies error-handling middleware by its 4-parameter signature.
 * The _ before next is TypeScript convention for "required but unused parameter".
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, error.message);

  // Zod validation error — client sent bad data
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.flatten().fieldErrors,
    });
    return;
  }

  // MongoDB bad ID format
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  // Default — internal server error
  // In production: never expose error details to client
  // In development: show message for easier debugging
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
  });
}
