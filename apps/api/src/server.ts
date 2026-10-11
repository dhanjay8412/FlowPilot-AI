import { app } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';

async function startServer() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.warn(`[FlowPilot API] Warning: MongoDB unavailable at ${env.MONGODB_URI}. API running in degraded state.`);
    }

    const server = app.listen(env.PORT, () => {
      console.log(`[FlowPilot API] Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`[FlowPilot API] Base URL: http://localhost:${env.PORT}/api/v1`);
      console.log(`[FlowPilot API] Health check: http://localhost:${env.PORT}/api/v1/health/ready`);
    });

    const shutdown = async (signal: string) => {
      console.log(`[FlowPilot API] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[FlowPilot API] Server gracefully terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[FlowPilot API] Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
