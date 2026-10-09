import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import TokenBlacklist from '../auth/modules/TokenBlacklist';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  token?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token required.' });
    return;
  }

  // Check if token is blacklisted
  const isBlacklisted = await TokenBlacklist.findOne({ token });
  if (isBlacklisted) {
    res.status(401).json({ message: 'Token has been invalidated (logged out).' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ message: 'Invalid or expired token.' });
      return;
    }
    req.userId = decoded.userId;
    req.token = token;
    next();
  });
};