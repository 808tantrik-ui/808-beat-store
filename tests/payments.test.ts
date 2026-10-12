import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature } from '../apps/api/src/lib/razorpay.js';
import { generateDownloadToken, verifyDownloadToken } from '../apps/api/src/lib/r2.js';
import { generateLicenseHtml } from '../apps/api/src/lib/licenseGenerator.js';

describe('Payment & Fulfillment Security Logic', () => {
  it('correctly verifies authentic Razorpay HMAC signatures', () => {
    const orderId = 'order_test_12345';
    const paymentId = 'pay_test_67890';
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder_secret';

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(verifyRazorpaySignature(orderId, paymentId, validSignature)).toBe(true);

    // Tampered signature or mismatched order
    expect(verifyRazorpaySignature(orderId, 'pay_tampered', validSignature)).toBe(false);
    expect(verifyRazorpaySignature('order_wrong', paymentId, validSignature)).toBe(false);
  });

  it('generates and verifies tamper-proof time-limited download tokens', () => {
    const orderId = 'ord-uuid-111';
    const beatId = 'beat-uuid-222';
    const assetType = 'WAV';

    const { token, expiresAt } = generateDownloadToken(orderId, beatId, assetType, 60);
    expect(token).toBeTruthy();
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    const result = verifyDownloadToken(token);
    expect(result.valid).toBe(true);
    expect(result.orderId).toBe(orderId);
    expect(result.beatId).toBe(beatId);
    expect(result.assetType).toBe(assetType);

    // Tampered token
    const tampered = token.slice(0, -4) + 'abcd';
    expect(verifyDownloadToken(tampered).valid).toBe(false);
  });

  it('generates professional legal licenses containing zero unresolved placeholders', () => {
    const result = generateLicenseHtml({
      orderId: 'ord-test-999',
      orderNumber: 'ORD-TEST-01',
      customerName: 'HipHop Artist',
      customerEmail: 'artist@test.com',
      beatTitle: 'Midnight Resonance',
      licenseName: 'Trackout Stems License',
      licenseType: 'PREMIUM_STEMS',
      price: 6999,
      currency: 'INR',
      issuedAt: new Date(),
      terms: 'Commercial usage up to 1,500,000 streams.',
      includedFiles: ['MP3', 'WAV', 'STEMS'],
      streamingLimit: 1500000,
      distributionLimit: 50000,
    });

    expect(result.html).toContain('Beat Store');
    expect(result.html).toContain('Midnight Resonance');
    expect(result.html).toContain('HipHop Artist');
    expect(result.html).toContain(result.documentNumber);
    expect(result.html).toContain(result.signatureHash.slice(0, 10));

    // Ensure NO raw bracketed placeholder like [PRODUCER_NAME] exists in output!
    expect(result.html).not.toMatch(/\[[A-Z0-9_]{3,}\]/);
  });
});
