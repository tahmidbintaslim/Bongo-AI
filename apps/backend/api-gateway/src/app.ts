import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { GatewayConfig } from './config';

export const createApp = (config: GatewayConfig): Application => {
  const app: Application = express();

  app.use(helmet());
  // Only the listed origins get CORS headers; an empty list blocks every
  // cross-origin browser request.
  app.use(cors({ origin: config.corsOrigins.length > 0 ? config.corsOrigins : false }));
  // Known issue: parsing the body here consumes it, so proxied POST and PUT
  // requests hang (http-proxy-middleware v2 needs fixRequestBody or no body
  // parser). GET requests work. Call the services directly until the gateway
  // is reworked; see the README.
  app.use(express.json());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);

  // Proxy routes
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: config.services.auth,
      changeOrigin: true,
      pathRewrite: { '^/api/auth': '/api/auth' },
    })
  );

  app.use(
    '/api/content',
    createProxyMiddleware({
      target: config.services.content,
      changeOrigin: true,
      pathRewrite: { '^/api/content': '/api/content' },
    })
  );

  app.use(
    '/api/ai',
    createProxyMiddleware({
      target: config.services.ai,
      changeOrigin: true,
      pathRewrite: { '^/api/ai': '/api/ai' },
    })
  );

  app.use(
    '/api/analytics',
    createProxyMiddleware({
      target: config.services.analytics,
      changeOrigin: true,
      pathRewrite: { '^/api/analytics': '/api/analytics' },
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  return app;
};
