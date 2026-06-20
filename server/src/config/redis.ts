import { env } from './env';

/**
 * Shared Redis connection options
 *
 * Professor Note:
 * Bull needs Redis connection details in this specific shape.
 * We centralize it here so both the QUEUE (producer side, in app.ts/lead.service.ts)
 * and the WORKER (consumer side, in a separate process) use identical connection config.
 *
 * If you ever need to change Redis providers, you change exactly one file.
 */
export const redisConnection = {
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
  // Redis Cloud requires TLS on most free tiers - maxRetriesPerRequest null
  // is required by Bull's internal Redis client to work correctly with queues
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};