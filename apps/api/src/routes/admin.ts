import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from './auth.js';

export const adminRouter = Router();

// Protect all admin endpoints with strict Token & Admin Role verification
adminRouter.use(authenticateToken);
adminRouter.use(requireAdmin);

// GET /api/admin/overview - Dashboard KPIs and statistics
adminRouter.get('/overview', async (_req: Request, res: Response) => {
  try {
    const [totalRevenueResult, totalOrders, totalBeats, totalDownloads, recentOrders, topBeats] =
      await Promise.all([
        prisma.order.aggregate({
          where: { status: 'PAID' },
          _sum: { total: true },
        }),
        prisma.order.count({ where: { status: 'PAID' } }),
        prisma.beat.count(),
        prisma.download.aggregate({
          _sum: { downloadCount: true },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        }),
        prisma.beat.findMany({
          take: 5,
          orderBy: { salesCount: 'desc' },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenueResult._sum.total || 0,
        totalOrders,
        totalBeats,
        totalDownloads: totalDownloads._sum.downloadCount || 0,
        recentOrders,
        topBeats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET /api/admin/beats - List all beats
adminRouter.get('/beats', async (_req: Request, res: Response) => {
  try {
    const beats = await prisma.beat.findMany({
      orderBy: { createdAt: 'desc' },
      include: { assets: true },
    });
    res.json({ success: true, data: beats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /api/admin/beats - Create new beat
adminRouter.post('/beats', async (req: Request, res: Response) => {
  try {
    const { title, bpm, key, duration, mood, style, description, featured, status, artwork, previewAudio } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString(36)}`;

    const beat = await prisma.beat.create({
      data: {
        title,
        slug,
        bpm: parseInt(bpm, 10),
        key,
        duration: parseInt(duration, 10) || 180,
        mood,
        style,
        genre: 'Hip-Hop',
        description: description || '',
        artwork: artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        previewAudio: previewAudio || 'https://cdn.freesound.org/previews/612/612611_5674468-lq.mp3',
        featured: Boolean(featured),
        status: status || 'PUBLISHED',
      },
    });

    res.json({ success: true, data: beat });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// PUT /api/admin/beats/:id - Update beat
adminRouter.put('/beats/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, bpm, key, duration, mood, style, description, featured, status } = req.body;

    const updated = await prisma.beat.update({
      where: { id },
      data: {
        title,
        bpm: bpm ? parseInt(bpm, 10) : undefined,
        key,
        duration: duration ? parseInt(duration, 10) : undefined,
        mood,
        style,
        description,
        featured: featured !== undefined ? Boolean(featured) : undefined,
        status,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// DELETE /api/admin/beats/:id - Archive or delete beat
adminRouter.delete('/beats/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.beat.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    res.json({ success: true, message: 'Beat archived successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET /api/admin/orders - All orders
adminRouter.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        downloads: true,
      },
    });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET /api/admin/licenses - All generated legal license agreements with search
adminRouter.get('/licenses', async (req: Request, res: Response) => {
  try {
    const searchQuery = (req.query.q as string || '').trim().toLowerCase();

    const licenseDocs = await prisma.licenseDocument.findMany({
      orderBy: { issuedAt: 'desc' },
      include: {
        order: true,
        beat: true,
        license: true,
      },
    });

    const filtered = licenseDocs.filter((doc) => {
      if (!searchQuery) return true;
      return (
        doc.documentNumber.toLowerCase().includes(searchQuery) ||
        doc.customerEmail.toLowerCase().includes(searchQuery) ||
        doc.customerName.toLowerCase().includes(searchQuery) ||
        doc.beatTitle.toLowerCase().includes(searchQuery) ||
        (doc.order.razorpayPaymentId && doc.order.razorpayPaymentId.toLowerCase().includes(searchQuery)) ||
        doc.order.orderNumber.toLowerCase().includes(searchQuery)
      );
    });

    const formatted = filtered.map((doc) => ({
      id: doc.id,
      licenseId: doc.documentNumber,
      documentNumber: doc.documentNumber,
      beatId: doc.beatId,
      beatTitle: doc.beatTitle,
      licenseType: doc.license.isExclusive ? 'EXCLUSIVE' : 'NON_EXCLUSIVE',
      licenseName: doc.license.displayName,
      buyerName: doc.customerName,
      buyerEmail: doc.customerEmail,
      amountPaid: doc.order.total,
      currency: doc.order.currency,
      razorpayPaymentId: doc.order.razorpayPaymentId || 'N/A',
      razorpayOrderId: doc.order.razorpayOrderId || doc.order.orderNumber,
      orderNumber: doc.order.orderNumber,
      issuedAt: doc.issuedAt,
      signatureHash: doc.signatureHash,
      viewUrl: `/api/licenses/document/${doc.id}`,
      verifyUrl: `/verify-license/${encodeURIComponent(doc.documentNumber)}`,
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

