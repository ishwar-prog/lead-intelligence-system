import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env';
import leadRoutes from './routes/lead.routes';
import { errorHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { requireAuth } from './middleware/requireAuth';

const app = express();
app.use(cookieParser());

/**
 * Middleware Order Matters
 *
 * Express runs middleware in the order you register them.
 * Security middleware always comes first.
 * Routes come after.
 * Error handler must be absolutely last.
 */

// 1. Security headers — helmet sets ~14 security HTTP headers automatically
app.use(helmet());

// 2. CORS — allow only your frontend origin
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);

// 3. Body parser — limit size to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', requireAuth, leadRoutes);


// 5. Health check — every production service needs this
// Load balancers and monitoring tools ping this endpoint
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 6. 404 handler — catches routes that don't exist
app.use((_, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 7. Error handler — MUST be last
app.use(errorHandler);

// Database connection — separated from server startup
// This allows testing the app without a real DB connection
mongoose.connect(env.MONGODB_URI).then(() => {
  console.log('[Database] MongoDB connected successfully');
}).catch(err => {
  console.error('[Database] Connection failed:', err.message);
  process.exit(1);
});

export default app;
