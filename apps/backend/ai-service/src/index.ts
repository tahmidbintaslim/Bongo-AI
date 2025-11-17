import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createLogger } from './utils/logger';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4003;
const logger = createLogger('ai-service');

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service' });
});

app.listen(PORT, () => {
  logger.info(`AI service listening on port ${PORT}`);
});

export default app;
