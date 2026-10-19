// Load .env before any other module reads process.env.
import 'dotenv/config';
import { createApp } from './app';
import { loadConfig } from './config';
import { ConfigError } from './utils/env';
import { createLogger } from './utils/logger';

const logger = createLogger('api-gateway');

const start = () => {
  let config;
  try {
    config = loadConfig(process.env);
  } catch (error) {
    if (error instanceof ConfigError) {
      logger.error(`Refusing to start: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }

  if (config.corsOrigins.length === 0) {
    logger.warn('CORS_ORIGINS is empty, so browsers on other origins cannot call this service.');
  }

  createApp(config).listen(config.port, () => {
    logger.info(`API Gateway listening on port ${config.port}`);
  });
};

start();
