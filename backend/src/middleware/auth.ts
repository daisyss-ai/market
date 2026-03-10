import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken, sendError } from '../utils/jwt.ts';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return sendError(res, 401, 'Access token required');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendError(res, 401, 'Invalid or expired token');
  }

  req.user = decoded;
  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `Role required: ${roles.join(' or ')}`);
    }

    next();
  };
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
};
