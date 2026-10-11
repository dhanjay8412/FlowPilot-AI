import { Router } from 'express';
import { dailyReportController } from '../controllers/dailyReport.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate, requireWorkspace);

router.get('/', (req, res, next) => dailyReportController.getDailyReports(req, res).catch(next));
router.get('/:date', (req, res, next) => dailyReportController.getReportByDate(req, res).catch(next));
router.post('/generate', aiRateLimiter, (req, res, next) => dailyReportController.generateReport(req, res).catch(next));

export default router;
