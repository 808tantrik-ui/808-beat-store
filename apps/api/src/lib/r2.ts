import crypto from 'crypto';

/**
 * Cloudflare R2 / S3 Secure File Delivery System
 * In production: Generates pre-signed URLs via AWS S3 / Cloudflare R2 SDK.
 * In development / fallback: Generates time-limited, cryptographically signed gateway tokens.
 */

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'beat-store-vault';
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const SIGNING_SECRET = process.env.AUTH_SECRET || 'vault_secret_fallback_key';

export interface SignedDownloadToken {
  token: string;
  expiresAt: Date;
  assetType: 'MP3' | 'WAV' | 'STEMS' | 'LICENSE_PDF' | 'RECEIPT';
}

/**
 * Generates an encrypted/signed download token for authorized file access.
 */
export function generateDownloadToken(
  orderId: string,
  beatId: string,
  assetType: 'MP3' | 'WAV' | 'STEMS' | 'LICENSE_PDF' | 'RECEIPT',
  expiresInMinutes = 15 // 15 minutes time-limited token
): SignedDownloadToken {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${orderId}:${beatId}:${assetType}:${expiresAt.getTime()}:${nonce}`;
  
  const signature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(payload)
    .digest('hex');

  // Token encapsulates payload + verification signature
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');

  return {
    token,
    expiresAt,
    assetType,
  };
}

/**
 * Verifies if a given download token is authentic and not expired.
 */
export function verifyDownloadToken(token: string): {
  valid: boolean;
  orderId?: string;
  beatId?: string;
  assetType?: 'MP3' | 'WAV' | 'STEMS' | 'LICENSE_PDF' | 'RECEIPT';
  error?: string;
} {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 6) {
      return { valid: false, error: 'Malformed download token' };
    }

    const [orderId, beatId, assetType, expiresAtTimestamp, nonce, signature] = parts;
    const payload = `${orderId}:${beatId}:${assetType}:${expiresAtTimestamp}:${nonce}`;

    const expectedSignature = crypto
      .createHmac('sha256', SIGNING_SECRET)
      .update(payload)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, error: 'Invalid token signature' };
    }

    if (Date.now() > parseInt(expiresAtTimestamp, 10)) {
      return { valid: false, error: 'Download token has expired' };
    }

    return {
      valid: true,
      orderId,
      beatId,
      assetType: assetType as any,
    };
  } catch {
    return { valid: false, error: 'Token verification failed' };
  }
}
