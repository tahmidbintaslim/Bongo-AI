import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// There is no user store yet: nothing connects to Postgres or Redis. Until one
// exists this service must not accept passwords or mint tokens, so every
// account endpoint answers 501 and only /me (which reads a verified token)
// works.
export const NOT_IMPLEMENTED_MESSAGE =
  'Accounts are not implemented yet. There is no user store, so this service cannot register users, check passwords, issue or refresh tokens, or revoke them. See the Authentication section of the README.';

export const notImplemented = (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented',
    message: NOT_IMPLEMENTED_MESSAGE,
  });
};

// Returns the claims of the verified access token. There is no user record to
// look up, so name and locale are not available.
export const getProfile = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: (req as AuthenticatedRequest).user,
  });
};
