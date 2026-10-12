import fs from 'fs';
import path from 'path';

function extractFileId(input: string): string {
  if (!input) return '';
  const match = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                input.match(/id=([a-zA-Z0-9_-]+)/) ||
                input.match(/([a-zA-Z0-9_-]{25,})/);
  return match ? match[1] || match[0] : input;
}

async function download() {
  const inputArg = process.argv[2] || '1sI8TwSmjIc5xE8vlWgVa27cbLso9HIP3';
  const fileId = extractFileId(inputArg);

  const outDir = path.resolve(process.cwd(), 'public/assets/audio');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.join(outDir, 'downloaded-beat.wav');

  console.log(`📥 Downloading Google Drive fileId: [${fileId}] to [${outFile}]...`);

  // Direct download link with confirm=t to bypass virus scan warning on large files
  const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

  const res = await fetch(downloadUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Failed to download: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outFile, buffer);

  console.log(`✅ Successfully downloaded ${outFile}! Size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
}

download().catch(err => {
  console.error('❌ Download error:', err.message);
  process.exit(1);
});
