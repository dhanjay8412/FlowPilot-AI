import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type Role = 'Owner' | 'Admin' | 'Manager' | 'Member';

const roleHierarchy: Record<Role, number> = {
  Owner: 4,
  Admin: 3,
  Manager: 2,
  Member: 1,
};

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.membership) {
      return res.status(403).json({ success: false, message: 'Workspace membership context missing' });
    }

    const userRole = req.membership.role as Role;
    const userRoleLevel = roleHierarchy[userRole] || 0;

    const hasPermission = allowedRoles.some((role) => userRoleLevel >= roleHierarchy[role]);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Requires one of roles: ${allowedRoles.join(', ')}. Current role: ${userRole}`,
      });
    }

    return next();
  };
}
