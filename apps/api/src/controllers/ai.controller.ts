import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';
import { analyticsService } from '../services/analytics.service';
import { ClassifyTaskInputSchema, SummarizeMeetingInputSchema } from '@flowpilot/shared';

export class AiController {
  async classifyTask(req: AuthRequest, res: Response) {
    const validated = ClassifyTaskInputSchema.parse(req.body);
    const result = await aiService.classifyTask(validated.prompt, validated.context);
    return res.status(200).json({ success: true, data: result });
  }

  async summarizeMeeting(req: AuthRequest, res: Response) {
    const validated = SummarizeMeetingInputSchema.parse(req.body);
    const result = await aiService.summarizeMeeting(validated.transcript, validated.title);
    return res.status(200).json({ success: true, data: result });
  }

  async generateDailyReport(req: AuthRequest, res: Response) {
    const metrics = await analyticsService.getWorkspaceOverview(req.workspaceId!);
    const narrative = await aiService.generateDailyReportNarrative(metrics);

    return res.status(200).json({
      success: true,
      data: {
        workspaceId: req.workspaceId,
        reportDate: new Date().toISOString().split('T')[0],
        metricsSnapshot: metrics,
        narrative,
        generatedAt: new Date().toISOString(),
      },
    });
  }
}

export const aiController = new AiController();
