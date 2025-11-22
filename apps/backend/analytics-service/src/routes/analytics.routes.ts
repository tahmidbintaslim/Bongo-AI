import { Router, type Router as ExpressRouter } from 'express';
import {
  trackEvent,
  getEvents,
  getUserStats,
  getAggregateStats,
} from '../controllers/analytics.controller';
import { validate } from '../middleware/validation.middleware';
import { eventSchema } from '../schemas/analytics.schema';
import { z } from 'zod';

const router: ExpressRouter = Router();

router.post(
  '/events',
  validate(z.object({ body: eventSchema })),
  trackEvent
);

router.get('/events', getEvents);

router.get('/stats/user/:userId', getUserStats);

router.get('/stats/aggregate', getAggregateStats);

export default router;
