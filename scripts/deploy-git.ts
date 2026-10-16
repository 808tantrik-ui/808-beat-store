import { execSync } from 'child_process';
import fs from 'fs';

const gitPath = fs.existsSync('C:\\Users\\808ta\\AppData\\Local\\Programs\\PortableGit\\cmd\\git.exe')
  ? 'C:\\Users\\808ta\\AppData\\Local\\Programs\\PortableGit\\cmd\\git.exe'
  : 'git';

console.log('🚀 Starting deployment to GitHub and Render...');

try {
  // 1. Stage all changes
  console.log('📦 Staging files...');
  execSync(`"${gitPath}" add -A`, { stdio: 'inherit' });

  // 2. Commit changes
  console.log('📝 Creating commit...');
  execSync(`"${gitPath}" commit -m "fix: audio preview streaming, missing mp3s, cart dropdown safety, dynamic pricing & zero placeholders"`, { stdio: 'inherit' });

  // 3. Push to origin main
  console.log('⬆️ Pushing to GitHub (origin main)...');
  execSync(`"${gitPath}" push origin main`, { stdio: 'inherit' });

  console.log('🎉 Successfully pushed to GitHub! Render will now automatically trigger live deployment.');
} catch (error: any) {
  console.error('❌ Deployment error:', error.message);
  process.exit(1);
}
