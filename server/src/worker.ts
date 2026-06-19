import mongoose from 'mongoose';
import { env } from './config/env';
import './queues/leadAnalysis.worker'; // Side-effect import: registers the processor

/**
 * Worker Entry Point
 *
 * Professor Note — Why is this a SEPARATE file from server.ts?
 *
 * server.ts starts your Express API.
 * worker.ts starts your job processor.
 *
 * In development, you'll run both with two terminal windows.
 * In production, these can be deployed as two entirely separate services
 * (e.g., one on Render as a "Web Service", one as a "Background Worker").
 * You could even run 3 worker instances and 1 API instance if AI processing
 * becomes your bottleneck. That's the scalability this unlocks.
 *
 * This is a fundamental pattern in real backend systems: separate your
 * request-handling tier from your background-processing tier.
 */

mongoose
  .connect(env.MONGODB_URI)
  .then(() => {
    console.log('[Worker] MongoDB connected');
    console.log('[Worker] Ready to process lead analysis jobs');
  })
  .catch((err) => {
    console.error('[Worker] MongoDB connection failed:', err.message);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  console.log('[Worker] SIGTERM received - shutting down gracefully');
  process.exit(0);
});