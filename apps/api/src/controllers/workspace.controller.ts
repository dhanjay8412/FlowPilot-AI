import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Workspace } from '../models/Workspace';
import { Membership } from '../models/Membership';
import { User } from '../models/User';
import { CreateWorkspaceSchema, UpdateWorkspaceSchema, AddMemberSchema, UpdateMemberRoleSchema } from '@flowpilot/shared';

export class WorkspaceController {
  async listWorkspaces(req: AuthRequest, res: Response) {
    const memberships = await Membership.find({ userId: req.user!._id }).populate('workspaceId');
    const workspaces = memberships.map((m: any) => ({
      ...m.workspaceId.toJSON(),
      userRole: m.role,
    }));
    return res.status(200).json({ success: true, data: workspaces });
  }

  async createWorkspace(req: AuthRequest, res: Response) {
    const validated = CreateWorkspaceSchema.parse(req.body);
    const slug = `${validated.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const workspace = await Workspace.create({
      name: validated.name,
      slug,
      ownerId: req.user!._id,
    });

    const membership = await Membership.create({
      workspaceId: workspace._id,
      userId: req.user!._id,
      role: 'Owner',
      department: 'Management',
    });

    return res.status(201).json({
      success: true,
      data: {
        ...workspace.toJSON(),
        userRole: membership.role,
      },
    });
  }

  async getWorkspaceDetails(req: AuthRequest, res: Response) {
    const workspace = await Workspace.findById(req.workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const memberCount = await Membership.countDocuments({ workspaceId: workspace._id });

    return res.status(200).json({
      success: true,
      data: {
        ...workspace.toJSON(),
        memberCount,
        userRole: req.membership!.role,
      },
    });
  }

  async updateWorkspace(req: AuthRequest, res: Response) {
    const validated = UpdateWorkspaceSchema.parse(req.body);
    const workspace = await Workspace.findById(req.workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (validated.name) workspace.name = validated.name;
    if (validated.settings) {
      workspace.settings = { ...workspace.settings, ...validated.settings };
    }

    await workspace.save();

    return res.status(200).json({ success: true, data: workspace.toJSON() });
  }

  async getMembers(req: AuthRequest, res: Response) {
    const memberships = await Membership.find({ workspaceId: req.workspaceId }).populate('userId', 'name email status createdAt');

    const formatted = memberships.map((m: any) => ({
      id: m._id.toString(),
      workspaceId: m.workspaceId.toString(),
      userId: m.userId._id.toString(),
      role: m.role,
      department: m.department || 'General',
      joinedAt: m.joinedAt,
      user: m.userId.toJSON(),
    }));

    return res.status(200).json({ success: true, data: formatted });
  }

  async addMember(req: AuthRequest, res: Response) {
    const validated = AddMemberSchema.parse(req.body);

    let targetUser = await User.findOne({ email: validated.email.toLowerCase() });

    if (!targetUser) {
      // Create invited user record
      targetUser = await User.create({
        name: validated.email.split('@')[0],
        email: validated.email.toLowerCase(),
        passwordHash: 'INVITED_NO_PASSWORD',
        status: 'invited',
      });
    }

    const existingMembership = await Membership.findOne({
      workspaceId: req.workspaceId,
      userId: targetUser._id,
    });

    if (existingMembership) {
      return res.status(409).json({ success: false, message: 'User is already a member of this workspace.' });
    }

    const membership = await Membership.create({
      workspaceId: req.workspaceId,
      userId: targetUser._id,
      role: validated.role,
      department: validated.department || 'General',
    });

    return res.status(201).json({
      success: true,
      data: {
        id: membership._id.toString(),
        workspaceId: membership.workspaceId.toString(),
        userId: targetUser._id.toString(),
        role: membership.role,
        department: membership.department,
        joinedAt: membership.joinedAt,
        user: targetUser.toJSON(),
      },
    });
  }

  async updateMemberRole(req: AuthRequest, res: Response) {
    const { membershipId } = req.params;
    const validated = UpdateMemberRoleSchema.parse(req.body);

    const membership = await Membership.findOne({
      _id: membershipId,
      workspaceId: req.workspaceId,
    }).populate('userId', 'name email');

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Workspace membership record not found.' });
    }

    membership.role = validated.role;
    if (validated.department) membership.department = validated.department;
    await membership.save();

    return res.status(200).json({ success: true, data: membership.toJSON() });
  }

  async removeMember(req: AuthRequest, res: Response) {
    const { membershipId } = req.params;

    const membership = await Membership.findOne({
      _id: membershipId,
      workspaceId: req.workspaceId,
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    if (membership.role === 'Owner') {
      return res.status(400).json({ success: false, message: 'Cannot remove the primary workspace Owner.' });
    }

    await membership.deleteOne();

    return res.status(200).json({ success: true, message: 'Member successfully removed from workspace.' });
  }
}

export const workspaceController = new WorkspaceController();
