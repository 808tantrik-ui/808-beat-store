import { Router, Request, Response } from 'express';
import { getRazorpayClient, verifyRazorpaySignature } from '../lib/razorpay.js';

export const razorpayStandardRouter = Router();

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Request: { amount (paise), currency, receipt }
 * Return: { order_id, amount, currency }
 * Minimum amount: 100 paise
 */
razorpayStandardRouter.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate amount is present and >= 100 paise
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Order amount must be at least 100 paise (1 INR).',
        },
      });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret || key_id.includes('placeholder')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Razorpay API credentials unconfigured or invalid.',
        },
      });
    }

    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount: Math.round(numericAmount),
      currency: (currency || 'INR').toUpperCase(),
      receipt: (receipt || `rcpt_${Date.now()}`).toString().slice(0, 40),
    });

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id,
    });
  } catch (error: any) {
    console.error('[RAZORPAY CREATE ORDER ERROR]:', error);
    const statusCode = error.statusCode || error.status;
    if (statusCode === 401 || (error.error && error.error.code === 'BAD_REQUEST_ERROR' && error.error.description?.toLowerCase().includes('auth'))) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: error.error?.description || 'Razorpay authentication failed.',
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 'RAZORPAY_API_ERROR',
        message: error.error?.description || error.message || 'Razorpay order creation failed.',
      },
    });
  }
});

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match
 */
razorpayStandardRouter.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const order_id = req.body.razorpay_order_id || req.body.order_id;
    const payment_id = req.body.razorpay_payment_id || req.body.payment_id;
    const signature = req.body.razorpay_signature || req.body.signature;

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Missing required parameters: order_id, payment_id, or signature.',
        },
      });
    }

    const isValid = verifyRazorpaySignature(order_id, payment_id, signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SIGNATURE_MISMATCH',
          message: 'Payment verification failed: Signature does not match.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      order_id,
      payment_id,
    });
  } catch (error: any) {
    console.error('[RAZORPAY VERIFY PAYMENT ERROR]:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: error.message || 'Payment verification encountered an internal error.',
      },
    });
  }
});
