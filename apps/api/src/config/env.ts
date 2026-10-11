import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

// Load environment variables from candidate locations
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/flowpilot_ai'),
  JWT_SECRET: z.string().default('super-secret-jwt-key-change-this-in-production-min-32-chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('super-secret-cookie-key-flowpilot-2026'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  ENABLE_MOCK_AI: z.string().transform((v) => v === 'true').default('true'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((v) => parseInt(v, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((v) => parseInt(v, 10)),
});

export const env = envSchema.parse(process.env);
