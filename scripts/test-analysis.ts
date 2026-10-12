import path from 'path';
import { analyzeAudio } from './audio-analyzer';

const testFile = path.resolve('public/assets/audio/missing-you.wav');
console.log('Analyzing:', testFile);
try {
  const result = analyzeAudio(testFile);
  console.log('Analysis Result:', JSON.stringify(result, null, 2));
} catch (err) {
  console.error('Error during analysis:', err);
}
