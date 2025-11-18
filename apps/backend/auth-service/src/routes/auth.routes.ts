import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { LoginSchema, RegisterSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(RegisterSchema), authController.register);
router.post('/login', validateRequest(LoginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authController.getProfile);

export default router;
