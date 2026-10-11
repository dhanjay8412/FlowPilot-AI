import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Task } from '../models/Task';
import { TaskActivity } from '../models/TaskActivity';
import { Comment } from '../models/Comment';
import { Notification } from '../models/Notification';
import { CreateTaskSchema, UpdateTaskSchema, AddCommentSchema } from '@flowpilot/shared';

export class TaskController {
  async listTasks(req: AuthRequest, res: Response) {
    const { status, priority, category, assignedTo, search, page = '1', limit = '50', sort = '-createdAt' } = req.query;

    const filter: any = { workspaceId: req.workspaceId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  async createTask(req: AuthRequest, res: Response) {
    const validated = CreateTaskSchema.parse(req.body);

    const task = await Task.create({
      workspaceId: req.workspaceId,
      title: validated.title,
      description: validated.description || '',
      createdBy: req.user!._id,
      assignedTo: validated.assignedTo || undefined,
      priority: validated.priority,
      prioritySource: validated.prioritySource,
      category: validated.category,
      status: validated.status,
      deadline: validated.deadline ? new Date(validated.deadline) : undefined,
    });

    await TaskActivity.create({
      workspaceId: req.workspaceId,
      taskId: task._id,
      actorId: req.user!._id,
      eventType: 'created',
    });

    if (validated.assignedTo && validated.assignedTo !== req.user!._id.toString()) {
      await Notification.create({
        workspaceId: req.workspaceId,
        recipientId: validated.assignedTo,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You were assigned task: "${task.title}"`,
        resourceType: 'task',
        resourceId: task._id,
      });
    }

    const populated = await Task.findById(task._id).populate('createdBy assignedTo', 'name email');
    return res.status(201).json({ success: true, data: populated });
  }

  async getTask(req: AuthRequest, res: Response) {
    const { taskId } = req.params;

    const task = await Task.findOne({ _id: taskId, workspaceId: req.workspaceId })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found in workspace' });
    }

    return res.status(200).json({ success: true, data: task });
  }

  async updateTask(req: AuthRequest, res: Response) {
    const { taskId } = req.params;
    const validated = UpdateTaskSchema.parse(req.body);

    const task = await Task.findOne({ _id: taskId, workspaceId: req.workspaceId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found in workspace' });
    }

    const changes: Record<string, { old: any; new: any }> = {};

    if (validated.title && validated.title !== task.title) {
      changes.title = { old: task.title, new: validated.title };
      task.title = validated.title;
    }
    if (validated.description !== undefined && validated.description !== task.description) {
      task.description = validated.description;
    }
    if (validated.status && validated.status !== task.status) {
      changes.status = { old: task.status, new: validated.status };
      task.status = validated.status;
      if (validated.status === 'Done') {
        task.completedAt = new Date();
      } else {
        task.completedAt = undefined;
      }
    }
    if (validated.priority && validated.priority !== task.priority) {
      changes.priority = { old: task.priority, new: validated.priority };
      task.priority = validated.priority;
      if (validated.prioritySource) task.prioritySource = validated.prioritySource;
    }
    if (validated.category) task.category = validated.category;
    if (validated.deadline !== undefined) {
      task.deadline = validated.deadline ? new Date(validated.deadline) : undefined;
    }
    if (validated.assignedTo !== undefined) {
      const newAssignee = validated.assignedTo || undefined;
      if (newAssignee !== (task.assignedTo ? task.assignedTo.toString() : undefined)) {
        changes.assignedTo = { old: task.assignedTo, new: newAssignee };
        task.assignedTo = newAssignee as any;

        if (newAssignee && newAssignee !== req.user!._id.toString()) {
          await Notification.create({
            workspaceId: req.workspaceId,
            recipientId: newAssignee,
            type: 'task_assigned',
            title: 'Task Assigned to You',
            message: `You were assigned to task: "${task.title}"`,
            resourceType: 'task',
            resourceId: task._id,
          });
        }
      }
    }

    task.version += 1;
    await task.save();

    if (Object.keys(changes).length > 0) {
      await TaskActivity.create({
        workspaceId: req.workspaceId,
        taskId: task._id,
        actorId: req.user!._id,
        eventType: changes.status ? 'status_change' : 'edited',
        changes,
      });
    }

    const updated = await Task.findById(task._id).populate('createdBy assignedTo', 'name email');
    return res.status(200).json({ success: true, data: updated });
  }

  async deleteTask(req: AuthRequest, res: Response) {
    const { taskId } = req.params;

    const task = await Task.findOne({ _id: taskId, workspaceId: req.workspaceId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Promise.all([
      task.deleteOne(),
      TaskActivity.deleteMany({ taskId }),
      Comment.deleteMany({ taskId }),
    ]);

    return res.status(200).json({ success: true, message: 'Task successfully deleted.' });
  }

  async getTaskActivity(req: AuthRequest, res: Response) {
    const { taskId } = req.params;

    const activities = await TaskActivity.find({ taskId, workspaceId: req.workspaceId })
      .populate('actorId', 'name email')
      .sort('-createdAt');

    return res.status(200).json({ success: true, data: activities });
  }

  async getComments(req: AuthRequest, res: Response) {
    const { taskId } = req.params;

    const comments = await Comment.find({ taskId, workspaceId: req.workspaceId })
      .populate('authorId', 'name email')
      .sort('createdAt');

    return res.status(200).json({ success: true, data: comments });
  }

  async addComment(req: AuthRequest, res: Response) {
    const { taskId } = req.params;
    const validated = AddCommentSchema.parse(req.body);

    const task = await Task.findOne({ _id: taskId, workspaceId: req.workspaceId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      workspaceId: req.workspaceId,
      taskId: task._id,
      authorId: req.user!._id,
      content: validated.content,
    });

    await TaskActivity.create({
      workspaceId: req.workspaceId,
      taskId: task._id,
      actorId: req.user!._id,
      eventType: 'commented',
    });

    const populated = await Comment.findById(comment._id).populate('authorId', 'name email');
    return res.status(201).json({ success: true, data: populated });
  }
}

export const taskController = new TaskController();
