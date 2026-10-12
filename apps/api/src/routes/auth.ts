import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { sendAdminAlertNewUser, sendAdminAlertUserLogin } from '../lib/email.js';
import { syncUserToGoogleSheets } from '../lib/googleSheets.js';

export const authRouter = Router();
const JWT_SECRET = process.env.AUTH_SECRET || 'dev_auth_secret_key_123456789';

export function isConfiguredAdminEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const configured = (process.env.ADMIN_EMAILS || process.env.ADMIN_ALERT_EMAIL || 'admin@808beatstore.com')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());
  return configured.includes(normalized);
}

// Middleware to authenticate JWT
export async function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User does not exist' } });
    }

    (req as any).user = user;
    next();
  } catch {
    return res.status(403).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
  }
}

// Middleware to restrict access strictly to ADMIN users
export function requireAdmin(req: Request, res: Response, next: Function) {
  const user = (req as any).user;
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required. Customers are restricted to listening & buying.' },
    });
  }
  next();
}

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Email and password required' } });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    // Auto-promote to ADMIN if email is configured in admin emails
    if (isConfiguredAdminEmail(normalizedEmail) && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    }

    // Trigger Admin Alert Email for User Login
    sendAdminAlertUserLogin({
      email: user.email,
      name: user.name || undefined,
      id: user.id,
      role: user.role,
    }).catch((err) => {
      console.warn('[ADMIN LOGIN ALERT ERROR]:', err.message);
    });

    // Sync user login to Google Sheets
    syncUserToGoogleSheets({
      userId: user.id,
      name: user.name || undefined,
      email: user.email,
      role: user.role,
      action: 'LOGIN',
    }).catch(() => {});

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'LOGIN_ERROR', message: error.message } });
  }
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Email and password required' } });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Account with this email already exists' } });
    }

    const shouldBeAdmin = isConfiguredAdminEmail(normalizedEmail);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name || 'Producer / Artist',
        role: shouldBeAdmin ? 'ADMIN' : 'CUSTOMER',
      },
    });

    // Send admin notification for new user registration & first login
    sendAdminAlertNewUser({ id: user.id, email: user.email, name: user.name || undefined }).catch((err) => {
      console.warn('[ADMIN ALERT NEW USER ERROR]:', err.message);
    });

    sendAdminAlertUserLogin({ email: user.email, name: user.name || undefined, id: user.id, role: user.role }).catch((err) => {
      console.warn('[ADMIN ALERT LOGIN ERROR]:', err.message);
    });

    // Sync new user to Google Sheets
    syncUserToGoogleSheets({
      userId: user.id,
      name: user.name || undefined,
      email: user.email,
      role: user.role,
      action: 'SIGNUP',
    }).catch(() => {});

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'REGISTER_ERROR', message: error.message } });
  }
});

// POST /api/auth/google - Instant Google Sign-In & Registration
authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_EMAIL', message: 'Valid Google email is required' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const shouldBeAdmin = isConfiguredAdminEmail(normalizedEmail);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || 'Google Artist',
          role: shouldBeAdmin ? 'ADMIN' : 'CUSTOMER',
        },
      });

      sendAdminAlertNewUser({ id: user.id, email: user.email, name: user.name || undefined }).catch((err) => {
        console.warn('[ADMIN GOOGLE SIGNUP ALERT ERROR]:', err.message);
      });
    } else if (shouldBeAdmin && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    }

    // Trigger Admin Alert Email for Google Login
    sendAdminAlertUserLogin({
      email: user.email,
      name: user.name || undefined,
      id: user.id,
      role: user.role,
    }).catch((err) => {
      console.warn('[ADMIN GOOGLE LOGIN ALERT ERROR]:', err.message);
    });

    // Sync Google User to Google Sheets
    syncUserToGoogleSheets({
      userId: user.id,
      name: user.name || undefined,
      email: user.email,
      role: user.role,
      action: 'GOOGLE_AUTH',
    }).catch(() => {});

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'GOOGLE_AUTH_ERROR', message: error.message } });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ success: true, data: user });
});
