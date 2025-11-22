import { z } from 'zod';

export const eventSchema = z.object({
  userId: z.string().min(1),
  eventType: z.string().min(1),
  eventData: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const queryAnalyticsSchema = z.object({
  userId: z.string().optional(),
  eventType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().max(1000).optional(),
});
