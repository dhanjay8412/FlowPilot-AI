import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';

const router = Router();

router.use(authenticate, requireWorkspace);

router.get('/', (req, res, next) => taskController.listTasks(req, res).catch(next));
router.post('/', (req, res, next) => taskController.createTask(req, res).catch(next));

router.get('/:taskId', (req, res, next) => taskController.getTask(req, res).catch(next));
router.patch('/:taskId', (req, res, next) => taskController.updateTask(req, res).catch(next));
router.delete('/:taskId', (req, res, next) => taskController.deleteTask(req, res).catch(next));

router.get('/:taskId/activity', (req, res, next) => taskController.getTaskActivity(req, res).catch(next));
router.get('/:taskId/comments', (req, res, next) => taskController.getComments(req, res).catch(next));
router.post('/:taskId/comments', (req, res, next) => taskController.addComment(req, res).catch(next));

export default router;
