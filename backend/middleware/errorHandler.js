import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, _next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' && !err.isOperational && { stack: err.stack }),
  });
};
