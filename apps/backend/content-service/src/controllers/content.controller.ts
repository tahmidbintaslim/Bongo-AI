import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('content-controller');

// In-memory storage for development (replace with database in production)
interface Content {
  id: string;
  title: string;
  description?: string;
  body: string;
  category: string;
  tags?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  language: 'bn' | 'en';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

const contentStore = new Map<string, Content>();

export const createContent = async (req: Request, res: Response) => {
  try {
    const contentData = req.body;
    const id = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const content: Content = {
      id,
      ...contentData,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: (req as any).user?.id,
    };

    contentStore.set(id, content);

    logger.info(`Content created: ${id}`);
    res.status(201).json({
      success: true,
      data: content,
    });
  } catch (error) {
    logger.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create content',
    });
  }
};

export const getContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = contentStore.get(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    logger.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content',
    });
  }
};

// Express parses ?x[]=1 into an array and ?x[y]=1 into an object, so every
// req.query value is attacker-controlled in TYPE as well as value. A TypeScript
// cast is erased at runtime and guarantees nothing, so narrow before using.
const queryString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const queryStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

const queryInt = (value: unknown, fallback: number, max: number): number => {
  const parsed = Number.parseInt(typeof value === 'string' ? value : '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

export const listContent = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const category = queryString(req.query.category);
    const level = queryString(req.query.level);
    const language = queryString(req.query.language);
    const search = queryString(req.query.search);
    const tags = queryStringArray(req.query.tags);

    let contents = Array.from(contentStore.values());

    // Apply filters
    if (category) {
      contents = contents.filter(c => c.category === category);
    }
    if (level) {
      contents = contents.filter(c => c.level === level);
    }
    if (language) {
      contents = contents.filter(c => c.language === language);
    }
    if (tags.length > 0) {
      contents = contents.filter(c =>
        c.tags?.some(tag => tags.includes(tag))
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      contents = contents.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.body.toLowerCase().includes(searchLower)
      );
    }

    // Pagination. Capping limit also stops ?limit=1e9 from forcing a huge slice.
    const pageNum = queryInt(page, 1, Number.MAX_SAFE_INTEGER);
    const limitNum = queryInt(limit, 20, 100);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedContents = contents.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedContents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: contents.length,
        pages: Math.ceil(contents.length / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error listing content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list content',
    });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const content = contentStore.get(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    const updatedContent: Content = {
      ...content,
      ...updates,
      id: content.id, // Prevent ID from being updated
      createdAt: content.createdAt, // Prevent createdAt from being updated
      updatedAt: new Date(),
    };

    contentStore.set(id, updatedContent);

    logger.info(`Content updated: ${id}`);
    res.json({
      success: true,
      data: updatedContent,
    });
  } catch (error) {
    logger.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update content',
    });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = contentStore.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    logger.info(`Content deleted: ${id}`);
    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete content',
    });
  }
};
