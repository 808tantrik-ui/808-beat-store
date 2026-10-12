import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma.js';
import { verifyDownloadToken } from '../lib/r2.js';

export const downloadsRouter = Router();

// GET /api/downloads/info/:token - Return secure metadata for the download page
downloadsRouter.get('/info/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // 1. Cryptographic token check
    const tokenResult = verifyDownloadToken(token);
    if (!tokenResult.valid) {
      return res.status(403).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: tokenResult.error || 'Download link is invalid or expired.' },
      });
    }

    // 2. Database record check
    const downloadRecord = await prisma.download.findUnique({
      where: { downloadToken: token },
      include: {
        beat: true,
        order: true,
      },
    });

    if (!downloadRecord) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Download authorization record not found.' },
      });
    }

    // 3. Strict Payment Gate: Order must be PAID
    if (!downloadRecord.order || downloadRecord.order.status !== 'PAID') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PAYMENT_REQUIRED',
          message: 'Payment has not been completed or verified for this order. File access is strictly denied.',
        },
      });
    }

    if (downloadRecord.isRevoked) {
      return res.status(403).json({
        success: false,
        error: { code: 'REVOKED', message: 'This download link has been revoked.' },
      });
    }

    const isExpired = new Date() > new Date(downloadRecord.expiresAt);
    if (isExpired) {
      return res.status(403).json({
        success: false,
        error: { code: 'EXPIRED', message: 'This temporary download link has expired (15-minute window passed).' },
      });
    }

    if (downloadRecord.downloadCount >= downloadRecord.maxDownloads) {
      return res.status(403).json({
        success: false,
        error: { code: 'DOWNLOAD_LIMIT_REACHED', message: 'You have reached the maximum allowed downloads for this asset.' },
      });
    }

    const remainingSeconds = Math.max(0, Math.floor((new Date(downloadRecord.expiresAt).getTime() - Date.now()) / 1000));

    res.json({
      success: true,
      data: {
        beatTitle: downloadRecord.beat.title,
        artwork: downloadRecord.beat.artwork,
        bpm: downloadRecord.beat.bpm,
        key: downloadRecord.beat.key,
        genre: downloadRecord.beat.genre,
        assetType: downloadRecord.assetType,
        assetLabel:
          downloadRecord.assetType === 'WAV'
            ? '24-Bit Studio Master WAV'
            : downloadRecord.assetType === 'MP3'
            ? '320kbps High-Quality MP3'
            : downloadRecord.assetType === 'LICENSE_PDF'
            ? 'Official Commercial License Agreement'
            : 'Master Stems Package',
        filename: `${downloadRecord.beat.slug}-${downloadRecord.assetType.toLowerCase()}.${downloadRecord.assetType === 'STEMS' ? 'zip' : downloadRecord.assetType === 'WAV' ? 'wav' : downloadRecord.assetType === 'LICENSE_PDF' ? 'html' : 'mp3'}`,
        orderNumber: downloadRecord.order.orderNumber,
        orderId: downloadRecord.order.id,
        customerName: downloadRecord.order.customerName,
        customerEmail: downloadRecord.order.customerEmail,
        expiresAt: downloadRecord.expiresAt,
        remainingSeconds,
        remainingDownloads: Math.max(0, downloadRecord.maxDownloads - downloadRecord.downloadCount),
        maxDownloads: downloadRecord.maxDownloads,
        downloadUrl: `/api/downloads/${token}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// GET /api/downloads/:token - Deliver authorized file securely via backend stream
downloadsRouter.get('/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // 1. Verify cryptographic validity of token
    const tokenResult = verifyDownloadToken(token);
    if (!tokenResult.valid) {
      return res.status(403).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: tokenResult.error || 'Download link is invalid or expired.' },
      });
    }

    // 2. Look up record in database
    const downloadRecord = await prisma.download.findUnique({
      where: { downloadToken: token },
      include: {
        beat: true,
        order: true,
      },
    });

    if (!downloadRecord) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Download authorization record not found.' },
      });
    }

    // STRICT PAYMENT VERIFICATION GATE:
    if (!downloadRecord.order || downloadRecord.order.status !== 'PAID') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PAYMENT_REQUIRED',
          message: 'Payment has not been completed or verified for this order. Download access is strictly denied.',
        },
      });
    }

    if (downloadRecord.isRevoked) {
      return res.status(403).json({
        success: false,
        error: { code: 'REVOKED', message: 'This download access has been revoked.' },
      });
    }

    if (downloadRecord.downloadCount >= downloadRecord.maxDownloads) {
      return res.status(403).json({
        success: false,
        error: { code: 'DOWNLOAD_LIMIT_REACHED', message: 'You have reached the maximum allowed downloads for this asset.' },
      });
    }

    if (new Date() > new Date(downloadRecord.expiresAt)) {
      return res.status(403).json({
        success: false,
        error: { code: 'EXPIRED', message: 'This temporary download link has expired (15-minute validity window ended).' },
      });
    }

    // 3. Increment download count
    await prisma.download.update({
      where: { id: downloadRecord.id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });

    const assetType = downloadRecord.assetType;
    const beat = downloadRecord.beat;

    // Handle License PDF / Agreement HTML
    if (assetType === 'LICENSE_PDF') {
      const licenseDoc = await prisma.licenseDocument.findFirst({
        where: { orderId: downloadRecord.orderId, beatId: downloadRecord.beatId },
      });

      if (licenseDoc) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="License-${beat.slug}-${licenseDoc.documentNumber}.html"`);
        return res.send(licenseDoc.licenseTerms);
      }
    }

    // Deliver audio or stems via secure backend stream
    const ext = assetType === 'STEMS' ? 'zip' : assetType === 'WAV' ? 'wav' : 'mp3';
    const downloadFilename = `${beat.slug}-${assetType.toLowerCase()}.${ext}`;

    // Candidate file locations on server
    const possiblePaths = [
      path.resolve(process.cwd(), 'public/assets/audio', `${beat.slug}.${ext}`),
      path.resolve(process.cwd(), 'public/assets/audio', `${beat.slug}.wav`),
      path.resolve(process.cwd(), 'apps/web/public/assets/audio', `${beat.slug}.${ext}`),
      path.resolve(process.cwd(), 'apps/web/public/assets/audio', `${beat.slug}.wav`),
      path.resolve(process.cwd(), 'assets/audio', `${beat.slug}.${ext}`),
    ];

    let foundPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      const stat = fs.statSync(foundPath);
      res.setHeader('Content-Type', assetType === 'WAV' ? 'audio/wav' : assetType === 'MP3' ? 'audio/mpeg' : 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Content-Length', stat.size);
      const stream = fs.createReadStream(foundPath);
      return stream.pipe(res);
    }

    // If beat has an external audio URL (e.g. previewAudio), stream it securely without exposing raw cloud URL
    if (beat.previewAudio && (beat.previewAudio.startsWith('http://') || beat.previewAudio.startsWith('https://'))) {
      try {
        const upstream = await fetch(beat.previewAudio);
        if (upstream.ok && upstream.body) {
          res.setHeader('Content-Type', assetType === 'WAV' ? 'audio/wav' : 'audio/mpeg');
          res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
          const reader = upstream.body.getReader();
          const pump = async () => {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
            }
            res.end();
          };
          return pump();
        }
      } catch (streamErr) {
        console.error('[STREAM ERROR]:', streamErr);
      }
    }

    // Fallback: If local file cannot be read, report clean error
    return res.status(404).json({
      success: false,
      error: { code: 'ASSET_NOT_FOUND', message: 'Studio master asset is being packaged. Please contact support.' },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// GET /api/licenses/document/:id - View license document
export const licenseDocRouter = Router();

licenseDocRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await prisma.licenseDocument.findUnique({
      where: { id },
    });

    if (!doc) {
      return res.status(404).send('<h1>License document not found</h1>');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(doc.licenseTerms);
  } catch (error: any) {
    res.status(500).send(`Error loading license: ${error.message}`);
  }
});
