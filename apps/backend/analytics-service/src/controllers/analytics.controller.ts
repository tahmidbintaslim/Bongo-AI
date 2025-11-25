import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('analytics-controller');

// In-memory storage for development (replace with time-series database in production)
interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData?: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  metadata?: Record<string, any>;
}

const eventsStore: AnalyticsEvent[] = [];

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: eventData.userId,
      eventType: eventData.eventType,
      eventData: eventData.eventData,
      timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date(),
      sessionId: eventData.sessionId,
      metadata: eventData.metadata,
    };

    eventsStore.push(event);

    logger.info(`Event tracked: ${event.eventType} for user ${event.userId}`);
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    logger.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event',
    });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { userId, eventType, startDate, endDate, limit = 100 } = req.query;
    
    let events = [...eventsStore];

    // Apply filters
    if (userId) {
      events = events.filter(e => e.userId === userId);
    }
    if (eventType) {
      events = events.filter(e => e.eventType === eventType);
    }
    if (startDate) {
      const start = new Date(startDate as string);
      events = events.filter(e => e.timestamp >= start);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      events = events.filter(e => e.timestamp <= end);
    }

    // Limit results
    const limitNum = parseInt(limit as string);
    events = events.slice(-limitNum);

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    logger.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
    });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const userEvents = eventsStore.filter(e => e.userId === userId);
    
    // Calculate stats
    const eventTypes = new Map<string, number>();
    userEvents.forEach(event => {
      eventTypes.set(event.eventType, (eventTypes.get(event.eventType) || 0) + 1);
    });

    const stats = {
      userId,
      totalEvents: userEvents.length,
      eventBreakdown: Object.fromEntries(eventTypes),
      firstEvent: userEvents[0]?.timestamp,
      lastEvent: userEvents[userEvents.length - 1]?.timestamp,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
    });
  }
};

export const getAggregateStats = async (req: Request, res: Response) => {
  try {
    const eventTypes = new Map<string, number>();
    const userCounts = new Map<string, number>();

    eventsStore.forEach(event => {
      eventTypes.set(event.eventType, (eventTypes.get(event.eventType) || 0) + 1);
      userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
    });

    const stats = {
      totalEvents: eventsStore.length,
      totalUsers: userCounts.size,
      eventBreakdown: Object.fromEntries(eventTypes),
      topUsers: Array.from(userCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, eventCount: count })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching aggregate stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch aggregate stats',
    });
  }
};
