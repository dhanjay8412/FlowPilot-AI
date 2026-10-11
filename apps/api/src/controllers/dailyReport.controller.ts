import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DailyReport } from '../models/DailyReport';
import { analyticsService } from '../services/analytics.service';
import { aiService } from '../services/ai.service';
import { Workspace } from '../models/Workspace';

export class DailyReportController {
  async getDailyReports(req: AuthRequest, res: Response) {
    const reports = await DailyReport.find({ workspaceId: req.workspaceId })
      .sort('-reportDate')
      .limit(30);

    return res.status(200).json({ success: true, data: reports });
  }

  async getReportByDate(req: AuthRequest, res: Response) {
    const { date } = req.params;

    const report = await DailyReport.findOne({
      workspaceId: req.workspaceId,
      reportDate: date,
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report for specified date not found.' });
    }

    return res.status(200).json({ success: true, data: report });
  }

  async generateReport(req: AuthRequest, res: Response) {
    const todayStr = new Date().toISOString().split('T')[0];

    const workspace = await Workspace.findById(req.workspaceId);
    const timezone = workspace?.settings?.timezone || 'UTC';

    const metrics = await analyticsService.getWorkspaceOverview(req.workspaceId!);
    const narrative = await aiService.generateDailyReportNarrative(metrics);

    const report = await DailyReport.findOneAndUpdate(
      { workspaceId: req.workspaceId, reportDate: todayStr },
      {
        workspaceId: req.workspaceId,
        reportDate: todayStr,
        timezone,
        generatedAt: new Date(),
        metricsSnapshot: metrics,
        narrative,
        status: 'generated',
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, data: report });
  }
}

export const dailyReportController = new DailyReportController();
