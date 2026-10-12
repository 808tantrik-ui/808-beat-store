import fs from 'fs';
import { spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

if (!ffmpegPath) process.exit(1);

spawnSync(ffmpegPath, [
  '-y',
  '-i', 'public/assets/artwork/missing-you.jpg',
  '-map_metadata', '-1',
  'public/assets/artwork/clean.jpg'
]);

const buf = fs.readFileSync('public/assets/artwork/clean.jpg');
console.log('Cleaned SynthID:', buf.includes(Buffer.from('SynthID')));
console.log('Cleaned C2PA:', buf.includes(Buffer.from('c2pa')));
