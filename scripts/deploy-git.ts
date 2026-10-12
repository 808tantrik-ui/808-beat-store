import { execSync } from 'child_process';
import fs from 'fs';

const gitPath = 'C:\\Users\\808ta\\AppData\\Local\\Programs\\PortableGit\\cmd\\git.exe';

console.log('🚀 Starting deployment to GitHub and Render...');

try {
  // 1. Stage all changes
  console.log('📦 Staging files...');
  execSync(`"${gitPath}" add -A`, { stdio: 'inherit' });

  // 2. Commit changes
  console.log('📝 Creating commit...');
  execSync(`"${gitPath}" commit -m "feat: promotional pricing 49/499 (cut 499/5999), clean razorpay checkout without qr"`, { stdio: 'inherit' });

  // 3. Push to origin main
  console.log('⬆️ Pushing to GitHub (origin main)...');
  execSync(`"${gitPath}" push origin main`, { stdio: 'inherit' });

  console.log('🎉 Successfully pushed to GitHub! Render will now automatically trigger live deployment.');
} catch (error: any) {
  console.error('❌ Deployment error:', error.message);
  process.exit(1);
}
