# Premium 3D Hip-Hop Beat Marketplace

A commercial-grade, production-ready 3D hip-hop beat marketplace engineered for a professional music producer.

## Key Features

1. **Centralized Brand Identity & Placeholder Safety**:
   - Single source of truth in `packages/config/src/brand.ts`.
   - Never exposes raw `[PRODUCER_NAME]` or unresolved placeholder tokens to customers.
   - Intelligent neutral fallbacks for missing/unconfigured values.
   - Built-in placeholder security scanner (`npm run check-placeholders`).

2. **Cinematic 3D Visual System**:
   - **Hero 3D Vinyl**: Realistic material reflections, 360° mouse/touch rotation, anti-gravity floating easing, and audio-reactive scale pulsation.
   - **3D CoverFlow Carousel**: Center-magnified, angled 3D perspective browser for featured instrumentals with instantaneous preview sync.
   - **Adaptive Performance**: Automatically scales down particle density and shader overhead for mobile devices and users with `prefers-reduced-motion`.

3. **Strict Hip-Hop Audio Engine**:
   - Strictly curated Hip-Hop catalog (Boom Bap, Lo-Fi, East Coast, West Coast, Melodic, Soul, Cinematic; zero drill, zero trap).
   - Global sticky audio player with interactive waveform seeking, volume control, and single-stream playback enforcement.
   - Web Audio API `AnalyserNode` frequency analyzer driving the 3D visual effects in real time.

4. **Commercial License Tiers & Comparison**:
   - **Standard MP3 Lease** (₹1,999)
   - **Premium WAV Lease** (₹3,499)
   - **Trackout Stems License** (₹6,999) - includes separated stems (Drums, Bass, Melody, Keys, FX)
   - **Exclusive Rights Agreement** (₹24,999) - sole ownership transfer with automatic marketplace archiving upon purchase.
   - Interactive feature comparison matrix, dedicated `/licensing` and `/licensing-terms` pages.

5. **Server-Side Verified Razorpay Payment Flow**:
   - Server-side order creation (`POST /api/payments/checkout`)
   - Official Razorpay modal checkout
   - Cryptographic HMAC SHA-256 signature verification (`POST /api/payments/razorpay/verify`)
   - Idempotent Webhook verification (`POST /api/webhooks/razorpay`)
   - Never trusts frontend payment status or presents fake success.

6. **Post-Payment Digital Vault Delivery**:
   - Temporary signed download gateway tokens (`/api/downloads/:token`).
   - Download count tracking and expiration validation.
   - Official cryptographically signed printable HTML/PDF legal license agreements with SHA-256 tamper verification hashes.
   - Cloudflare R2 private storage architecture.

7. **Admin Dashboard (`/admin`)**:
   - Gross revenue, order volume, beat plays, and download analytics.
   - Catalog management (create, edit, archive, publish/unpublish, feature).
   - Brand configuration & live placeholder safety audit panel.

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Push database schema & seed initial hip-hop catalog
npm run prisma:push
npm run prisma:seed

# 3. Start development servers (Vite + Express API)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Admin Portal**: http://localhost:5173/#/admin

---

## Quality Assurance & Tests

```bash
# Run unit & integration test suites
npm run test

# Run production placeholder safety audit
npm run check-placeholders

# Build production bundle
npm run build:web
```
