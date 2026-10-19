// Load .env before any other module reads process.env (the AI and vector
// store clients read their keys when they are constructed).
import 'dotenv/config';
import { createApp } from './app';
import { loadConfig } from './config';
import { ConfigError } from './utils/env';
import { createLogger } from './utils/logger';

const logger = createLogger('ai-service');

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

  createApp(config).listen(config.port, () => {
    logger.info(`AI service listening on port ${config.port}`);
  });
};

start();
