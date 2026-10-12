import 'dotenv/config';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder_secret';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_placeholder';

export const razorpayClient = new Razorpay({
  key_id,
  key_secret,
});

/**
 * Creates a server-side Razorpay Order.
 * @param amount Amount in INR (will be converted to smallest unit: paise)
 * @param receipt Unique internal receipt identifier
 */
export async function createRazorpayOrder(amount: number, receipt: string, notes: Record<string, string> = {}) {
  // Amount in Razorpay is in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(amount * 100);

  try {
    const order = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt.slice(0, 40),
      notes,
    });
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      isLiveOrder: true,
    };
  } catch (error: any) {
    console.warn('[RAZORPAY GATEWAY NOTICE]: Gateway order unauthenticated or offline. Falling back to internal order & direct UPI.', error.message || error);
    // Graceful fallback: Never crash checkout. Generate internal order reference so customer can pay via Direct UPI
    const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    return {
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      isLiveOrder: false,
    };
  }
}

/**
 * Cryptographically verifies Razorpay payment signature using HMAC SHA256.
 * Format: HMAC_SHA256(order_id + "|" + payment_id, secret) === signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');

    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return true;
    }

    return false;
  } catch (err) {
    console.error('verifyRazorpaySignature error:', err);
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature
 */
export function verifyWebhookSignature(rawBody: string, webhookSignature: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhook_secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(webhookSignature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
