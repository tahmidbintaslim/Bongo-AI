import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createLogger } from './utils/logger';
import contentRoutes from './routes/content.routes';
import { ServiceConfig } from './config';
import { requireAuth } from './middleware/auth.middleware';

const logger = createLogger('content-service');

export const createApp = (config: ServiceConfig): Application => {
  const app: Application = express();

  // Middleware
  app.use(helmet());
  // Only the listed origins get CORS headers; an empty list blocks every
  // cross-origin browser request.
  app.use(cors({ origin: config.corsOrigins.length > 0 ? config.corsOrigins : false }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

  // Routes
  app.use('/api/content', requireAuth(config.jwtSecret), contentRoutes);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'content-service' });
  });

  // Error handling
  // Express identifies error-handling middleware by arity, so the fourth
  // parameter must stay even though it is unused. Underscore-prefixed to
  // satisfy no-unused-vars without changing the signature.
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  return app;
};
