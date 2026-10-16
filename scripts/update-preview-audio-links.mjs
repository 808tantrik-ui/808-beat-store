import fs from 'fs';
import path from 'path';

// 1. Update apps/web/src/data/fallbackData.ts
const fallbackPath = path.resolve('apps/web/src/data/fallbackData.ts');
if (fs.existsSync(fallbackPath)) {
  let content = fs.readFileSync(fallbackPath, 'utf8');
  const countBefore = (content.match(/"previewAudio":\s*"\/assets\/audio\/[^"]+\.wav"/g) || []).length;
  content = content.replace(/"previewAudio":\s*"\/assets\/audio\/([^"]+)\.wav"/g, '"previewAudio": "/assets/audio/$1.mp3"');
  fs.writeFileSync(fallbackPath, content, 'utf8');
  console.log(`✓ Updated ${countBefore} previewAudio links in fallbackData.ts to .mp3`);
}

// 2. Update data/scheduled-beats.json
const schedPath = path.resolve('data/scheduled-beats.json');
if (fs.existsSync(schedPath)) {
  let content = fs.readFileSync(schedPath, 'utf8');
  const countBefore = (content.match(/"previewAudio":\s*"\/assets\/audio\/[^"]+\.wav"/g) || []).length;
  content = content.replace(/"previewAudio":\s*"\/assets\/audio\/([^"]+)\.wav"/g, '"previewAudio": "/assets/audio/$1.mp3"');
  fs.writeFileSync(schedPath, content, 'utf8');
  console.log(`✓ Updated ${countBefore} previewAudio links in scheduled-beats.json to .mp3`);
}

console.log('Audio preview link updates completed successfully!');
