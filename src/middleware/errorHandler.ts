import { Request, Response, NextFunction } from "express";

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[ErrorHandler] Error occurred:`, err);

  // Default error response
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetail = "An unexpected error occurred";

  // Customize based on error type
  if (err.message) {
    errorDetail = err.message;
  }

  // Log stack trace in development
  if (process.env.NODE_ENV !== "production" && err.stack) {
    console.error(`[ErrorHandler] Stack trace:`, err.stack);
  }

  // Send error response
  res.status(statusCode).json({
    error: errorMessage,
    detail: errorDetail,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: "Not Found",
    detail: `The requested endpoint ${req.method} ${req.path} does not exist`,
  });
}; 