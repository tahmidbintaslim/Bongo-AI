import { Router, type Router as ExpressRouter } from 'express';
import {
  createContent,
  getContent,
  listContent,
  updateContent,
  deleteContent,
} from '../controllers/content.controller';
import { validate } from '../middleware/validation.middleware';
import { createContentSchema, updateContentSchema } from '../schemas/content.schema';
import { z } from 'zod';

const router: ExpressRouter = Router();

router.post(
  '/',
  validate(z.object({ body: createContentSchema })),
  createContent
);

router.get('/', listContent);

router.get('/:id', getContent);

router.put(
  '/:id',
  validate(z.object({ body: updateContentSchema })),
  updateContent
);

router.delete('/:id', deleteContent);

export default router;
