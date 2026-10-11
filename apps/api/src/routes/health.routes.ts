import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/live', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (_req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    return res.status(503).json({
      status: 'error',
      message: 'Database is not connected',
      dbState: mongoose.connection.readyState,
    });
  }

  return res.status(200).json({
    status: 'ready',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
});

export default router;
