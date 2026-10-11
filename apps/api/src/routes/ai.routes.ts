import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate, requireWorkspace, aiRateLimiter);

router.post('/classify-task', (req, res, next) => aiController.classifyTask(req, res).catch(next));
router.post('/summarize-meeting', (req, res, next) => aiController.summarizeMeeting(req, res).catch(next));
router.post('/generate-daily-report', (req, res, next) => aiController.generateDailyReport(req, res).catch(next));

export default router;
