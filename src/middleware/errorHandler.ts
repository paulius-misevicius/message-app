import type { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  status?: number;
}

export default function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}
