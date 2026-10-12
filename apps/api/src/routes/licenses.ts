import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { formatISTDate } from '../lib/licenseGenerator.js';
import { producerBrand, brandHelpers } from '../../../../packages/config/src/brand.js';

export const licensesRouter = Router();

// GET /api/licenses - Get all active licenses with features
licensesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const licenses = await prisma.license.findMany({
      where: { active: true },
      include: { features: true },
      orderBy: { price: 'asc' },
    });

    const nonExPrice = brandHelpers.getNonExclusivePrice(producerBrand);
    const nonExListPrice = brandHelpers.getNonExclusiveListPrice(producerBrand);
    const exPrice = brandHelpers.getExclusivePrice(producerBrand);
    const exListPrice = brandHelpers.getExclusiveListPrice(producerBrand);

    const formatted = licenses.map((l) => {
      const isEx = l.isExclusive || l.name === 'EXCLUSIVE';
      return {
        id: l.id,
        name: l.name,
        displayName: isEx ? 'Exclusive License' : 'Non-Exclusive License',
        description: l.description,
        price: isEx ? exPrice : nonExPrice,
        defaultPrice: isEx ? exListPrice : nonExListPrice,
        isExclusive: isEx,
        includedFiles: JSON.parse(l.includedFiles || '["MP3", "WAV"]'),
        commercialUsage: l.commercialUsage,
        streamingLimit: l.streamingLimit,
        distributionLimit: l.distributionLimit,
        musicVideoLimit: l.musicVideoLimit,
        radioBroadcasting: l.radioBroadcasting,
        forProfitPerformances: l.forProfitPerformances,
        creditRequirement: 'Must credit: (Prod. by 808 Tantrik)',
        features: l.features.map((f) => ({
          text: f.featureText,
          isHighlight: f.isHighlight,
        })),
      };
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// Helper to mask buyer email for public verification (e.g. j***n@domain.com)
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

// GET /api/licenses/verify/:licenseId - Public authenticity verification endpoint
licensesRouter.get('/verify/:licenseId', async (req: Request, res: Response) => {
  try {
    const { licenseId } = req.params;
    const cleanId = licenseId.trim();

    const doc = await prisma.licenseDocument.findFirst({
      where: {
        OR: [
          { documentNumber: cleanId },
          { id: cleanId },
        ],
      },
      include: {
        order: true,
        beat: true,
        license: true,
      },
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LICENSE_NOT_FOUND',
          message: `No license certificate was found matching ID "${cleanId}".`,
        },
      });
    }

    const isExclusive = doc.license.isExclusive || doc.license.name === 'EXCLUSIVE';

    res.json({
      success: true,
      data: {
        isValid: true,
        licenseId: doc.documentNumber,
        beatId: doc.beatId,
        beatTitle: doc.beatTitle,
        licenseType: isExclusive ? 'EXCLUSIVE' : 'NON_EXCLUSIVE',
        licenseDisplayName: doc.license.displayName,
        buyerName: doc.customerName,
        buyerEmailMasked: maskEmail(doc.customerEmail),
        amountPaid: doc.order.total,
        currency: doc.order.currency,
        razorpayPaymentId: doc.order.razorpayPaymentId || 'VERIFIED_GATEWAY',
        razorpayOrderId: doc.order.razorpayOrderId || doc.order.orderNumber,
        issuedAt: doc.issuedAt,
        purchasedAtIST: formatISTDate(doc.issuedAt),
        signatureHash: doc.signatureHash,
        termsVersion: 'v1.0',
        producerName: doc.producerName,
        copyrightOwner: doc.copyrightOwner,
        viewDocumentUrl: `/api/licenses/document/${doc.id}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});
