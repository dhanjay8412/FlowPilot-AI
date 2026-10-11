import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUserDocument } from '../models/User';
import { Membership, IMembershipDocument } from '../models/Membership';

export interface AuthRequest extends Request {
  user?: IUserDocument;
  membership?: IMembershipDocument;
  workspaceId?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // Check cookie or authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user || user.status === 'suspended') {
      return res.status(401).json({ success: false, message: 'User account is invalid or suspended.' });
    }

    req.user = user;

    // Optional workspace header
    const targetWorkspaceId = req.headers['x-workspace-id'] as string;
    if (targetWorkspaceId) {
      const membership = await Membership.findOne({ workspaceId: targetWorkspaceId, userId: user._id });
      if (membership) {
        req.membership = membership;
        req.workspaceId = targetWorkspaceId;
      }
    }

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}
