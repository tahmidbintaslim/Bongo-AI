import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AiServiceConfig } from './config';
import { requireAuth } from './middleware/auth.middleware';
import aiRoutes from './routes/ai.routes';

export const createApp = (config: AiServiceConfig): Application => {
  const app: Application = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Every /api/ai route can spend the OpenAI or Cohere key, so none of them
  // is public.
  app.use('/api/ai', requireAuth(config.jwtSecret), aiRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ai-service' });
  });

  return app;
};
