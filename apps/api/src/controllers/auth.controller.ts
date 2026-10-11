import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Workspace } from '../models/Workspace';
import { Membership } from '../models/Membership';
import { RegisterSchema, LoginSchema } from '@flowpilot/shared';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response) {
    const validated = RegisterSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email address is already registered.' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const user = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      passwordHash,
      emailVerified: true,
    });

    // Auto-create initial workspace
    const workspaceName = validated.workspaceName || `${validated.name}'s Workspace`;
    const slug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const workspace = await Workspace.create({
      name: workspaceName,
      slug,
      ownerId: user._id,
    });

    const membership = await Membership.create({
      workspaceId: workspace._id,
      userId: user._id,
      role: 'Owner',
      department: 'Executive',
    });

    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
        workspace: {
          ...workspace.toJSON(),
          userRole: membership.role,
        },
      },
    });
  }

  async login(req: Request, res: Response) {
    const validated = LoginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Get user's primary or latest workspace
    const memberships = await Membership.find({ userId: user._id }).populate('workspaceId');
    const primaryMembership = memberships[0];

    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    let primaryWorkspace = null;
    if (primaryMembership && primaryMembership.workspaceId) {
      const ws = primaryMembership.workspaceId as any;
      primaryWorkspace = {
        ...ws.toJSON(),
        userRole: primaryMembership.role,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
        workspace: primaryWorkspace,
        workspaces: memberships.map((m: any) => ({
          ...m.workspaceId.toJSON(),
          userRole: m.role,
        })),
      },
    });
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('token');
    return res.status(200).json({ success: true, message: 'Successfully logged out.' });
  }

  async getMe(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const memberships = await Membership.find({ userId: req.user._id }).populate('workspaceId');

    return res.status(200).json({
      success: true,
      data: {
        user: req.user.toJSON(),
        workspaces: memberships.map((m: any) => ({
          ...m.workspaceId.toJSON(),
          userRole: m.role,
        })),
      },
    });
  }
}

export const authController = new AuthController();
