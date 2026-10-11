import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flowpilot_ai';

async function startWorker() {
  console.log('[Worker] Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('[Worker] Background worker initialized successfully.');

    // Check overdue tasks every hour
    cron.schedule('0 * * * *', async () => {
      console.log('[Worker Cron] Running hourly overdue task scanner...');
    });

    // Generate daily digests at 17:00
    cron.schedule('0 17 * * *', async () => {
      console.log('[Worker Cron] Running daily report generator for all active workspaces...');
    });
  } catch (err) {
    console.warn(`[Worker] Warning: MongoDB connection failed (${MONGODB_URI}):`, err instanceof Error ? err.message : err);
    console.warn('[Worker] Worker service will idle until database connection is restored.');
  }
}

startWorker().catch((err) => {
  console.error('[Worker] Fatal error starting worker service:', err);
  process.exit(1);
});
