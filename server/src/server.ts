import app from './app';
import { env } from './config/env';

const server = app.listen(Number(env.PORT), () => {
  console.log(`
========================================
  Lead Intelligence System
  Environment: ${env.NODE_ENV}
  Port: ${env.PORT}
  Started: ${new Date().toISOString()}
========================================
  `);
});

/**
 * Graceful Shutdown
 *
 * When the process receives SIGTERM (from Docker, Kubernetes, or deployment tools),
 * we stop accepting new requests but let existing ones finish.
 * Without this, in-flight AI requests get cut off mid-response.
 */
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('[Server] All connections closed. Exiting.');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error.message);
  process.exit(1);
});