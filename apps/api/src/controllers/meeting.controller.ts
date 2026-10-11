import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Meeting } from '../models/Meeting';
import { Task } from '../models/Task';
import { TaskActivity } from '../models/TaskActivity';
import { aiService } from '../services/ai.service';
import { SummarizeMeetingInputSchema, CreateMeetingSchema } from '@flowpilot/shared';

export class MeetingController {
  async listMeetings(req: AuthRequest, res: Response) {
    const meetings = await Meeting.find({ workspaceId: req.workspaceId })
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    return res.status(200).json({ success: true, data: meetings });
  }

  async summarizeMeeting(req: AuthRequest, res: Response) {
    const validated = SummarizeMeetingInputSchema.parse(req.body);
    const aiResult = await aiService.summarizeMeeting(validated.transcript, validated.title);

    return res.status(200).json({
      success: true,
      data: {
        title: validated.title,
        transcript: validated.transcript,
        ...aiResult,
      },
    });
  }

  async createMeeting(req: AuthRequest, res: Response) {
    const validated = CreateMeetingSchema.parse(req.body);

    const meeting = await Meeting.create({
      workspaceId: req.workspaceId,
      title: validated.title,
      transcript: validated.transcript,
      summary: validated.summary,
      keyDecisions: validated.keyDecisions,
      actionItems: validated.actionItems.map((item) => ({
        description: item.description,
        suggestedAssignee: item.suggestedAssignee,
        suggestedDeadline: item.suggestedDeadline,
        priority: item.priority || 'Medium',
        status: 'pending',
      })),
      risks: validated.risks,
      createdBy: req.user!._id,
    });

    return res.status(201).json({ success: true, data: meeting.toJSON() });
  }

  async getMeeting(req: AuthRequest, res: Response) {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ _id: meetingId, workspaceId: req.workspaceId }).populate(
      'createdBy',
      'name email'
    );

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting record not found.' });
    }

    return res.status(200).json({ success: true, data: meeting.toJSON() });
  }

  async convertActionItemToTask(req: AuthRequest, res: Response) {
    const { meetingId, itemId } = req.params;

    const meeting = await Meeting.findOne({ _id: meetingId, workspaceId: req.workspaceId });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting record not found' });
    }

    const item = meeting.actionItems.find((a: any) => a._id?.toString() === itemId || a.id === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Action item not found in meeting' });
    }

    if (item.status === 'converted' && item.createdTaskId) {
      return res.status(409).json({
        success: false,
        message: 'Action item has already been converted to a task',
        taskId: item.createdTaskId,
      });
    }

    const task = await Task.create({
      workspaceId: req.workspaceId,
      title: item.description,
      description: `Converted from Meeting: "${meeting.title}" action item.`,
      createdBy: req.user!._id,
      priority: item.priority || 'Medium',
      prioritySource: 'AI-assisted',
      category: 'Meeting Followup',
      status: 'Todo',
      deadline: item.suggestedDeadline ? new Date(item.suggestedDeadline) : undefined,
    });

    item.status = 'converted';
    item.createdTaskId = task._id;
    await meeting.save();

    await TaskActivity.create({
      workspaceId: req.workspaceId,
      taskId: task._id,
      actorId: req.user!._id,
      eventType: 'created',
      changes: { source: { new: `Meeting: ${meeting.title}` } },
    });

    return res.status(201).json({
      success: true,
      data: {
        meeting: meeting.toJSON(),
        task: task.toJSON(),
      },
    });
  }

  async deleteMeeting(req: AuthRequest, res: Response) {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ _id: meetingId, workspaceId: req.workspaceId });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    await meeting.deleteOne();
    return res.status(200).json({ success: true, message: 'Meeting summary deleted successfully.' });
  }
}

export const meetingController = new MeetingController();
