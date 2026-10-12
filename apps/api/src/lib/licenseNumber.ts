import { prisma } from './prisma.js';

/**
 * Returns the next sequential license ID in format: 808T-YYYY-000001
 */
export async function getNextLicenseId(tx: any = prisma, year?: number): Promise<string> {
  const currentYear = year || new Date().getFullYear();
  const prefix = `808T-${currentYear}-`;

  // Find the latest document with prefix 808T-YYYY-
  const latestDocs = await tx.licenseDocument.findMany({
    where: {
      documentNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      documentNumber: 'desc',
    },
    take: 1,
  });

  let nextSequence = 1;

  if (latestDocs.length > 0) {
    const lastDocNum = latestDocs[0].documentNumber;
    const parts = lastDocNum.split('-');
    if (parts.length >= 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  } else {
    // If none found with standard prefix, check total count of documents
    const totalCount = await tx.licenseDocument.count();
    nextSequence = totalCount + 1;
  }

  const paddedSeq = String(nextSequence).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
}
