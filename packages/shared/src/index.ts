import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['student', 'teacher', 'admin']),
  locale: z.enum(['bn-BD', 'en-US']).default('bn-BD'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Content schemas
export const ContentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['lesson', 'quiz', 'video', 'article']),
  subject: z.string(),
  grade: z.number().min(1).max(12),
  language: z.enum(['bn', 'en']).default('bn'),
  content: z.any(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Content = z.infer<typeof ContentSchema>;

// AI Query schemas
export const AIQuerySchema = z.object({
  query: z.string(),
  userId: z.string().uuid(),
  context: z.record(z.any()).optional(),
  language: z.enum(['bn', 'en']).default('bn'),
});

export type AIQuery = z.infer<typeof AIQuerySchema>;

// Analytics Event schemas
export const AnalyticsEventSchema = z.object({
  eventType: z.string(),
  userId: z.string().uuid().optional(),
  properties: z.record(z.any()),
  timestamp: z.date(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export * from './types';
export * from './utils';
