import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const beatsRouter = Router();

// GET /api/beats - Search & Filter beats
beatsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      mood,
      style,
      key,
      minBpm,
      maxBpm,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * take;

    const where: any = {
      status: 'PUBLISHED',
    };

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { mood: { contains: q } },
        { style: { contains: q } },
        { key: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (mood && typeof mood === 'string' && mood !== 'All') {
      where.mood = mood;
    }

    if (style && typeof style === 'string' && style !== 'All') {
      where.style = style;
    }

    if (key && typeof key === 'string' && key !== 'All') {
      where.key = key;
    }

    if (minBpm || maxBpm) {
      where.bpm = {};
      if (minBpm) where.bpm.gte = parseInt(minBpm as string, 10);
      if (maxBpm) where.bpm.lte = parseInt(maxBpm as string, 10);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'bpm_asc') orderBy = { bpm: 'asc' };
    if (sort === 'bpm_desc') orderBy = { bpm: 'desc' };
    if (sort === 'duration_asc') orderBy = { duration: 'asc' };
    if (sort === 'duration_desc') orderBy = { duration: 'desc' };
    if (sort === 'popular') orderBy = { playsCount: 'desc' };

    const [total, beats, licenses] = await Promise.all([
      prisma.beat.count({ where }),
      prisma.beat.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.license.findMany({
        where: { active: true },
        orderBy: { price: 'asc' },
      }),
    ]);

    const beatsWithLicenses = beats.map((b) => ({
      ...b,
      availableLicenses: licenses.map((l) => ({
        id: l.id,
        name: l.name,
        displayName: l.displayName,
        description: l.description,
        price: l.price,
        defaultPrice: l.defaultPrice,
        isExclusive: l.isExclusive,
        includedFiles: JSON.parse(l.includedFiles || '[]'),
        commercialUsage: l.commercialUsage,
        streamingLimit: l.streamingLimit,
        distributionLimit: l.distributionLimit,
      })),
    }));

    res.json({
      success: true,
      data: {
        beats: beatsWithLicenses,
        pagination: {
          total,
          page: pageNum,
          totalPages: Math.ceil(total / take),
          hasMore: skip + take < total,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// GET /api/beats/featured - Featured beats for hero & coverflow
beatsRouter.get('/featured', async (_req: Request, res: Response) => {
  try {
    const beats = await prisma.beat.findMany({
      where: { status: 'PUBLISHED', featured: true },
      take: 6,
      orderBy: { playsCount: 'desc' },
    });

    const licenses = await prisma.license.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });

    const beatsWithLicenses = beats.map((b) => ({
      ...b,
      availableLicenses: licenses.map((l) => ({
        id: l.id,
        name: l.name,
        displayName: l.displayName,
        description: l.description,
        price: l.price,
        defaultPrice: l.defaultPrice,
        isExclusive: l.isExclusive,
        includedFiles: JSON.parse(l.includedFiles || '[]'),
      })),
    }));

    res.json({
      success: true,
      data: beatsWithLicenses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// GET /api/beats/:slug - Get beat details
beatsRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const beat = await prisma.beat.findUnique({
      where: { slug },
      include: {
        assets: true,
      },
    });

    if (!beat) {
      return res.status(404).json({
        success: false,
        error: { code: 'BEAT_NOT_FOUND', message: 'The requested beat was not found.' },
      });
    }

    const licenses = await prisma.license.findMany({
      where: { active: true },
      include: { features: true },
      orderBy: { price: 'asc' },
    });

    // Related beats from same mood or style
    const related = await prisma.beat.findMany({
      where: {
        id: { not: beat.id },
        status: 'PUBLISHED',
        OR: [{ mood: beat.mood }, { style: beat.style }],
      },
      take: 4,
    });

    res.json({
      success: true,
      data: {
        ...beat,
        availableLicenses: licenses.map((l) => ({
          id: l.id,
          name: l.name,
          displayName: l.displayName,
          description: l.description,
          price: l.price,
          defaultPrice: l.defaultPrice,
          isExclusive: l.isExclusive,
          includedFiles: JSON.parse(l.includedFiles || '[]'),
          commercialUsage: l.commercialUsage,
          streamingLimit: l.streamingLimit,
          distributionLimit: l.distributionLimit,
          features: l.features.map((f) => f.featureText),
        })),
        relatedBeats: related,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// POST /api/beats/:id/play - Record playback event
beatsRouter.post('/:id/play', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.beat.update({
      where: { id },
      data: { playsCount: { increment: 1 } },
    });
    res.json({ success: true });
  } catch {
    res.json({ success: true }); // non-blocking
  }
});
