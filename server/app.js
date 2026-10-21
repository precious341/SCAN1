import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { query } from './database/db.js';

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Handled per-origin in development
  crossOriginEmbedderPolicy: false,
}));

// Cross-origin & body parsing
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Server-side sessions with HTTP-only cookies
app.use(session({
  name: 'medscan_sid',
  secret: process.env.SESSION_SECRET || 'medscan-production-secure-session-key-32chars',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// System health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    return res.json({
      status: 'healthy',
      service: 'MedScan API',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      status: 'degraded',
      service: 'MedScan API',
      database: 'error',
      error: err.message,
    });
  }
});

// Mount application API routers
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/profile', profileRoutes);

// Global error handler (preventing internal stack leakage)
app.use((err, req, res, next) => {
  console.error('[App Error Handler]', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred processing your clinical data.';
  return res.status(status).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' && status === 500
        ? 'Internal server error. Please try again later.'
        : message,
    },
  });
});

export default app;
