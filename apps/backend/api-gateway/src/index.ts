import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createLogger } from './utils/logger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;
const logger = createLogger('api-gateway');

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Service endpoints
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const CONTENT_SERVICE = process.env.CONTENT_SERVICE_URL || 'http://localhost:4002';
const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:4003';
const ANALYTICS_SERVICE = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4004';

// Proxy routes
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' },
}));

app.use('/api/content', createProxyMiddleware({
  target: CONTENT_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/content': '/api/content' },
}));

app.use('/api/ai', createProxyMiddleware({
  target: AI_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/api/ai' },
}));

app.use('/api/analytics', createProxyMiddleware({
  target: ANALYTICS_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '/api/analytics' },
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`);
});

export default app;
