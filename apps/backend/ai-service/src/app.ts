import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AiServiceConfig } from './config';
import { AuthenticatedRequest, requireAuth } from './middleware/auth.middleware';
import aiRoutes from './routes/ai.routes';
import { createLogger } from './utils/logger';

const logger = createLogger('ai-service');

export const createApp = (config: AiServiceConfig): Application => {
  const app: Application = express();

  app.use(helmet());
  // Only the listed origins get CORS headers; an empty list blocks every
  // cross-origin browser request.
  app.use(cors({ origin: config.corsOrigins.length > 0 ? config.corsOrigins : false }));

  // Keyed by the verified user, not the IP: users behind one NAT or behind
  // the gateway do not share a budget, and one user cannot reset theirs by
  // switching IPs. The IP fallback only applies if this limiter is ever
  // mounted without requireAuth in front of it.
  const aiLimiter = rateLimit({
    windowMs: config.aiRateLimit.windowMs,
    max: config.aiRateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const user = (req as AuthenticatedRequest).user;
      return user ? `user:${user.userId}` : `ip:${req.ip}`;
    },
    message: { success: false, error: 'Too many AI requests. Try again later.' },
  });

  // Every /api/ai route can spend the OpenAI or Cohere key, so none of them
  // is public. Auth runs before the body is parsed, so anonymous callers
  // cannot make the service read even a capped body.
  app.use(
    '/api/ai',
    requireAuth(config.jwtSecret),
    aiLimiter,
    express.json({ limit: config.maxBodyBytes }),
    aiRoutes
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ai-service' });
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // Express identifies error-handling middleware by arity, so the fourth
  // parameter must stay even though it is unused. body-parser errors carry a
  // 4xx status (413 for an oversized body, 400 for malformed JSON).
  app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
    const status =
      typeof err.status === 'number' && err.status >= 400 && err.status < 500 ? err.status : 500;
    if (status === 500) {
      logger.error('Error:', err);
    }
    res.status(status).json({
      success: false,
      error:
        status === 413
          ? `Request body is larger than ${config.maxBodyBytes} bytes`
          : status === 500
            ? 'Internal server error'
            : 'Bad request',
    });
  });

  return app;
};
