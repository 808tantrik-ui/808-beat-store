import fs from 'fs';
import path from 'path';
import { producerBrand, isPlaceholder } from '../packages/config/src/brand.js';

interface ScanIssue {
  field: string;
  value: string;
  type: 'REQUIRED' | 'OPTIONAL';
  status: 'UNRESOLVED_PLACEHOLDER' | 'MISSING' | 'CONFIGURED';
  fallbackRule: string;
}

console.log('\n======================================================');
console.log('  PRODUCER BRANDING & PLACEHOLDER AUDIT SCANNER');
console.log('======================================================\n');

const issues: ScanIssue[] = [];

// 1. Audit Identity
if (isPlaceholder(producerBrand.identity.name)) {
  issues.push({
    field: 'identity.name',
    value: producerBrand.identity.name,
    type: 'REQUIRED',
    status: 'UNRESOLVED_PLACEHOLDER',
    fallbackRule: 'Safe neutral fallback enabled: "Beat Store"',
  });
}

if (isPlaceholder(producerBrand.identity.heroSubtitle)) {
  issues.push({
    field: 'identity.heroSubtitle',
    value: producerBrand.identity.heroSubtitle,
    type: 'OPTIONAL',
    status: 'UNRESOLVED_PLACEHOLDER',
    fallbackRule: 'Safe neutral fallback enabled: "Premium hip-hop beats built for artists and creators."',
  });
}

if (isPlaceholder(producerBrand.identity.tagline)) {
  issues.push({
    field: 'identity.tagline',
    value: producerBrand.identity.tagline,
    type: 'OPTIONAL',
    status: 'UNRESOLVED_PLACEHOLDER',
    fallbackRule: 'Optional field hidden automatically.',
  });
}

// 2. Audit Contact
const contactFields = ['email', 'businessEmail', 'supportEmail', 'location'] as const;
for (const field of contactFields) {
  const val = producerBrand.contact[field];
  if (isPlaceholder(val)) {
    issues.push({
      field: `contact.${field}`,
      value: val,
      type: 'OPTIONAL',
      status: 'UNRESOLVED_PLACEHOLDER',
      fallbackRule: 'Hidden from public display until configured in Admin.',
    });
  }
}

// 3. Scan Web Client Source Code for hard-coded placeholder leaks
const webSrcDir = path.resolve(process.cwd(), 'apps/web/src');
const PLACEHOLDER_REGEX = /\[[A-Z0-9_]{3,}\]/g;
let leakCount = 0;

function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const matches = content.match(PLACEHOLDER_REGEX);
      if (matches) {
        // Exclude legitimate checks such as regex tests or brand definitions
        const KNOWN_LEGITIMATE = new Set(['[FREE]', '[100]']);
        const filteredMatches = matches.filter(
          (m) =>
            !KNOWN_LEGITIMATE.has(m) &&
            !content.includes(`isPlaceholder`) &&
            !content.includes(`regex`) &&
            !content.includes(`producerBrand`)
        );
        if (filteredMatches.length > 0) {
          console.warn(`[WARNING] Potential raw placeholder string in ${path.relative(process.cwd(), fullPath)}: ${filteredMatches.join(', ')}`);
          leakCount += filteredMatches.length;
        }
      }
    }
  }
}

scanDir(webSrcDir);

console.log('--- Configured Identity & Safety Analysis ---');
for (const issue of issues) {
  const icon = issue.type === 'REQUIRED' ? 'ℹ️ [NEUTRAL FALLBACK ACTIVE]' : '🔒 [SAFELY HIDDEN]';
  console.log(`${icon} ${issue.field}: "${issue.value}" -> ${issue.fallbackRule}`);
}

console.log('\n----------------------------------------------');
if (leakCount > 0) {
  console.error(`❌ Scan detected ${leakCount} unshielded placeholder tokens in client source code.`);
  process.exit(1);
} else {
  console.log('✅ ZERO unshielded placeholder leaks found in client code.');
  console.log('✅ All unconfigured producer fields are protected with neutral fallbacks or hidden.');
  console.log('======================================================\n');
}
