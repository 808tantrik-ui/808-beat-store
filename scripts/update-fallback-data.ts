import fs from 'fs';
import path from 'path';

const filePath = path.resolve('apps/web/src/data/fallbackData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace NON_EXCLUSIVE price
content = content.replace(/"name":\s*"NON_EXCLUSIVE"[\s\S]*?"price":\s*\d+/g, (match) => {
  return match.replace(/"price":\s*\d+/, '"price": 49,\n        "defaultPrice": 499');
});

// Replace EXCLUSIVE price
content = content.replace(/"name":\s*"EXCLUSIVE"[\s\S]*?"price":\s*\d+/g, (match) => {
  return match.replace(/"price":\s*\d+/, '"price": 499,\n        "defaultPrice": 5999');
});

// Update FALLBACK_LICENSES at the bottom
content = content.replace(/"name":\s*"NON_EXCLUSIVE"[\s\S]*?"price":\s*\d+[\s\S]*?"defaultPrice":\s*\d+/, (match) => {
  return match.replace(/"price":\s*\d+/, '"price": 49').replace(/"defaultPrice":\s*\d+/, '"defaultPrice": 499');
});

content = content.replace(/"name":\s*"EXCLUSIVE"[\s\S]*?"price":\s*\d+[\s\S]*?"defaultPrice":\s*\d+/, (match) => {
  return match.replace(/"price":\s*\d+/, '"price": 499').replace(/"defaultPrice":\s*\d+/, '"defaultPrice": 5999');
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Successfully updated apps/web/src/data/fallbackData.ts with ₹49 (cut ₹499) and ₹499 (cut ₹5,999)!');
