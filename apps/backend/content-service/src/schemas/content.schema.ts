import { z } from 'zod';

export const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  body: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language: z.enum(['bn', 'en']).default('bn'),
  metadata: z.record(z.any()).optional(),
});

export const updateContentSchema = createContentSchema.partial();

export const contentQuerySchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language: z.enum(['bn', 'en']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});
