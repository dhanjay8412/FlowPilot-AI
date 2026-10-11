import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response) {
    const notifications = await Notification.find({
      workspaceId: req.workspaceId,
      recipientId: req.user!._id,
    })
      .sort('-createdAt')
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      workspaceId: req.workspaceId,
      recipientId: req.user!._id,
      readAt: { $exists: false },
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  }

  async markAsRead(req: AuthRequest, res: Response) {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      workspaceId: req.workspaceId,
      recipientId: req.user!._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({ success: true, data: notification });
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    await Notification.updateMany(
      {
        workspaceId: req.workspaceId,
        recipientId: req.user!._id,
        readAt: { $exists: false },
      },
      { $set: { readAt: new Date() } }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  }
}

export const notificationController = new NotificationController();
