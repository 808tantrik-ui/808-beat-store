const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');

const ffmpegPath = `"${ffmpeg.path}"`;
console.log('Using ffmpeg at:', ffmpegPath);

const sourceDir = path.resolve(__dirname, '../my data/hero videos');
const outputDir = path.resolve(__dirname, '../public/reels');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Find all 6 videos in numeric order
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.mp4'));
files.sort((a, b) => {
  const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
  const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
  return numA - numB;
});

console.log('Found video files in order:', files);

const results = [];

files.forEach((file, index) => {
  const reelNum = index + 1;
  const inputFilePath = path.join(sourceDir, file);
  const outMp4 = path.join(outputDir, `reel-${reelNum}.mp4`);
  const outWebm = path.join(outputDir, `reel-${reelNum}.webm`);
  const outJpg = path.join(outputDir, `reel-${reelNum}.jpg`);

  console.log(`\n========================================`);
  console.log(`Processing & Optimizing Reel ${reelNum}: ${file}`);
  console.log(`========================================`);

  // Target duration: 7.5s (with seamless 0.5s loop transition = 7.0s total seamless loop)
  const vfScale = `scale=360:640:force_original_aspect_ratio=increase,crop=360:640,fps=24`;

  // 1. Poster Image (First Frame)
  console.log(`Extracting poster JPG: reel-${reelNum}.jpg`);
  const jpgCmd = `${ffmpegPath} -y -ss 00:00:00.100 -i "${inputFilePath}" -vf "${vfScale}" -vframes 1 -q:v 3 "${outJpg}"`;
  execSync(jpgCmd, { stdio: 'pipe' });

  // 2. MP4 (H.264, 24fps, CRF 29, faststart, under 800 KB, seamless 0.5s xfade)
  console.log(`Encoding seamless MP4: reel-${reelNum}.mp4`);
  const mp4Cmd = `${ffmpegPath} -y -i "${inputFilePath}" -t 7.5 -an -filter_complex "[0:v]${vfScale},split[v1][v2];[v1]trim=0:7.0,setpts=PTS-STARTPTS[main];[v2]trim=7.0:7.5,setpts=PTS-STARTPTS[end];[end][main]xfade=transition=fade:duration=0.5:offset=0,format=yuv420p[out]" -map "[out]" -c:v libx264 -crf 29 -preset medium -movflags +faststart "${outMp4}"`;
  try {
    execSync(mp4Cmd, { stdio: 'pipe' });
  } catch (err) {
    console.warn('xfade failed, falling back to standard crop/encode');
    const fallbackMp4 = `${ffmpegPath} -y -i "${inputFilePath}" -t 7.0 -an -vf "${vfScale}" -c:v libx264 -crf 29 -preset medium -pix_fmt yuv420p -movflags +faststart "${outMp4}"`;
    execSync(fallbackMp4, { stdio: 'pipe' });
  }

  // 3. WebM (VP9, CRF 38, b:v 350k, 24fps, under 800 KB)
  console.log(`Encoding seamless WebM: reel-${reelNum}.webm`);
  const webmCmd = `${ffmpegPath} -y -i "${inputFilePath}" -t 7.5 -an -filter_complex "[0:v]${vfScale},split[v1][v2];[v1]trim=0:7.0,setpts=PTS-STARTPTS[main];[v2]trim=7.0:7.5,setpts=PTS-STARTPTS[end];[end][main]xfade=transition=fade:duration=0.5:offset=0,format=yuv420p[out]" -map "[out]" -c:v libvpx-vp9 -b:v 350k -crf 38 -deadline good -cpu-used 4 -row-mt 1 "${outWebm}"`;
  try {
    execSync(webmCmd, { stdio: 'pipe' });
  } catch (err) {
    console.warn('xfade WebM fallback');
    const fallbackWebm = `${ffmpegPath} -y -i "${inputFilePath}" -t 7.0 -an -vf "${vfScale}" -c:v libvpx-vp9 -b:v 350k -crf 38 -deadline good -cpu-used 4 -row-mt 1 -pix_fmt yuv420p "${outWebm}"`;
    execSync(fallbackWebm, { stdio: 'pipe' });
  }

  const mp4Size = fs.statSync(outMp4).size;
  const webmSize = fs.statSync(outWebm).size;
  const jpgSize = fs.statSync(outJpg).size;

  console.log(`Reel ${reelNum} complete: MP4 = ${(mp4Size/1024).toFixed(1)} KB | WebM = ${(webmSize/1024).toFixed(1)} KB | Poster = ${(jpgSize/1024).toFixed(1)} KB`);

  results.push({
    reel: `reel-${reelNum}`,
    sourceFile: file,
    mp4Bytes: mp4Size,
    webmBytes: webmSize,
    jpgBytes: jpgSize,
  });
});

console.log('\n================ FINAL ENCODING SIZES SUMMARY ================');
let totalMp4 = 0;
let totalWebm = 0;
let totalJpg = 0;
results.forEach(r => {
  totalMp4 += r.mp4Bytes;
  totalWebm += r.webmBytes;
  totalJpg += r.jpgBytes;
  console.log(`${r.reel}: MP4 ${(r.mp4Bytes/1024).toFixed(1)} KB | WebM ${(r.webmBytes/1024).toFixed(1)} KB | Poster ${(r.jpgBytes/1024).toFixed(1)} KB (Total Reel: ${((r.mp4Bytes+r.webmBytes+r.jpgBytes)/1024).toFixed(1)} KB)`);
});
console.log('--------------------------------------------------------------');
console.log(`Total MP4 (all 6 reels): ${(totalMp4/1024).toFixed(1)} KB (${(totalMp4/1024/1024).toFixed(2)} MB)`);
console.log(`Total WebM (all 6 reels): ${(totalWebm/1024).toFixed(1)} KB (${(totalWebm/1024/1024).toFixed(2)} MB)`);
console.log(`Total Posters (all 6 reels): ${(totalJpg/1024).toFixed(1)} KB`);
console.log(`Combined Total Size: ${((totalMp4 + totalWebm + totalJpg)/1024/1024).toFixed(2)} MB`);
console.log('==============================================================');
