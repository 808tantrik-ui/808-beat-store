import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyWebhookSignature } from '../lib/razorpay.js';
import { generateDownloadToken } from '../lib/r2.js';
import { generateLicenseHtml } from '../lib/licenseGenerator.js';
import { getNextLicenseId } from '../lib/licenseNumber.js';

export const webhooksRouter = Router();

// POST /api/webhooks/razorpay
webhooksRouter.post('/razorpay', async (req: Request, res: Response) => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  if (!webhookSignature) {
    return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
  }

  // Verify HMAC signature
  const isValid = verifyWebhookSignature(rawBody, webhookSignature);
  if (!isValid && process.env.NODE_ENV === 'production') {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || payload.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return res.json({ status: 'ignored_no_order_id' });
      }

      const order = await prisma.order.findUnique({
        where: { razorpayOrderId },
        include: { items: { include: { beat: true, license: true } } },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Idempotency: skip if already fulfilled
      if (order.status === 'PAID') {
        return res.json({ status: 'already_paid' });
      }

      await prisma.$transaction(async (tx) => {
        // Exclusive availability check
        for (const item of order.items) {
          if (item.license.isExclusive) {
            const currentBeat = await tx.beat.findUnique({ where: { id: item.beat.id } });
            if (!currentBeat || currentBeat.status === 'ARCHIVED') {
              throw new Error('EXCLUSIVE_ALREADY_SOLD');
            }
          }
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
            paidAt: new Date(),
          },
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: 'RAZORPAY',
            razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
            amount: order.total,
            currency: order.currency,
            status: 'CAPTURED',
            webhookPayload: JSON.stringify(req.body),
            verifiedAt: new Date(),
          },
        });

        for (const item of order.items) {
          const includedFiles: string[] = JSON.parse(item.license.includedFiles || '["MP3", "WAV"]');
          const isExclusive = item.license.isExclusive || item.license.name === 'EXCLUSIVE';

          const licenseId = await getNextLicenseId(tx);

          const licenseDoc = generateLicenseHtml({
            licenseId,
            orderId: order.id,
            orderNumber: order.orderNumber,
            beatId: item.beat.id,
            beatTitle: item.beat.title,
            licenseType: isExclusive ? 'EXCLUSIVE' : 'NON_EXCLUSIVE',
            licenseName: item.license.displayName,
            buyerName: order.customerName,
            buyerEmail: order.customerEmail,
            amountPaid: item.price,
            currency: order.currency,
            razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
            razorpayOrderId,
            purchasedAt: new Date(),
            termsVersion: 'v1.0',
            includedFiles,
            streamingLimit: item.license.streamingLimit,
            distributionLimit: item.license.distributionLimit,
          });

          await tx.licenseDocument.create({
            data: {
              orderId: order.id,
              beatId: item.beat.id,
              licenseId: item.license.id,
              documentNumber: licenseDoc.documentNumber,
              licenseTerms: licenseDoc.html,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              beatTitle: item.beat.title,
              producerName: item.beat.producerDisplayName || 'Beat Store',
              copyrightOwner: item.beat.copyrightOwner || 'Beat Store',
              signatureHash: licenseDoc.signatureHash,
            },
          });

          for (const fileType of includedFiles) {
            const download = generateDownloadToken(order.id, item.beat.id, fileType as any);
            await tx.download.create({
              data: {
                orderId: order.id,
                beatId: item.beat.id,
                assetType: fileType,
                downloadToken: download.token,
                expiresAt: download.expiresAt,
                maxDownloads: 10,
              },
            });
          }

          const licenseToken = generateDownloadToken(order.id, item.beat.id, 'LICENSE_PDF');
          await tx.download.create({
            data: {
              orderId: order.id,
              beatId: item.beat.id,
              assetType: 'LICENSE_PDF',
              downloadToken: licenseToken.token,
              expiresAt: licenseToken.expiresAt,
              maxDownloads: 20,
            },
          });

          if (isExclusive) {
            await tx.beat.update({
              where: { id: item.beat.id },
              data: { status: 'ARCHIVED', salesCount: { increment: 1 } },
            });
          } else {
            await tx.beat.update({
              where: { id: item.beat.id },
              data: { salesCount: { increment: 1 } },
            });
          }
        }
      });
    }

    res.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});
