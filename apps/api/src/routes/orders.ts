import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const ordersRouter = Router();

const JWT_SECRET = process.env.AUTH_SECRET || 'dev_auth_secret_key_123456789';

// GET /api/orders - Fetch customer orders (by Authorization token or email query param)
ordersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let customerEmail = (req.query.email as string)?.trim() || '';

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded?.userId) {
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { email: true },
          });
          if (user?.email) {
            customerEmail = user.email;
          }
        }
      } catch {
        // Fall back to query param email if token expired or guest
      }
    }

    if (!customerEmail) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication or email required to view order history.' },
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        customerEmail: { equals: customerEmail },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            beat: true,
            license: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// GET /api/orders/:id - Fetch order details with associated download tokens & licenses
ordersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            beat: true,
            license: true,
          },
        },
        downloads: true,
        licenseDocuments: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order was not found.' },
      });
    }

    // STRICT SECURITY GATE: Only deliver active downloads and license documents if order is 100% PAID
    const isPaid = order.status === 'PAID';

    const formattedDownloads = isPaid
      ? order.downloads.map((d) => {
          const beat = order.items.find((i) => i.beatId === d.beatId)?.beat;
          return {
            id: d.id,
            assetType: d.assetType,
            filename: `${beat?.slug || 'beat'}-${d.assetType.toLowerCase()}.${d.assetType === 'STEMS' ? 'zip' : d.assetType === 'LICENSE_PDF' ? 'html' : d.assetType.toLowerCase()}`,
            downloadUrl: `/api/downloads/${d.downloadToken}`,
            expiresAt: d.expiresAt,
            remainingDownloads: Math.max(0, d.maxDownloads - d.downloadCount),
            isAvailable: !d.isRevoked && d.downloadCount < d.maxDownloads && new Date(d.expiresAt) > new Date(),
          };
        })
      : [];

    const formattedLicenses = isPaid
      ? order.licenseDocuments.map((ld) => ({
          id: ld.id,
          documentNumber: ld.documentNumber,
          beatTitle: ld.beatTitle,
          issuedAt: ld.issuedAt,
          signatureHash: ld.signatureHash,
          viewUrl: `/api/licenses/document/${ld.id}`,
        }))
      : [];

    res.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        currency: order.currency,
        status: order.status,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        items: order.items.map((i) => ({
          id: i.id,
          beatId: i.beatId,
          licenseId: i.licenseId,
          beatTitle: i.beatTitle,
          licenseName: i.licenseName,
          price: i.price,
          artwork: i.beat.artwork,
          slug: i.beat.slug,
          bpm: i.beat.bpm,
          key: i.beat.key,
        })),
        downloads: formattedDownloads,
        licenses: formattedLicenses,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});
