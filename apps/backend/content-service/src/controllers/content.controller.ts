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

export const listContent = async (req: Request, res: Response) => {
  try {
    const { category, tags, level, language, search, page = 1, limit = 20 } = req.query;
    
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
    if (tags && Array.isArray(tags)) {
      contents = contents.filter(c => 
        c.tags?.some(tag => tags.includes(tag))
      );
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      contents = contents.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.body.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
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
