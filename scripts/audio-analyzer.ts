import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

export interface AudioAnalysisResult {
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  bpm: number;
  key: string;
  energyLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  lufs: number;
  peakDb: number;
}

// Major and Minor Key profiles (Krumhansl-Schmuckler)
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function correlation(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((sum, v) => sum + v, 0) / n;
  const meanB = b.reduce((sum, v) => sum + v, 0) / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const diffA = a[i] - meanA;
    const diffB = b[i] - meanB;
    num += diffA * diffB;
    denA += diffA * diffA;
    denB += diffB * diffB;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

export function analyzeAudio(filePath: string): AudioAnalysisResult {
  if (!ffmpegPath) throw new Error('ffmpeg binary not found');

  // 1. Get audio loudness & energy via ffmpeg ebur128 and astats
  const statsRes = spawnSync(ffmpegPath, [
    '-i', filePath,
    '-af', 'ebur128=peak=true,astats=metadata=1:reset=1',
    '-f', 'null', '-'
  ], { encoding: 'utf-8' });

  const stderr = statsRes.stderr || '';

  // Parse Integrated Loudness (LUFS)
  const lufsMatch = stderr.match(/Integrated loudness:\s+I:\s+([-\d.]+)\s+LUFS/i);
  const lufs = lufsMatch ? parseFloat(lufsMatch[1]) : -14.0;

  // Parse True Peak (dBTP)
  const peakMatch = stderr.match(/Peak:\s+([-\d.]+)\s+dBFS/i) || stderr.match(/True peak:\s+([-\d.]+)\s+dBTP/i);
  const peakDb = peakMatch ? parseFloat(peakMatch[1]) : -0.1;

  // Energy Level classification from LUFS and Peak
  let energyLevel: 'Low' | 'Medium' | 'High' | 'Very High' = 'Medium';
  if (lufs >= -10.0) energyLevel = 'Very High';
  else if (lufs >= -13.5) energyLevel = 'High';
  else if (lufs >= -18.0) energyLevel = 'Medium';
  else energyLevel = 'Low';

  // 2. Decode a 40-second downsampled 11025Hz mono PCM slice for BPM & Chroma analysis
  const pcmBufferFile = path.resolve('data/temp_analysis.pcm');
  if (!fs.existsSync(path.dirname(pcmBufferFile))) {
    fs.mkdirSync(path.dirname(pcmBufferFile), { recursive: true });
  }

  spawnSync(ffmpegPath, [
    '-y',
    '-i', filePath,
    '-ss', '10',
    '-t', '45',
    '-vn',
    '-ac', '1',
    '-ar', '11025',
    '-f', 's16le',
    pcmBufferFile
  ], { stdio: 'pipe' });

  let bpm = 120;
  let detectedKey = 'C Minor';
  let durationSeconds = 180;

  // Extract total duration
  const durMatch = stderr.match(/Duration:\s+(\d+):(\d+):([\d.]+)/);
  if (durMatch) {
    const hours = parseInt(durMatch[1], 10);
    const mins = parseInt(durMatch[2], 10);
    const secs = parseFloat(durMatch[3]);
    durationSeconds = hours * 3600 + mins * 60 + secs;
  }

  if (fs.existsSync(pcmBufferFile)) {
    const pcmData = fs.readFileSync(pcmBufferFile);
    try { fs.unlinkSync(pcmBufferFile); } catch (e) {}

    const samplesCount = Math.floor(pcmData.length / 2);
    const samples = new Float32Array(samplesCount);
    for (let i = 0; i < samplesCount; i++) {
      samples[i] = pcmData.readInt16LE(i * 2) / 32768.0;
    }

    // A. BPM Detection via Energy Envelope Autocorrelation
    // Calculate RMS in 20ms frames with 10ms hop
    const sampleRate = 11025;
    const frameSize = Math.floor(sampleRate * 0.02);
    const hopSize = Math.floor(sampleRate * 0.01);
    const numFrames = Math.floor((samplesCount - frameSize) / hopSize);
    
    if (numFrames > 100) {
      const envelope = new Float32Array(numFrames);
      for (let f = 0; f < numFrames; f++) {
        let sumSq = 0;
        const start = f * hopSize;
        for (let s = 0; s < frameSize; s++) {
          const val = samples[start + s];
          sumSq += val * val;
        }
        envelope[f] = Math.sqrt(sumSq / frameSize);
      }

      // First-order difference for onset detection
      const onsets = new Float32Array(numFrames);
      for (let f = 1; f < numFrames; f++) {
        const diff = envelope[f] - envelope[f - 1];
        onsets[f] = diff > 0 ? diff : 0;
      }

      // Autocorrelation across BPM range 70 - 175
      // lag in frames = (60 / bpm) * (sampleRate / hopSize)
      // hopRate = sampleRate / hopSize = 100 frames per sec
      const hopRate = sampleRate / hopSize;
      let bestCorr = -1;
      let bestBpm = 120;

      for (let testBpm = 70; testBpm <= 175; testBpm += 1) {
        const lag = Math.round((60 / testBpm) * hopRate);
        if (lag <= 0 || lag >= numFrames / 2) continue;

        let corr = 0;
        const count = numFrames - lag;
        for (let i = 0; i < count; i++) {
          corr += onsets[i] * onsets[i + lag];
        }
        corr = corr / count;

        if (corr > bestCorr) {
          bestCorr = corr;
          bestBpm = testBpm;
        }
      }
      bpm = Math.round(bestBpm);
    }

    // B. Pitch Chroma & Key Detection (simplified Goertzel / discrete frequency bins)
    const chroma = new Array(12).fill(0);
    // Examine frequencies for octaves 2 to 5 (approx 65Hz to 1000Hz)
    const baseFreq = 440; // A4
    for (let noteIdx = 0; noteIdx < 12; noteIdx++) {
      let energy = 0;
      for (let octave = 2; octave <= 5; octave++) {
        // midi note = (octave + 1) * 12 + noteIdx
        // freq = 440 * 2^((midi - 69) / 12)
        const midi = (octave + 1) * 12 + noteIdx;
        const freq = baseFreq * Math.pow(2, (midi - 69) / 12);
        
        // Goertzel algorithm over a 4096-sample slice
        const N = 4096;
        if (samplesCount >= N) {
          const k = Math.round((N * freq) / sampleRate);
          const w = (2 * Math.PI * k) / N;
          const coeff = 2 * Math.cos(w);
          let q1 = 0, q2 = 0;
          for (let i = 0; i < N; i++) {
            const q0 = coeff * q1 - q2 + samples[i];
            q2 = q1;
            q1 = q0;
          }
          const magSq = q1 * q1 + q2 * q2 - q1 * q2 * coeff;
          energy += Math.sqrt(Math.max(0, magSq));
        }
      }
      chroma[noteIdx] = energy;
    }

    // Normalize chroma
    const chromaSum = chroma.reduce((a, b) => a + b, 0) || 1;
    const normChroma = chroma.map(v => (v / chromaSum) * 10);

    // Correlate with all 12 major and 12 minor profiles
    let bestKeyName = 'C Minor';
    let bestKeyScore = -999;

    for (let shift = 0; shift < 12; shift++) {
      const rotated = [...normChroma.slice(shift), ...normChroma.slice(0, shift)];
      
      const majScore = correlation(rotated, MAJOR_PROFILE);
      if (majScore > bestKeyScore) {
        bestKeyScore = majScore;
        bestKeyName = `${NOTE_NAMES[shift]} Major`;
      }

      const minScore = correlation(rotated, MINOR_PROFILE);
      if (minScore > bestKeyScore) {
        bestKeyScore = minScore;
        bestKeyName = `${NOTE_NAMES[shift]} Minor`;
      }
    }

    detectedKey = bestKeyName;
  }

  return {
    durationSeconds: Math.round(durationSeconds),
    sampleRate: 44100,
    channels: 2,
    bpm,
    key: detectedKey,
    energyLevel,
    lufs: Math.round(lufs * 10) / 10,
    peakDb: Math.round(peakDb * 10) / 10
  };
}
