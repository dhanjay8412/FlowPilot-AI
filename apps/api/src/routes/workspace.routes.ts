import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace } from '../middleware/tenant';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => workspaceController.listWorkspaces(req, res).catch(next));
router.post('/', (req, res, next) => workspaceController.createWorkspace(req, res).catch(next));

router.get('/:workspaceId', requireWorkspace, (req, res, next) => workspaceController.getWorkspaceDetails(req, res).catch(next));
router.patch('/:workspaceId', requireWorkspace, requireRole(['Owner', 'Admin']), (req, res, next) => workspaceController.updateWorkspace(req, res).catch(next));

router.get('/:workspaceId/members', requireWorkspace, (req, res, next) => workspaceController.getMembers(req, res).catch(next));
router.post('/:workspaceId/members', requireWorkspace, requireRole(['Owner', 'Admin']), (req, res, next) => workspaceController.addMember(req, res).catch(next));
router.patch('/:workspaceId/members/:membershipId', requireWorkspace, requireRole(['Owner', 'Admin']), (req, res, next) => workspaceController.updateMemberRole(req, res).catch(next));
router.delete('/:workspaceId/members/:membershipId', requireWorkspace, requireRole(['Owner', 'Admin']), (req, res, next) => workspaceController.removeMember(req, res).catch(next));

export default router;
