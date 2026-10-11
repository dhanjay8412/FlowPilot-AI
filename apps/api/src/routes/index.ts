import { Router } from 'express';
import authRoutes from './auth.routes';
import workspaceRoutes from './workspace.routes';
import taskRoutes from './task.routes';
import meetingRoutes from './meeting.routes';
import aiRoutes from './ai.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import dailyReportRoutes from './dailyReport.routes';
import fileRoutes from './file.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/tasks', taskRoutes);
router.use('/meetings', meetingRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/daily-reports', dailyReportRoutes);
router.use('/files', fileRoutes);
router.use('/health', healthRoutes);

export default router;
