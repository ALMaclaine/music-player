import { NextApiRequest, NextApiResponse } from 'next';
import winston from 'winston';

// Create a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (err: Error | AppError, res: NextApiResponse) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, { statusCode: err.statusCode, stack: err.stack });
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  logger.error('Unexpected error:', { error: err, stack: err.stack });
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
  });
};

type AsyncApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;

export const asyncHandler = (fn: AsyncApiHandler): AsyncApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await fn(req, res);
    } catch (err) {
      handleError(err as Error, res);
    }
  };
};

type LogMeta = Record<string, unknown>;

export const logInfo = (message: string, meta?: LogMeta) => {
  logger.info(message, meta);
};

export const logWarning = (message: string, meta?: LogMeta) => {
  logger.warn(message, meta);
};

export const logError = (message: string, meta?: LogMeta) => {
  logger.error(message, meta);
};