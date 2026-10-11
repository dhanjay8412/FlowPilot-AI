import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { Membership } from '../models/Membership';
import { AnalyticsOverview } from '@flowpilot/shared';

export class AnalyticsService {
  /**
   * Compute exact workspace KPI metrics directly from MongoDB
   */
  async getWorkspaceOverview(workspaceId: string): Promise<AnalyticsOverview> {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const now = new Date();

    const [statusCounts, overdueCount, completedOnTimeCount, totalCompletedWithDeadline] = await Promise.all([
      // Status breakdown
      Task.aggregate([
        { $match: { workspaceId: wsId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Overdue tasks count
      Task.countDocuments({
        workspaceId: wsId,
        status: { $ne: 'Done' },
        deadline: { $lt: now },
      }),

      // Completed on or before deadline
      Task.countDocuments({
        workspaceId: wsId,
        status: 'Done',
        deadline: { $exists: true, $ne: null },
        $expr: { $lte: ['$completedAt', '$deadline'] },
      }),

      // Total completed that had a deadline
      Task.countDocuments({
        workspaceId: wsId,
        status: 'Done',
        deadline: { $exists: true, $ne: null },
      }),
    ]);

    const countsMap: Record<string, number> = {
      Todo: 0,
      'In Progress': 0,
      Blocked: 0,
      Done: 0,
    };

    statusCounts.forEach((item) => {
      if (item._id) countsMap[item._id] = item.count;
    });

    const completedTasks = countsMap['Done'] || 0;
    const pendingTasks = (countsMap['Todo'] || 0) + (countsMap['In Progress'] || 0) + (countsMap['Blocked'] || 0);
    const totalActiveTasks = pendingTasks;
    const totalAllTasks = completedTasks + pendingTasks;

    const completionRate = totalAllTasks > 0 ? Math.round((completedTasks / totalAllTasks) * 100) : 0;
    const onTimeCompletionRate =
      totalCompletedWithDeadline > 0 ? Math.round((completedOnTimeCount / totalCompletedWithDeadline) * 100) : 100;

    // Productivity score formula: 60% completion rate + 40% on-time completion rate
    const rawScore = 0.6 * completionRate + 0.4 * onTimeCompletionRate;
    const productivityScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    return {
      totalActiveTasks,
      completedTasks,
      pendingTasks,
      overdueTasks: overdueCount,
      completionRate,
      onTimeCompletionRate,
      productivityScore,
    };
  }

  /**
   * Get task completion trend over the last 14 days
   */
  async getTaskCompletionTrend(workspaceId: string, days = 14) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Task.aggregate([
      {
        $match: {
          workspaceId: wsId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trends.map((t) => ({
      date: t._id,
      created: t.created,
      completed: t.completed,
    }));
  }

  /**
   * Get team performance & workload breakdown
   */
  async getTeamPerformance(workspaceId: string) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);

    const members = await Membership.find({ workspaceId: wsId }).populate('userId', 'name email');

    const workloadList = await Promise.all(
      members.map(async (m) => {
        const u = m.userId as any;
        if (!u) return null;

        const [assignedTasks, completedTasks, overdueTasks] = await Promise.all([
          Task.countDocuments({ workspaceId: wsId, assignedTo: u._id, status: { $ne: 'Done' } }),
          Task.countDocuments({ workspaceId: wsId, assignedTo: u._id, status: 'Done' }),
          Task.countDocuments({
            workspaceId: wsId,
            assignedTo: u._id,
            status: { $ne: 'Done' },
            deadline: { $lt: new Date() },
          }),
        ]);

        return {
          userId: u._id.toString(),
          userName: u.name,
          userEmail: u.email,
          role: m.role,
          department: m.department || 'General',
          assignedTasks,
          completedTasks,
          overdueTasks,
        };
      })
    );

    return workloadList.filter(Boolean);
  }
}

export const analyticsService = new AnalyticsService();
