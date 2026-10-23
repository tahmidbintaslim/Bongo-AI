import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';

// Verifies "Authorization: Bearer <JWT>" signed with JWT_SECRET (HS256).
// The ai, auth, content and analytics services carry identical copies of this
// file until they merge into one API; change them together.

export interface AuthUser {
  userId: string;
  email?: string;
  role?: string;
}

export type AuthenticatedRequest = Request & { user?: AuthUser };

const BEARER = /^Bearer\s+(\S+)$/i;

const unauthorized = (res: Response, error: string): void => {
  res.setHeader('WWW-Authenticate', 'Bearer');
  res.status(401).json({ success: false, error });
};

export const requireAuth = (jwtSecret: string): RequestHandler => {
  if (!jwtSecret) {
    throw new Error('requireAuth needs a JWT secret');
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const match = typeof header === 'string' ? BEARER.exec(header) : null;
    if (!match) {
      return unauthorized(res, 'Authentication required');
    }

    let payload: string | jwt.JwtPayload;
    try {
      // Pin the algorithm so a token cannot pick its own (for example "none").
      payload = jwt.verify(match[1], jwtSecret, { algorithms: ['HS256'] });
    } catch {
      return unauthorized(res, 'Invalid or expired token');
    }

    // A token without exp would never expire, so it is refused outright.
    if (
      typeof payload !== 'object' ||
      typeof payload.exp !== 'number' ||
      typeof payload.userId !== 'string' ||
      !payload.userId
    ) {
      return unauthorized(res, 'Invalid or expired token');
    }

    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined,
    };
    next();
  };
};
