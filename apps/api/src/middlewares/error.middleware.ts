import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';
import { sendError } from '../utils/response';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path, method: req.method }, 'Server operational error');
    }
    return sendError(res, err.message, err.statusCode, err.name, err.details);
  }

  // Unhandled error
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled internal server error');
  return sendError(res, 'Internal server error', 500, 'INTERNAL_SERVER_ERROR');
}

