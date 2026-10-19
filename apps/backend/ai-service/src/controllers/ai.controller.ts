import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { RAGService } from '../services/rag.service';
import { VectorStoreService } from '../services/vector-store.service';
import { createLogger } from '../utils/logger';

const logger = createLogger('ai-controller');
const ragService = new RAGService();
const vectorStoreService = new VectorStoreService();

export class AIController {
  async query(req: Request, res: Response) {
    try {
      const { query, language = 'bn' } = req.body;
      // Trust the verified token, not a userId field in the body.
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Query is required',
        });
      }

      logger.info(`AI query from user ${userId}: ${query.substring(0, 50)}...`);

      // Search for relevant documents
      const documents = await vectorStoreService.search(query, language);

      // Generate response using RAG
      const response = await ragService.generateResponse({
        query,
        documents,
        language,
      });

      res.json({
        success: true,
        data: {
          response,
          sources: documents.map(doc => ({
            id: doc.id,
            title: doc.metadata.title,
            relevance: doc.metadata.score,
          })),
        },
      });
    } catch (error) {
      logger.error('Query error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process query',
      });
    }
  }

  async embed(req: Request, res: Response) {
    try {
      const { text } = req.body;

      // A string only: an array would be embedded as a batch, multiplying
      // the provider cost of one rate-limited request.
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Text is required',
        });
      }

      const embedding = await ragService.createEmbedding(text);

      res.json({
        success: true,
        data: {
          embedding,
          dimensions: embedding.length,
        },
      });
    } catch (error) {
      logger.error('Embedding error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create embedding',
      });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { query, language = 'bn', limit = 10 } = req.body;

      if (typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Query is required',
        });
      }

      const results = await vectorStoreService.search(query, language, limit);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      logger.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
      });
    }
  }
}
