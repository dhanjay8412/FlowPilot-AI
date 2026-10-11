import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { Membership } from '../models/Membership';

export async function requireWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const workspaceId =
      (req.params.workspaceId as string) ||
      (req.headers['x-workspace-id'] as string) ||
      (req.query.workspaceId as string);

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Workspace ID header (X-Workspace-ID) or parameter is required' });
    }

    const membership = await Membership.findOne({
      workspaceId,
      userId: req.user._id,
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this workspace.' });
    }

    req.workspaceId = workspaceId;
    req.membership = membership;
    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify workspace membership' });
  }
}
