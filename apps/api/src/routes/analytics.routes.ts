import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';

const router = Router();

router.use(authenticate, requireWorkspace);

router.get('/overview', (req, res, next) => analyticsController.getOverview(req, res).catch(next));
router.get('/task-completion', (req, res, next) => analyticsController.getCompletionTrend(req, res).catch(next));
router.get('/team-performance', (req, res, next) => analyticsController.getTeamPerformance(req, res).catch(next));
router.get('/task-distribution', (req, res, next) => analyticsController.getTaskDistribution(req, res).catch(next));

export default router;
