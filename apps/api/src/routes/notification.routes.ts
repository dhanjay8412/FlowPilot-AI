import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';

const router = Router();

router.use(authenticate, requireWorkspace);

router.get('/', (req, res, next) => notificationController.getNotifications(req, res).catch(next));
router.patch('/:notificationId/read', (req, res, next) => notificationController.markAsRead(req, res).catch(next));
router.post('/read-all', (req, res, next) => notificationController.markAllAsRead(req, res).catch(next));

export default router;
