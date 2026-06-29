import app from './app';
import { env } from './config/env';

const server = app.listen(Number(env.PORT), () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

if (env.RUN_WORKER_INLINE) {
  console.log('[Server] RUN_WORKER_INLINE=true - starting worker in-process');
  import('./queues/leadAnalysis.worker');
}

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});