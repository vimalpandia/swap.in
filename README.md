# SWAP ⚡

> **Swap moments. Swap vibes.**

Swap is a production-grade, next-generation social media platform combining vertical short-form video, high-resolution multimedia sharing, 24-hour ephemeral stories, split-screen video duets, synchronized realtime watch parties, and anti-addiction behavioral gamification.

Unlike conventional social networks engineered to trap attention through infinite mindless scrolling, Swap pairs intentional entertainment with digital well-being: the signature **"Waste of Time"** vertical reel feed (featuring a live clock navbar indicator and HUD), the **Time Wasted Meter**, **Focus Guard** mindful breathing nudges, **Vibe Swap**, **Swap Challenges & Duets**, **Swap Day**, **Time Capsule posts**, and **Streaks**.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client[Web & Mobile Clients<br/>Next.js 14 + Tailwind + Zustand + Framer Motion]

    subgraph Edge & API Gateway (Render Web Service)
        CORS[CORS Gateway<br/>sameSite: none, secure: true, trust proxy]
        Express[Node.js Express TypeScript API<br/>/api/v1 & /health]
        SocketIO[Socket.IO Server<br/>Presence, Realtime Chat, Watch Party]
    end

    subgraph Cloud Persistence & Media
        Atlas[(MongoDB Atlas M0 Cluster<br/>18 Mongoose Models + TTL + Compound Indexes)]
        Cloudinary[Cloudinary Cloud Storage<br/>Direct Signed Uploads & Video Optimization]
        RedisCache[(Redis Cache / In-Memory Fallback<br/>Session Cache, Rate Limiting, Presence)]
    end

    Client -->|HTTPS / REST API| CORS --> Express
    Client -->|WSS / WebSocket| SocketIO
    Client -->|Direct Signed Media Upload| Cloudinary
    Express --> Atlas
    Express --> Cloudinary
    Express --> RedisCache
    SocketIO --> RedisCache
```

---

## 🚀 Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express, TypeScript, Clean Layered Architecture (`routes`, `controllers`, `services`, `repositories`) |
| **Database & ODM** | MongoDB Atlas (Free M0 Cluster), Mongoose 8 (18 schemas, compound indexes, TTL 86400s auto-expiry, atomic `$inc`) |
| **Media & Storage** | Cloudinary (Signed client uploads, server-side asset signatures, cloud video compression & thumbnailing) |
| **Realtime & Caching**| Redis 7 (with graceful in-memory fallback), Socket.IO (chat, typing, presence, watch party sync) |
| **Security Suite** | Helmet, CORS, Cookie-parser (`httpOnly` refresh tokens, cross-domain `sameSite: none`), Bcrypt, Zod validation |
| **Testing** | Jest + `mongodb-memory-server` + Supertest (Backend Integration), Vitest + RTL (Frontend), Playwright (E2E flows) |
| **DevOps & Cloud** | Render (`render.yaml` Blueprint), Docker Compose, GitHub Actions CI/CD Pipeline |

---

## ✨ Signature "Swap" Features

### 1. 🔄 Swap Challenge & Split-Screen Duets (`/duets`)
- Users send friends a reel prompt challenge (e.g. "Tokyo Street Style: Beat My Look").
- When the friend accepts and uploads their reply, Swap renders both reels side-by-side in a split-screen **Swap Duet** player.
- Viewers can toggle synchronized playback between creators and switch audio tracks on the fly.

### 2. ☀️ Swap Day (`/swap-day`)
- Once every 24 hours, mutual followers are matched to swap profile highlight reels.
- Partners exchange an interactive **Daily Vibe Note** directly on each other's highlight wall.

### 3. 🎨 Vibe Swap
- One-tap global vibe switcher: switch between **Chill** (indigo), **Hype** (pink), **Focus** (amber), and **Dark** (cyber-noir).
- Instantly re-ranks the algorithmic feed and adapts the UI color tokens.

### 4. ⏱️ "Waste of Time" Reels & Time Wasted Meter (`/reels`)
- Vertical full-screen video feed with native snap scrolling (`snap-y snap-mandatory`), viewport autoplay, and instant mute toggle.
- **Time Wasted Meter**: Tracks exact seconds spent scrolling reels, surfacing a live HUD and an analytics dashboard with daily/weekly charts and gamified tiers (Bronze Procrastinator 🥉 to Legendary Time Waster 👑).
- **Focus Guard**: When browsing crosses user-configured thresholds (e.g., 30m), an interactive mindful breathing orb activates with inhale/hold/exhale guidance and snooze options.

### 5. 🔒 Time Capsule Posts (`/capsules`)
- Scheduled posts that remain encrypted and locked until an automated future date (e.g., "Open on New Year's Eve").
- Confidential captions and media URLs are redacted server-side until the unlock timestamp arrives.

### 6. 🍿 Realtime Watch Party & Streaks (`/chat`)
- Synchronized reel viewing rooms over WebSockets with sub-50ms sync latency and emoji reactions.
- Daily flame streaks increment when friends exchange messages within 24 hours.

### 7. 🤖 AI Studio Assistant
- Integrated LLM studio assistant (Google Gemini API with graceful heuristic fallback) capable of generating viral captions, contextual hashtags, and recommended audio track pairings.

### 8. 👻 Ghost Mode
- Users can toggle Ghost Mode in profile settings to browse accounts and 24-hour stories with zero footprint recorded in viewer lists.

---

## 🗄️ MongoDB & Mongoose Schema Design

- **Bounded vs Unbounded Data**: Embedded arrays are used strictly for bounded entities (e.g. `media` items in posts, reaction tallies). Unbounded collections (comments, messages, followers) use referenced documents to avoid MongoDB's 16MB document limit.
- **Atomic Counters**: Likes, comments, followers, and following counters are modified atomically using `$inc` queries to prevent race conditions without heavy transaction overhead.
- **TTL Index**: Ephemeral 24-hour stories utilize MongoDB's native Time-To-Live index:
  ```typescript
  StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
  ```
- **Compound & Text Indexes**:
  - `UserSchema`: Unique indexes on `username` and `email`; text search index on `username`, `name`, and `bio`.
  - `PostSchema` & `ReelSchema`: Compound index on `(author, createdAt: -1)`.
  - `MessageSchema`: Compound index on `(conversation, createdAt: -1)`.
  - `FollowSchema`: Compound unique index on `(follower, following)`.
- **Cursor-Based Pagination**: Clean $O(1)$ cursor pagination powered by MongoDB's unique `_id` (`{ _id: { $lt: cursor } }`), eliminating performance-degrading `$skip` offsets.

---

## ☁️ Render Deployment Guide

Swap is engineered for zero-friction deployment to **Render**:

### Ephemeral Storage Safety
Render Web Services feature an ephemeral filesystem. Swap **never** stores uploads on local disk. Uploads are streamed directly to Cloudinary using secure signed upload presets via the `/api/v1/upload/signature` endpoint.

### Cross-Domain Authentication
When the frontend (`https://swap.onrender.com` or Vercel) and backend (`https://swap-api.onrender.com`) live on different domains:
1. `app.set('trust proxy', 1)` is enabled on Express to ensure secure cookie forwarding behind reverse proxies.
2. Refresh token cookies are issued with:
   ```typescript
   {
     httpOnly: true,
     secure: true,
     sameSite: 'none',
     maxAge: 7 * 24 * 60 * 60 * 1000
   }
   ```
3. CORS is configured with explicit frontend origins and `credentials: true`.
4. Dedicated `/health` endpoint responds with `200 OK` for zero-downtime Render health checks.

### One-Click Deploy via `render.yaml`
Push the repository to GitHub, link it in Render, and select **New Blueprint Instance**. Render will automatically provision:
- `swap-api`: Node.js Web Service running `dist/server.js` with health checks on `/health`.
- `swap-web`: Next.js 14 production service.

---

## 🛠️ Local Development & Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/swap-social/swap.git
cd swap
npm install
```

### 2. Environment Setup
```bash
# Backend environment
cp apps/api/.env.example apps/api/.env

# Frontend environment
cp apps/web/.env.example apps/web/.env.local
```

### 3. Database Seed
Run the automated seed script to populate demo users, posts, reels, completed Swap Duets, active stories, and streaks:
```bash
npm run seed
```
Demo accounts created:
- `alex_swap` (Alex Rivera)
- `maya_vibes` (Maya Lin)
- `kai_creates` (Kai Tanaka)
- `elena_sound` (Elena Rostova)
- `swap_admin` (Swap Official Team)

### 4. Start Development Servers
```bash
# Start API (port 5000)
npm run dev:api

# Start Web Client (port 3000)
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) to experience Swap.  
Swagger API Docs: [http://localhost:5000/api/docs](http://localhost:5000/api/docs).

---

## 🧪 Testing Suite (49 Automated Tests)

Swap includes complete test coverage across backend, frontend, and end-to-end flows:

```bash
# Run 41 Backend Integration Tests (Jest + mongodb-memory-server)
npm run test:api

# Run 8 Frontend Component & Store Tests (Vitest)
npm run test:web

# Run Playwright End-to-End Suite
npx playwright test
```

---

## 📄 License
MIT © 2026 Swap Engineering Team
