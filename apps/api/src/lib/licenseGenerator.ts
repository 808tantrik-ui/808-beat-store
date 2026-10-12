import crypto from 'crypto';
import { producerBrand, brandHelpers } from '../../../../packages/config/src/brand.js';

export interface LicenseDocData {
  licenseId: string;
  orderId: string;
  orderNumber: string;
  beatId: string;
  beatTitle: string;
  licenseType: 'NON_EXCLUSIVE' | 'EXCLUSIVE' | string;
  licenseName?: string;
  buyerName: string;
  buyerEmail: string;
  amountPaid: number;
  currency: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  purchasedAt: Date;
  termsVersion?: string;
  includedFiles?: string[];
  streamingLimit?: number | null;
  distributionLimit?: number | null;
}

export function formatISTDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(date) + ' (IST)';
}

export function generateLicenseSha256(data: {
  licenseId: string;
  beatId: string;
  beatTitle: string;
  licenseType: string;
  buyerName: string;
  buyerEmail: string;
  amountPaid: number;
  currency: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  purchasedAtIST: string;
  termsVersion: string;
}): string {
  const payload = [
    data.licenseId,
    data.beatId,
    data.beatTitle,
    data.licenseType,
    data.buyerName,
    data.buyerEmail,
    data.amountPaid,
    data.currency,
    data.razorpayPaymentId,
    data.razorpayOrderId,
    data.purchasedAtIST,
    data.termsVersion,
  ].join('|');

  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function generateLicenseHtml(data: LicenseDocData): {
  html: string;
  documentNumber: string;
  signatureHash: string;
  purchasedAtIST: string;
  termsVersion: string;
} {
  const producerName = brandHelpers.getProducerName(producerBrand);
  const copyrightOwner = brandHelpers.getCopyrightOwner(producerBrand);
  const websiteUrl = brandHelpers.getWebsiteUrl(producerBrand);
  const contactEmail = brandHelpers.getContactEmail(producerBrand) || 'licensing@beatstore.local';
  
  const documentNumber = data.licenseId || (data as any).documentNumber || '808T-2026-000001';
  const termsVersion = data.termsVersion || 'v1.0';
  const purchasedAt = data.purchasedAt || (data as any).issuedAt || new Date();
  const purchasedAtIST = formatISTDate(purchasedAt);
  const buyerName = data.buyerName || (data as any).customerName || 'Verified Artist';
  const buyerEmail = data.buyerEmail || (data as any).customerEmail || 'buyer@beatstore.local';
  const amountPaid = data.amountPaid ?? (data as any).price ?? 0;
  const beatId = data.beatId || 'beat-default';
  const razorpayPaymentId = data.razorpayPaymentId || 'VERIFIED';
  const razorpayOrderId = data.razorpayOrderId || data.orderNumber || 'ORD-VERIFIED';

  const signatureHash = generateLicenseSha256({
    licenseId: documentNumber,
    beatId,
    beatTitle: data.beatTitle,
    licenseType: data.licenseType,
    buyerName,
    buyerEmail,
    amountPaid,
    currency: data.currency,
    razorpayPaymentId,
    razorpayOrderId,
    purchasedAtIST,
    termsVersion,
  });

  const isExclusive = data.licenseType.toUpperCase().includes('EXCLUSIVE') && !data.licenseType.toUpperCase().includes('NON');
  const verifyUrl = `${websiteUrl}/verify-license/${encodeURIComponent(documentNumber)}`;

  // =========================================================================
  // Section B (Non-Exclusive) or Section C (Exclusive) Legal Clauses
  // =========================================================================
  let agreementTitle = 'Non-Exclusive Master Instrumental License Agreement';
  let sectionCode = 'SECTION B: NON-EXCLUSIVE COMMERCIAL LICENSE';
  let legalClauses = '';

  if (isExclusive) {
    agreementTitle = 'Exclusive Master Rights Transfer & Purchase Agreement';
    sectionCode = 'SECTION C: EXCLUSIVE MASTER RIGHTS TRANSFER';
    legalClauses = `
      <div class="clause-item">
        <h4>1. Exclusive Conveyance of Sole Master Rights</h4>
        <p>The Licensor (${producerName} / ${copyrightOwner}) hereby irrevocably assigns, transfers, and conveys to the Licensee (<strong>${buyerName}</strong>) sole and exclusive commercial recording, publishing, synchronization, and distribution rights in and to the master instrumental recording entitled <strong>"${data.beatTitle}"</strong>.</p>
      </div>

      <div class="clause-item">
        <h4>2. Permanent Market Archival & Non-Resale Guarantee</h4>
        <p>Upon execution of this Agreement and verification of Payment ID <code>${razorpayPaymentId}</code>, the Licensor warrants that the Beat has been permanently archived, unlisted, and disabled from sale in the Beat Store. No further licenses (exclusive or non-exclusive) shall ever be granted to any third party.</p>
      </div>

      <div class="clause-item">
        <h4>3. Unlimited Commercial Distribution & Monetization</h4>
        <p>Licensee is granted unrestricted, worldwide, perpetual rights for unlimited digital streams (Spotify, Apple Music, YouTube Music, etc.), unlimited physical copies, unlimited music videos, television/film synchronization, and global radio broadcasting.</p>
      </div>

      <div class="clause-item">
        <h4>4. Production Credits & Publishing Administration</h4>
        <p>Licensee agrees to provide production credit in commercial metadata and liner notes as: <em>(Prod. by ${producerName})</em>. Writer and publisher shares shall be administered in accordance with standard statutory copyright guidelines.</p>
      </div>

      <div class="clause-item">
        <h4>5. Warranty & Indemnification</h4>
        <p>Licensor warrants that the master instrumental is an original musical creation and does not infringe upon any third-party copyrighted materials or uncleared master samples.</p>
      </div>
    `;
  } else {
    legalClauses = `
      <div class="clause-item">
        <h4>1. Grant of Non-Exclusive Commercial License</h4>
        <p>The Licensor (${producerName}) grants to the Licensee (<strong>${buyerName}</strong>) a non-exclusive, non-transferable, commercial license to record vocal performances over the master instrumental entitled <strong>"${data.beatTitle}"</strong> and distribute one (1) derivative musical song across commercial digital streaming platforms.</p>
      </div>

      <div class="clause-item">
        <h4>2. Scope of Permitted Commercial Distribution</h4>
        <p>This license grants rights for up to <strong>500,000 commercial audio streams</strong> across digital platforms (Spotify, Apple Music, YouTube, Tidal, Amazon Music), up to <strong>10,000 physical copies</strong> (CD/Vinyl), and up to <strong>2 commercial music videos</strong>.</p>
      </div>

      <div class="clause-item">
        <h4>3. Underlying Master Copyright Retention</h4>
        <p>The Licensor (${copyrightOwner}) retains full 100% underlying master recording copyright and musical composition ownership. Licensee owns 100% of original lyrics, vocal master tracks, and songwriting contributions created by Licensee.</p>
      </div>

      <div class="clause-item">
        <h4>4. Mandatory Production Credit</h4>
        <p>Licensee must prominently display production credit on all commercial DSP releases, track titles, and descriptions as: <em>(Prod. by ${producerName})</em>.</p>
      </div>

      <div class="clause-item">
        <h4>5. Digital Verification & Proof of Clearance</h4>
        <p>This certificate and its cryptographic SHA-256 verification hash serve as official legal proof of commercial licensing clearance for DSP distribution aggregators (DistroKid, TuneCore, CD Baby, etc.).</p>
      </div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official License Certificate - ${documentNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .cert-container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 36px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0066FF;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .brand-group h1 {
      font-size: 24px;
      font-weight: 900;
      color: #0066FF;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-group p {
      font-size: 11px;
      color: #64748b;
      margin: 2px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-badge {
      text-align: right;
      font-size: 11px;
      color: #475569;
      font-family: monospace;
    }
    .meta-badge strong {
      color: #0f172a;
      font-size: 12px;
    }
    .doc-headline {
      text-align: center;
      margin: 20px 0 28px 0;
    }
    .section-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .doc-headline h2 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .doc-headline p {
      font-size: 12px;
      color: #64748b;
      margin: 4px 0 0 0;
    }
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      font-size: 13px;
    }
    .field-lbl {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .field-val {
      font-weight: 700;
      color: #0f172a;
      font-size: 14px;
    }
    .field-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 1px;
    }
    .contract-body {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      background: #ffffff;
      margin-bottom: 24px;
    }
    .contract-body h3 {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 14px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
    }
    .clause-item {
      margin-bottom: 14px;
    }
    .clause-item:last-child {
      margin-bottom: 0;
    }
    .clause-item h4 {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 4px 0;
    }
    .clause-item p {
      font-size: 11.5px;
      color: #334155;
      margin: 0;
      line-height: 1.5;
    }
    .sec-seal {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
      flex-wrap: wrap;
      gap: 12px;
    }
    .hash-block {
      font-family: monospace;
      font-size: 9.5px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 4px 8px;
      border-radius: 4px;
      color: #334155;
      word-break: break-all;
      max-width: 440px;
    }
    .verify-btn {
      display: inline-block;
      padding: 6px 14px;
      background: #0066FF;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .cert-container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <div class="header-bar">
      <div class="brand-group">
        <h1>${producerName}</h1>
        <p>Master Beat Store & Licensing Clearance</p>
      </div>
      <div class="meta-badge">
        <div><strong>License ID:</strong> ${documentNumber}</div>
        <div><strong>Terms Version:</strong> ${termsVersion}</div>
        <div><strong>Executed (IST):</strong> ${purchasedAtIST}</div>
      </div>
    </div>

    <div class="doc-headline">
      <span class="section-pill">${sectionCode}</span>
      <h2>${agreementTitle}</h2>
      <p>Official legally binding digital rights assignment executed under Indian Standard Time (IST)</p>
    </div>

    <div class="parties-grid">
      <div>
        <div class="field-lbl">Grantor (Producer / Licensor)</div>
        <div class="field-val">${producerName}</div>
        <div class="field-sub">Copyright Admin: ${copyrightOwner}</div>
        <div class="field-sub">Contact: ${contactEmail}</div>
      </div>

      <div>
        <div class="field-lbl">Grantee (Artist / Buyer)</div>
        <div class="field-val">${buyerName}</div>
        <div class="field-sub">${buyerEmail}</div>
        <div class="field-sub">Status: Verified Purchaser</div>
      </div>

      <div>
        <div class="field-lbl">Master Instrumental Beat</div>
        <div class="field-val">${data.beatTitle}</div>
        <div class="field-sub">Beat ID: ${beatId}</div>
      </div>

      <div>
        <div class="field-lbl">Payment & Settlement</div>
        <div class="field-val">${data.currency} ${(data.amountPaid ?? (data as any).price ?? 0).toLocaleString('en-IN')}</div>
        <div class="field-sub">Payment ID: <code>${data.razorpayPaymentId || 'VERIFIED'}</code></div>
        <div class="field-sub">Order ID: <code>${data.orderNumber}</code></div>
      </div>
    </div>

    <div class="contract-body">
      <h3>Master Terms & Conditions</h3>
      ${legalClauses}
    </div>

    <div class="sec-seal">
      <div>
        <div><strong>Cryptographic SHA-256 Signature Hash:</strong></div>
        <div class="hash-block">${signatureHash}</div>
      </div>

      <div style="text-align: right;">
        <a href="${verifyUrl}" target="_blank" class="verify-btn no-print">Verify License Online</a>
        <div style="font-size: 9.5px; color: #94a3b8; margin-top: 4px;">Public Authenticity URL: ${verifyUrl}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return {
    html,
    documentNumber,
    signatureHash,
    purchasedAtIST,
    termsVersion,
  };
}
