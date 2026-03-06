import jwt from 'jsonwebtoken';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
};

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const sendError = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export const sendSuccess = <T>(res: Response, data: T, message: string = 'Success') => {
  res.status(200).json({
    success: true,
    data,
    message,
  });
};

export const sendCreated = <T>(res: Response, data: T, message: string = 'Created') => {
  res.status(201).json({
    success: true,
    data,
    message,
  });
};
