# Production Deployment Guide

This guide documents deploying the 3D Hip-Hop Beat Marketplace to production infrastructure.

---

## 1. Architecture Overview

- **Frontend & Backend Hosting**: **Vercel** (Unified fullstack deployment)
  - **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Three.js / React Three Fiber (Served from `dist/web`)
  - **Backend API**: Express.js Serverless Functions deployed on Vercel via [`api/index.ts`](file:///d:/anti%20gravity%20workspace/api/index.ts) with Prisma ORM
- **Database**: PostgreSQL (Hosted on **Neon**, **Supabase**, or **Vercel Postgres** with connection pooling)
- **Private Storage**: Cloudflare R2 (S3-compatible private bucket for master MP3, 24-bit WAV, and multitrack stems ZIP archives)
- **Payment Gateway**: Razorpay (Server-to-server order creation, client checkout popup, cryptographic HMAC SHA-256 signature verification, idempotent webhooks)
- **Transactional Emails**: Resend API (Order confirmation, license delivery, download access notification)

---

## 2. Environment Variables Configuration (Vercel Project Settings)

Configure these in **Vercel Project Settings > Environment Variables**:

```ini
# Database (Neon / PostgreSQL Connection String)
DATABASE_URL="postgresql://user:password@ep-cool-sample.us-east-2.aws.neon.tech/beatstore?sslmode=require"

# Server Ports & Host URLs
PORT=4000
API_URL="https://api.yourdomain.com"
APP_URL="https://yourdomain.com"

# Authentication & Token Signing Secret (Minimum 32 random characters)
AUTH_SECRET="your_production_auth_secret_minimum_32_characters"

# Razorpay Production Keys
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxx"

# Cloudflare R2 Private Storage
R2_ACCOUNT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
R2_ACCESS_KEY_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
R2_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
R2_BUCKET_NAME="beat-store-vault"
R2_ENDPOINT="https://<accountid>.r2.cloudflarestorage.com"

# Resend Transactional Email API Key
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"

NODE_ENV="production"
```

---

## 3. Database Migration to Neon PostgreSQL

1. In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Run database migration:
   ```bash
   npx prisma migrate deploy
   ```
3. Seed the catalog and initial license tiers:
   ```bash
   npx prisma db seed
   ```

---

## 4. Centralized Producer Branding & Placeholder Safety

1. Open [`packages/config/src/brand.ts`](file:///d:/anti%20gravity%20workspace/packages/config/src/brand.ts).
2. Update the producer's real information in ONE place:
   ```typescript
   export const producerBrand: ProducerBrandConfig = {
     identity: {
       name: "Your Producer Name",
       shortName: "Producer Name",
       tagline: "Grammy-Nominated Hip-Hop Sound Designer",
       heroSubtitle: "Hard-hitting boom-bap, soulful grooves, and cinematic beats engineered for lyricists.",
       copyrightOwner: "Producer Name Music Group",
     },
     assets: {
       logo: "/assets/branding/producer-logo.svg",
       logoLight: "/assets/branding/producer-logo-light.svg",
       logoDark: "/assets/branding/producer-logo-dark.svg",
       favicon: "/assets/branding/favicon.svg",
       ogImage: "/assets/branding/og-image.jpg",
       audioTag: "/assets/branding/producer-tag.mp3",
     },
     website: {
       url: "https://yourdomain.com",
       domain: "yourdomain.com",
     },
     contact: {
       email: "producer@yourdomain.com",
       businessEmail: "mgmt@yourdomain.com",
       supportEmail: "licensing@yourdomain.com",
       location: "Mumbai, India",
     },
     social: {
       instagram: "https://instagram.com/producer",
       youtube: "https://youtube.com/@producer",
       spotify: "https://spotify.com/artist/producer",
       x: "https://x.com/producer",
       facebook: "https://facebook.com/producer",
       tiktok: "https://tiktok.com/@producer",
     },
     audioBranding: {
       enabled: false,
       tagFile: "/assets/branding/producer-tag.mp3",
       tagVolume: 0.7,
     },
     seo: {
       siteTitle: "Your Producer Name | Premium Hip-Hop Beats",
       defaultDescription: "Explore exclusive and non-exclusive premium hip-hop beats.",
       keywords: [
         "hip-hop beats",
         "rap beats",
         "buy beats",
         "instrumentals",
         "hip-hop producer",
       ],
     },
     business: {
       currency: "INR",
       currencySymbol: "₹",
       country: "India",
     },
     colors: {
       background: "#050505",
       surface: "#0D0D12",
       primary: "#0066FF",
       secondary: "#7000FF",
       text: "#FFFFFF",
       mutedText: "#A1A1AA",
     },
   };
   ```
3. Run the automated placeholder scanner before building:
   ```bash
   npm run check-placeholders
   ```
   If any unconfigured required placeholders exist, the script reports their neutral fallbacks and verifies that no raw bracketed placeholders leak into customer-facing components.

---

## 5. Webhook Setup in Razorpay Dashboard

1. Navigate to **Razorpay Dashboard > Settings > Webhooks**.
2. Add Webhook URL: `https://api.yourdomain.com/api/webhooks/razorpay`.
3. Secret: Enter the value matching `RAZORPAY_WEBHOOK_SECRET`.
4. Subscribed Events:
   - `order.paid`
   - `payment.captured`
   - `payment.failed`

---

## 6. Verifying Production Readiness

Run unit, integration, and security tests:
```bash
npm run test
```
Build the optimized web bundle:
```bash
npm run build:web
```
