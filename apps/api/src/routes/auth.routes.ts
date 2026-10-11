import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, (req, res, next) => authController.register(req, res).catch(next));
router.post('/login', authRateLimiter, (req, res, next) => authController.login(req, res).catch(next));
router.post('/logout', (req, res, next) => authController.logout(req, res).catch(next));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res).catch(next));

export default router;
