import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Why we validate environment variables at startup:
 *
 * Without this, a missing GEMINI_API_KEY causes a cryptic error
 * when the first user hits the AI endpoint at runtime.
 *
 * With this, the app refuses to start entirely and tells you
 * exactly which variable is missing. Fail fast, fail clearly.
 *
 * This is standard practice in every production Node application.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

    // New: Redis connection for job queue
  REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
  REDIS_PORT: z.string().min(1, 'REDIS_PORT is required'),
  REDIS_PASSWORD: z.string().min(1, 'REDIS_PASSWORD is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('lead_intel_session'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('========================================');
  console.error('  MISSING ENVIRONMENT VARIABLES:');
  console.error('========================================');
  console.error(parsed.error.flatten().fieldErrors);
  console.error('Check your .env file against .env.example');
  process.exit(1); // Crash the app immediately with clear reason
}

RUN_WORKER_INLINE: z.enum(['true', 'false']).default('false'),

export const env = parsed.data;