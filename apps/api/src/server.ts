import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { beatsRouter } from './routes/beats.js';
import { licensesRouter } from './routes/licenses.js';
import { paymentsRouter } from './routes/payments.js';
import { webhooksRouter } from './routes/webhooks.js';
import { ordersRouter } from './routes/orders.js';
import { downloadsRouter, licenseDocRouter } from './routes/downloads.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { brandingRouter } from './routes/branding.js';
import { contactRouter } from './routes/contact.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

import path from 'path';

// Configure CORS with support for Netlify deploy previews, production domains, and local dev
const allowedOrigins = [
  process.env.APP_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean) as string[];

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow all Netlify domains (*.netlify.app)
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    // Allow all Railway / Render / Vercel preview domains
    if (origin.endsWith('.railway.app') || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow localhost and explicitly configured origins
    if (allowedOrigins.some((allowed) => origin === allowed || origin.startsWith(allowed))) {
      return callback(null, true);
    }

    // In production if origins are open or default
    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

app.use(corsMiddleware);
app.options('*', corsMiddleware);

// Serve public static assets (artwork, previews)
app.use('/assets', express.static(path.resolve(process.cwd(), 'public/assets')));

// Capture raw body for webhook verification
app.use(express.json({
  verify: (req: Request, _res: Response, buf: Buffer) => {
    (req as any).rawBody = buf.toString();
  },
}));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Health check
app.get(['/api', '/api/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Beat Store API',
    runtime: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
  });
});

// Mount Routes
app.use('/api/beats', beatsRouter);
app.use('/api/licenses', licensesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/downloads', downloadsRouter);
app.use('/api/licenses/document', licenseDocRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/branding', brandingRouter);
app.use('/api/contact', contactRouter);

import fs from 'fs';

// 404 Handler for API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API route not found',
    },
  });
});

// Serve frontend Single-Page Application (All-in-One single hosting support)
const distWebPath = path.resolve(process.cwd(), 'dist/web');
if (fs.existsSync(distWebPath)) {
  app.use(express.static(distWebPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distWebPath, 'index.html'));
  });
}

// Standardized Error Handler (Requirement 72)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UNHANDLED ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
    },
  });
});

// In serverless environments (e.g. Vercel), the runtime invokes the exported app handler directly.
// Only bind to local port when running as a standalone server.
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`🚀 Beat Store API running at http://localhost:${PORT}`);
    try {
      const { seed20Beats } = await import('../../../scripts/seed-20-beats.js').catch(() =>
        import('../../../scripts/seed-20-beats.ts' as any)
      );
      if (seed20Beats) {
        await seed20Beats();
      }
    } catch (err: any) {
      console.warn('[SEED WARNING]:', err.message);
    }
  });
}

export { app };
export default app;
