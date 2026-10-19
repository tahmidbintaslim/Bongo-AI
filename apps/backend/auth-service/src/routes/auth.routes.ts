import { Router, type Router as ExpressRouter } from 'express';
import { getProfile, notImplemented } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { LoginSchema, RegisterSchema } from '../schemas/auth.schema';

export const createAuthRouter = (jwtSecret: string): ExpressRouter => {
  const router = Router();

  // The request contracts stay validated so a future user store only has to
  // replace the handlers.
  router.post('/register', validateRequest(RegisterSchema), notImplemented);
  router.post('/login', validateRequest(LoginSchema), notImplemented);
  router.post('/refresh', notImplemented);
  router.post('/logout', notImplemented);
  router.get('/me', requireAuth(jwtSecret), getProfile);

  return router;
};
