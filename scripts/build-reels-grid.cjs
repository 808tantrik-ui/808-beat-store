const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');

const ffmpegPath = `"${ffmpeg.path}"`;
console.log('Using ffmpeg at:', ffmpegPath);

const sourceDir = path.resolve(__dirname, '../my data/hero videos');
const outputDir = path.resolve(__dirname, '../public/reels');
const tempDir = path.resolve(__dirname, '../temp_reels_build');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Find all 6 videos in numeric order
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.mp4'));
files.sort((a, b) => {
  const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
  const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
  return numA - numB;
});

console.log('Found video files in order:', files);

const targetDuration = 7.5;
const loopDuration = 7.0;
const crossfade = 0.5;

const processedClips = [];

files.forEach((file, index) => {
  const reelNum = index + 1;
  const inputFilePath = path.join(sourceDir, file);
  const tempClip = path.join(tempDir, `clip-${reelNum}.mp4`);
  const posterJpg = path.join(outputDir, `reel-${reelNum}.jpg`);

  console.log(`\n--- Pre-processing Clip ${reelNum}: ${file} ---`);

  const scaleCrop = `scale=288:512:force_original_aspect_ratio=increase,crop=288:512,fps=24`;

  // 1. Extract first frame poster (288x512)
  console.log(`Extracting poster: reel-${reelNum}.jpg`);
  const posterCmd = `${ffmpegPath} -y -ss 00:00:00.100 -i "${inputFilePath}" -vf "${scaleCrop}" -vframes 1 -q:v 3 "${posterJpg}"`;
  execSync(posterCmd, { stdio: 'pipe' });

  // 2. Seamless loop crossfade (last 0.5s into first 0.5s using fade + overlay)
  console.log(`Baking seamless 0.5s crossfade loop (288x512 @ 24fps): clip-${reelNum}.mp4`);
  
  const clipFilter = `[0:v]${scaleCrop},split[main_in][fade_in];[main_in]trim=0:${loopDuration},setpts=PTS-STARTPTS[base];[fade_in]trim=${loopDuration}:${targetDuration},setpts=PTS-STARTPTS,format=yuva420p,fade=t=out:st=0:d=${crossfade}:alpha=1[overlay_clip];[base][overlay_clip]overlay=0:0:format=yuv420[out]`;

  const clipCmd = `${ffmpegPath} -y -i "${inputFilePath}" -t ${targetDuration} -an -filter_complex "${clipFilter}" -map "[out]" -c:v libx264 -crf 20 -preset fast -pix_fmt yuv420p "${tempClip}"`;

  try {
    execSync(clipCmd, { stdio: 'pipe' });
    console.log(`Seamless crossfade loop generated successfully for clip ${reelNum}!`);
  } catch (err) {
    console.warn(`Fallback on clip ${reelNum}`);
    const fallbackCmd = `${ffmpegPath} -y -i "${inputFilePath}" -t ${loopDuration} -an -vf "${scaleCrop}" -c:v libx264 -crf 20 -preset fast -pix_fmt yuv420p "${tempClip}"`;
    execSync(fallbackCmd, { stdio: 'pipe' });
  }

  processedClips.push(tempClip);
});

// 3. Stack all 6 clips into a 3 x 2 grid (864x1024)
// Layout:
// Row 0: clip1 at (0,0), clip2 at (288,0), clip3 at (576,0)
// Row 1: clip4 at (0,512), clip5 at (288,512), clip6 at (576,512)
const outGridMp4 = path.join(outputDir, 'reels-grid.mp4');
console.log(`\n========================================`);
console.log(`Stacking 6 clips into 3x2 grid (864x1024): ${outGridMp4}`);
console.log(`========================================`);

const inputsStr = processedClips.map(c => `-i "${c}"`).join(' ');
const xstackFilter = `xstack=inputs=6:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0[v]`;

// High quality, smooth decoding, CRF 26 for target size ~1.8 MB (strictly under 2.5 MB)
const stackCmd = `${ffmpegPath} -y ${inputsStr} -filter_complex "${xstackFilter}" -map "[v]" -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p -crf 26 -preset slow -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "${outGridMp4}"`;

execSync(stackCmd, { stdio: 'pipe' });

const finalSize = fs.statSync(outGridMp4).size;
console.log(`\n================ SUCCESS ================`);
console.log(`reels-grid.mp4 created: ${(finalSize / 1024 / 1024).toFixed(2)} MB (${(finalSize / 1024).toFixed(1)} KB)`);
console.log(`Requirement check: Under 2.5 MB -> ${finalSize < 2.5 * 1024 * 1024 ? 'PASSED ✅' : 'FAILED ❌'}`);
console.log(`=========================================`);

// Cleanup temp directory
try {
  fs.rmSync(tempDir, { recursive: true, force: true });
} catch (e) {}
