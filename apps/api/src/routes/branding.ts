import { Router, Request, Response } from 'express';
import { producerBrand, isPlaceholder } from '../../../../packages/config/src/brand.js';
import { prisma } from '../lib/prisma.js';

export const brandingRouter = Router();

function evaluateFieldStatus(value?: string | null): 'CONFIGURED' | 'EMPTY' | 'PLACEHOLDER' {
  if (!value || value.trim() === '') return 'EMPTY';
  if (isPlaceholder(value)) return 'PLACEHOLDER';
  return 'CONFIGURED';
}

// GET /api/branding - Get brand configuration and audit status
brandingRouter.get('/', async (_req: Request, res: Response) => {
  try {
    // Check if custom config exists in DB
    const savedConfig = await prisma.brandConfig.findFirst({
      where: { isCurrent: true },
      orderBy: { updatedAt: 'desc' },
    });

    const activeConfig = savedConfig ? JSON.parse(savedConfig.configJson) : producerBrand;

    // Field-by-field audit report
    const audit = {
      producerName: {
        value: activeConfig.identity.name,
        status: evaluateFieldStatus(activeConfig.identity.name),
        fallback: 'Beat Store',
        required: true,
      },
      shortName: {
        value: activeConfig.identity.shortName,
        status: evaluateFieldStatus(activeConfig.identity.shortName),
        fallback: 'Beat Store',
        required: false,
      },
      tagline: {
        value: activeConfig.identity.tagline,
        status: evaluateFieldStatus(activeConfig.identity.tagline),
        fallback: '(Hidden)',
        required: false,
      },
      heroSubtitle: {
        value: activeConfig.identity.heroSubtitle,
        status: evaluateFieldStatus(activeConfig.identity.heroSubtitle),
        fallback: 'Premium hip-hop beats built for artists and creators.',
        required: false,
      },
      email: {
        value: activeConfig.contact.email,
        status: evaluateFieldStatus(activeConfig.contact.email),
        fallback: '(Hidden)',
        required: false,
      },
      website: {
        value: activeConfig.website.url,
        status: evaluateFieldStatus(activeConfig.website.url),
        fallback: 'http://localhost:5173',
        required: false,
      },
      instagram: {
        value: activeConfig.social.instagram,
        status: evaluateFieldStatus(activeConfig.social.instagram),
        fallback: '(Hidden)',
        required: false,
      },
      youtube: {
        value: activeConfig.social.youtube,
        status: evaluateFieldStatus(activeConfig.social.youtube),
        fallback: '(Hidden)',
        required: false,
      },
      spotify: {
        value: activeConfig.social.spotify,
        status: evaluateFieldStatus(activeConfig.social.spotify),
        fallback: '(Hidden)',
        required: false,
      },
    };

    res.json({
      success: true,
      data: {
        config: activeConfig,
        audit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /api/branding - Update branding configuration (Admin only)
brandingRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newConfig = req.body;
    
    // Save to database
    await prisma.brandConfig.updateMany({
      data: { isCurrent: false },
    });

    const saved = await prisma.brandConfig.create({
      data: {
        configJson: JSON.stringify(newConfig),
        isCurrent: true,
      },
    });

    res.json({ success: true, data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});
