import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate, requireWorkspace);

router.get('/', (req, res, next) => meetingController.listMeetings(req, res).catch(next));
router.post('/', (req, res, next) => meetingController.createMeeting(req, res).catch(next));
router.post('/summarize', aiRateLimiter, (req, res, next) => meetingController.summarizeMeeting(req, res).catch(next));

router.get('/:meetingId', (req, res, next) => meetingController.getMeeting(req, res).catch(next));
router.delete('/:meetingId', (req, res, next) => meetingController.deleteMeeting(req, res).catch(next));

router.post('/:meetingId/action-items/:itemId/create-task', (req, res, next) => meetingController.convertActionItemToTask(req, res).catch(next));

export default router;
