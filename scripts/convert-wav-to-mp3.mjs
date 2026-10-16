import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const audioDir = path.resolve('public/assets/audio');
const files = fs.readdirSync(audioDir);
const wavFiles = files.filter(f => f.endsWith('.wav'));

console.log(`Found ${wavFiles.length} WAV files in ${audioDir}`);

for (let i = 0; i < wavFiles.length; i++) {
  const wavFile = wavFiles[i];
  const mp3File = wavFile.replace(/\.wav$/i, '.mp3');
  const mp3Path = path.join(audioDir, mp3File);
  const wavPath = path.join(audioDir, wavFile);

  if (fs.existsSync(mp3Path)) {
    console.log(`[${i + 1}/${wavFiles.length}] Skipping ${mp3File} (already exists)`);
    continue;
  }

  console.log(`[${i + 1}/${wavFiles.length}] Converting ${wavFile} -> ${mp3File}...`);
  try {
    // Convert to 192kbps MP3 for fast loading and great preview sound
    execFileSync(ffmpegPath, [
      '-y',
      '-i', wavPath,
      '-vn',
      '-ar', '44100',
      '-ac', '2',
      '-b:a', '192k',
      mp3Path
    ], { stdio: 'pipe' });

    const sizeMb = (fs.statSync(mp3Path).size / (1024 * 1024)).toFixed(2);
    console.log(`✓ Generated ${mp3File} (${sizeMb} MB)`);
  } catch (err) {
    console.error(`❌ Failed to convert ${wavFile}:`, err.message);
  }
}

console.log('🎉 All audio conversions completed!');
