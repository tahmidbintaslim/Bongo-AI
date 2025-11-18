import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();
const aiController = new AIController();

router.post('/query', aiController.query);
router.post('/embed', aiController.embed);
router.post('/search', aiController.search);

export default router;
