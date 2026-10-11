import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<typeof mongoose | null> {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB connection error (${env.MONGODB_URI}):`, error instanceof Error ? error.message : error);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn('[Database] API will continue in degraded mode. Health endpoints remain active to report connection status.');
    return null;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB Disconnected');
  }
}
