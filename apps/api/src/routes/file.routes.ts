import { Router } from 'express';
import { fileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';

const router = Router();

router.use(authenticate, requireWorkspace);

router.post('/upload', (req, res, next) => fileController.uploadFile(req, res).catch(next));
router.get('/:fileId/download', (req, res, next) => fileController.getFileDownload(req, res).catch(next));

export default router;
