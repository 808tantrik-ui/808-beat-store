import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../lib/razorpay.js';
import { checkoutSchema, razorpayVerifySchema } from '../../../../packages/shared/src/schemas.js';
import { generateDownloadToken } from '../lib/r2.js';
import { generateLicenseHtml } from '../lib/licenseGenerator.js';
import { getNextLicenseId } from '../lib/licenseNumber.js';
import { sendTransactionalEmail, sendAdminAlertPurchase } from '../lib/email.js';
import { syncOrderToGoogleSheets } from '../lib/googleSheets.js';
import { producerBrand, brandHelpers } from '../../../../packages/config/src/brand.js';

export const paymentsRouter = Router();

// POST /api/payments/checkout - Create internal Order & Razorpay Order
paymentsRouter.post('/checkout', async (req: Request, res: Response) => {
  try {
    const parseResult = checkoutSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid checkout payload',
        },
      });
    }

    const { customerName, customerEmail, items } = parseResult.data;

    // Look up beats and licenses strictly from DB to calculate authorized server-side pricing
    let subtotal = 0;
    const orderItemsToCreate: {
      beatId: string;
      licenseId: string;
      beatTitle: string;
      licenseName: string;
      price: number;
    }[] = [];

    for (const item of items) {
      let beat = await prisma.beat.findUnique({ where: { id: item.beatId } }).catch(() => null);
      if (!beat) {
        beat = await prisma.beat.findFirst({
          where: {
            OR: [
              { slug: item.beatId },
              { slug: item.beatId.replace(/-beat$/, '') },
              { title: item.beatId },
            ],
          },
        });
      }

      let license = await prisma.license.findUnique({ where: { id: item.licenseId } }).catch(() => null);
      if (!license) {
        license = await prisma.license.findFirst({
          where: {
            OR: [
              { name: item.licenseId },
              { displayName: item.licenseId },
            ],
          },
        });
      }

      if (!beat || beat.status !== 'PUBLISHED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BEAT_UNAVAILABLE',
            message: `Beat "${beat?.title || item.beatId}" is no longer available.`,
          },
        });
      }

      if (!license || !license.active) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'LICENSE_UNAVAILABLE',
            message: 'Selected license is not active.',
          },
        });
      }

      const isExclusive = license.isExclusive || license.name === 'EXCLUSIVE';
      const licensePrice = isExclusive
        ? brandHelpers.getExclusivePrice(producerBrand)
        : brandHelpers.getNonExclusivePrice(producerBrand);

      subtotal += licensePrice;
      orderItemsToCreate.push({
        beatId: beat.id,
        licenseId: license.id,
        beatTitle: beat.title,
        licenseName: isExclusive ? 'Exclusive License' : 'Non-Exclusive License',
        price: licensePrice,
      });
    }

    const discount = 0;
    const total = subtotal - discount;
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Create server-side Razorpay order
    const rzpOrder = await createRazorpayOrder(total, orderNumber, {
      customerName,
      customerEmail,
      orderNumber,
    });

    // Create Order in DB with PENDING status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        subtotal,
        discount,
        total,
        currency: 'INR',
        status: 'PENDING',
        razorpayOrderId: rzpOrder.orderId,
        items: {
          create: orderItemsToCreate,
        },
      },
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        razorpayOrderId: rzpOrder.orderId,
        amount: rzpOrder.amount, // in paise
        currency: 'INR',
        customerName,
        customerEmail,
        items: order.items,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
        upiId: process.env.UPI_ID || '9754303398@ybl',
        upiPayeeName: process.env.UPI_PAYEE_NAME || 'MANOJ KUMAR KAITHAL',
        isLiveOrder: rzpOrder.isLiveOrder ?? false,
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CHECKOUT_FAILED', message: error.message },
    });
  }
});

// POST /api/payments/razorpay/verify - Cryptographically verify payment and fulfill order
paymentsRouter.post('/razorpay/verify', async (req: Request, res: Response) => {
  try {
    const parseResult = razorpayVerifySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE_PAYLOAD', message: 'Missing payment signature credentials.' },
      });
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parseResult.data;

    // 1. Fetch internal order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            beat: true,
            license: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order record does not exist.' },
      });
    }

    // 2. Idempotency check: If already marked PAID, return existing order immediately
    if (order.status === 'PAID') {
      const existingDownloads = await prisma.download.findMany({ where: { orderId: order.id } });
      const primary = existingDownloads.find((d) => d.assetType === 'WAV' || d.assetType === 'MP3');
      return res.json({
        success: true,
        message: 'Order already fulfilled.',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'PAID',
          downloadsCount: existingDownloads.length,
          downloadToken: primary?.downloadToken || null,
          downloadUrl: primary ? `/download?token=${primary.downloadToken}` : `/order/success/${order.id}`,
        },
      });
    }

    // 3. Cryptographically verify signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      // Mark as failed in DB
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_VERIFICATION_FAILED',
          message: 'Razorpay signature verification failed. Payment cannot be trusted.',
        },
      });
    }

    // 4. Run Transactional Fulfillment
    try {
      await prisma.$transaction(async (tx) => {
        // Step 1: Pre-check beat availability for Exclusive licenses
        for (const item of order.items) {
          if (item.license.isExclusive) {
            const currentBeat = await tx.beat.findUnique({ where: { id: item.beat.id } });
            if (!currentBeat || currentBeat.status === 'ARCHIVED') {
              throw new Error('EXCLUSIVE_ALREADY_SOLD');
            }
          }
        }

        // Step 2: Update Order to PAID
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            razorpayPaymentId,
            razorpaySignature,
            paidAt: new Date(),
          },
        });

        // Step 3: Create Payment Audit Record
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: 'RAZORPAY',
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            amount: order.total,
            currency: order.currency,
            status: 'CAPTURED',
            verifiedAt: new Date(),
          },
        });

        // Step 4: Fulfill each item: Generate Sequential License Record & Secure Download Tokens
        for (const item of order.items) {
          const includedFiles: string[] = JSON.parse(item.license.includedFiles || '["MP3", "WAV"]');
          const isExclusive = item.license.isExclusive || item.license.name === 'EXCLUSIVE';

          // Allocate sequential 808T-YYYY-000001 license ID
          const licenseId = await getNextLicenseId(tx);

          // Generate License Document HTML & SHA-256 Signature
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
            razorpayPaymentId,
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

          // Generate Secure Download Tokens for each purchased file
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

          // Also add downloadable License PDF and Receipt tokens
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

          // Increment salesCount and auto-archive beat if EXCLUSIVE
          if (isExclusive) {
            await tx.beat.update({
              where: { id: item.beat.id },
              data: {
                status: 'ARCHIVED',
                salesCount: { increment: 1 },
              },
            });
          } else {
            await tx.beat.update({
              where: { id: item.beat.id },
              data: {
                salesCount: { increment: 1 },
              },
            });
          }
        }
      });
    } catch (txError: any) {
      if (txError.message === 'EXCLUSIVE_ALREADY_SOLD') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'REFUNDED' },
        });

        return res.status(409).json({
          success: false,
          error: {
            code: 'EXCLUSIVE_BEAT_UNAVAILABLE',
            message: 'This beat has already been purchased exclusively by another artist. Your payment will be refunded.',
          },
        });
      }
      throw txError;
    }

    // 5. Send Transactional Confirmation Email with download and license details
    await sendTransactionalEmail({
      to: order.customerEmail,
      type: 'ORDER_CONFIRMATION',
      orderId: order.id,
      subject: `Order Confirmed: ${order.orderNumber} - High-Fidelity Audio & Licenses Ready`,
      contentHtml: `<div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066FF;">Payment Verified & Commercial Rights Cleared</h2>
        <p>Thank you for your purchase, <strong>${order.customerName}</strong>!</p>
        <p>Your order <strong>${order.orderNumber}</strong> has been successfully processed. Your official commercial license documents and studio master WAV/MP3 files are ready for instant download.</p>
        <p><a href="${brandHelpers.getWebsiteUrl(producerBrand)}/order/success/${order.id}" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Access Downloads & Official License</a></p>
      </div>`,
    });

    // 6. Trigger Admin Notification for Successful Sale
    sendAdminAlertPurchase({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: order.total,
      currency: order.currency,
      itemsCount: order.items.length,
    }).catch((err) => {
      console.warn('[ADMIN ALERT PURCHASE ERROR]:', err.message);
    });

    // Auto-sync sale to Google Sheets
    syncOrderToGoogleSheets({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      beatTitle: order.items.map((i) => i.beat.title).join(', '),
      licenseName: order.items.map((i) => i.license.displayName).join(', '),
      amount: order.total,
      currency: order.currency,
      paymentId: razorpayPaymentId,
    }).catch(() => {});

    // Query the primary audio download record created during fulfillment
    const primaryDownload = await prisma.download.findFirst({
      where: { orderId: order.id, assetType: { in: ['WAV', 'MP3'] } },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'PAID',
        paidAt: new Date().toISOString(),
        customerEmail: order.customerEmail,
        downloadToken: primaryDownload?.downloadToken || null,
        downloadUrl: primaryDownload ? `/download?token=${primaryDownload.downloadToken}` : `/order/success/${order.id}`,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'VERIFICATION_ERROR', message: error.message },
    });
  }
});

// POST /api/payments/upi/verify - Verify Direct UPI Payment (PhonePe, GPay, Paytm)
paymentsRouter.post('/upi/verify', async (req: Request, res: Response) => {
  try {
    const { orderId, utrNumber } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_ORDER_ID', message: 'Order ID is required' },
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            beat: true,
            license: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order was not found' },
      });
    }

    if (order.status === 'PAID') {
      return res.json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'PAID',
          paidAt: order.paidAt?.toISOString() || new Date().toISOString(),
          customerEmail: order.customerEmail,
        },
      });
    }

    const cleanUtr = (utrNumber || '').trim();
    if (!cleanUtr || cleanUtr.length < 8 || !/^[A-Za-z0-9]{8,24}$/.test(cleanUtr)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_UTR',
          message: 'Please enter a valid 12-digit UPI Reference / UTR Number found on your payment confirmation screen.',
        },
      });
    }

    const paymentRef = `UTR:${cleanUtr}`;

    // Update order status to PENDING_VERIFICATION
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PENDING_VERIFICATION',
        razorpayPaymentId: paymentRef,
      },
    });

    // Create or update Payment record
    const existingPayment = await prisma.payment.findFirst({ where: { orderId: order.id } });
    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          provider: 'UPI_DIRECT',
          razorpayPaymentId: cleanUtr,
          status: 'PENDING_VERIFICATION',
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'UPI_DIRECT',
          razorpayOrderId: `UPI-${order.orderNumber}`,
          razorpayPaymentId: cleanUtr,
          amount: order.total,
          currency: order.currency,
          status: 'PENDING_VERIFICATION',
        },
      });
    }

    // Notify Admin of manual UPI submission
    sendAdminAlertPurchase({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: order.total,
      currency: order.currency,
      itemsCount: order.items.length,
    }).catch((err) => {
      console.warn('[ADMIN ALERT PURCHASE ERROR]:', err.message);
    });

    // Auto-sync sale to Google Sheets with status PENDING_VERIFICATION
    syncOrderToGoogleSheets({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      beatTitle: order.items.map((i) => i.beat.title).join(', '),
      licenseName: order.items.map((i) => i.license.displayName).join(', '),
      amount: order.total,
      currency: order.currency,
      paymentId: cleanUtr,
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'PENDING_VERIFICATION',
        utrNumber: cleanUtr,
        customerEmail: order.customerEmail,
        message: 'Your UPI transaction reference has been recorded. Our team is verifying it with the bank. Downloads will unlock once verified.',
      },
    });
  } catch (error: any) {
    console.error('UPI payment verification error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPI_VERIFICATION_ERROR', message: error.message },
    });
  }
});

