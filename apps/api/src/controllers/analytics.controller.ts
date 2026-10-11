import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analytics.service';
import { Task } from '../models/Task';
import mongoose from 'mongoose';

export class AnalyticsController {
  async getOverview(req: AuthRequest, res: Response) {
    const metrics = await analyticsService.getWorkspaceOverview(req.workspaceId!);
    return res.status(200).json({ success: true, data: metrics });
  }

  async getCompletionTrend(req: AuthRequest, res: Response) {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 14;
    const trend = await analyticsService.getTaskCompletionTrend(req.workspaceId!, days);
    return res.status(200).json({ success: true, data: trend });
  }

  async getTeamPerformance(req: AuthRequest, res: Response) {
    const performance = await analyticsService.getTeamPerformance(req.workspaceId!);
    return res.status(200).json({ success: true, data: performance });
  }

  async getTaskDistribution(req: AuthRequest, res: Response) {
    const wsId = new mongoose.Types.ObjectId(req.workspaceId);

    const [statusDist, priorityDist] = await Promise.all([
      Task.aggregate([{ $match: { workspaceId: wsId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: { workspaceId: wsId } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    ]);

    const statusMap: Record<string, number> = { Todo: 0, 'In Progress': 0, Blocked: 0, Done: 0 };
    statusDist.forEach((item) => {
      if (item._id) statusMap[item._id] = item.count;
    });

    const priorityMap: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    priorityDist.forEach((item) => {
      if (item._id) priorityMap[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        statusDistribution: statusMap,
        priorityDistribution: priorityMap,
      },
    });
  }
}

export const analyticsController = new AnalyticsController();
