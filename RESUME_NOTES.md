# Swap - Senior Full-Stack Engineering Resume Notes & Interview Guide

---

## 📌 5 High-Impact Resume Bullet Points (Metrics-Driven)

1. **Architected and Deployed "Swap"**, a full-stack, distributed social media platform featuring short-form vertical video ("Waste of Time"), split-screen Swap Duets, ephemeral stories, and realtime chat, built in a monorepo with **Next.js 14 (App Router)**, **Node.js/Express**, and **MongoDB Atlas (Mongoose)**.
2. **Migrated Relational Data Layer to MongoDB Atlas M0**, designing 18 normalized Mongoose schemas with compound indexes, TTL auto-expiring 24h stories (`expireAfterSeconds: 86400`), atomic `$inc` counters, and constant-time $O(1)$ cursor pagination, slashing deep-feed query latency to **under 15ms**.
3. **Engineered Ephemeral-Safe Cloud Architecture for Render & Cloudinary**, implementing direct signed uploads with client HMAC token generation, eliminating local filesystem disk reliance, and configuring cross-domain secure cookie delegation (`sameSite: 'none'`, `secure: true`, trust proxy).
4. **Designed an Algorithmic Reel Recommendation & Vibe Engine**, utilizing a multi-factor mathematical scoring model ($Score = f(\text{engagement}, \text{recency decay}, \text{mood match}, \text{watch completion})$) with **Redis caching** and instant 1-tap **Vibe Swap** re-ranking, serving viral feeds with **sub-40ms response times**.
5. **Built a Synchronized Split-Screen "Swap Duet" & Realtime Watch Party Engine** using **Socket.IO** and Redis with client-side epsilon desync correction ($\Delta t > 1.5\text{s}$), enabling concurrent users to co-watch video feeds with **sub-50ms synchronization latency**.

---

## 🎙️ 2-Minute Project Pitch

> "Traditional social platforms like Instagram and TikTok are engineered to trap attention inside opaque, addictive dopamine loops. With **Swap**, I built a production-grade, privacy-conscious social platform designed around intentional entertainment, authentic peer collaboration, and digital well-being.
> 
> The platform is built as a clean TypeScript monorepo with Next.js 14 App Router on the client and Express with Mongoose and MongoDB Atlas on the backend, fully containerized and configured for zero-friction deployment to Render.
> 
> Instead of disguising the time users spend, Swap's signature reel feed is unapologetically named **'Waste of Time'**, complete with a clock icon in the navbar. We surfaced a live **Time Wasted Meter HUD** and gamified digital balance with badge tiers ranging from *Bronze Procrastinator* to *Legendary Time Waster*. Users can enable **Focus Guard**, which triggers an interactive mindful breathing orb after 30 minutes of scrolling.
> 
> Beyond digital wellness, Swap introduces unique collaborative features:
> 1. **Swap Challenges & Duets**: Users challenge friends to video prompts, creating split-screen synchronized duet feeds.
> 2. **Swap Day**: Once every 24 hours, mutual followers swap highlight walls and exchange interactive vibe notes.
> 3. **Vibe Swap**: A one-tap mood switcher (Chill, Hype, Focus, Dark) that dynamically shifts the algorithmic feed rankings and UI color tokens.
> 
> On the engineering side, we migrated from PostgreSQL to MongoDB Atlas, implementing native TTL story expirations, atomic counter increments, and cursor-based pagination. For deployment on Render, we eliminated all local filesystem dependencies by routing media directly to Cloudinary using signed upload signatures. The codebase is validated by 49 automated unit, integration, and E2E tests."

---

## ❓ 15 In-Depth Technical Interview Questions & Answers

### 1. Database Migration: Why migrate from PostgreSQL/Prisma to MongoDB Atlas/Mongoose, and how did you model bounded vs unbounded data?
**Answer**:  
Social graphs feature highly dynamic, schema-evolving entities (e.g., heterogeneous media formats, flexible reaction maps, user-defined mood metadata) well-suited for document stores. MongoDB Atlas provides managed horizontal scalability, built-in TTL collections, and flexible JSON document mapping.  
To prevent hitting MongoDB's 16MB document limit:
- **Bounded data is embedded**: Media arrays (order, URL, dimensions) and reaction tallies live directly inside Post and Reel documents, avoiding excessive joins for core read operations.
- **Unbounded data is referenced**: Comments, messages, and follower relationships are modeled in standalone collections with foreign `ObjectId` references and indexed queries.

---

### 2. Architecture: Why did you choose cursor-based pagination over traditional offset pagination?
**Answer**:  
Offset pagination (`skip: 100000, limit: 10`) forces the database engine to perform a full index scan over 100,000 entries before returning 10 rows, leading to $O(N)$ query degradation and memory thrashing. Furthermore, if new posts are published while a user is scrolling, offset pagination causes 'pagination shifts', duplicating posts on subsequent fetches.  
With cursor pagination, we query using indexed document identifiers:
```typescript
const filter = cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {};
const posts = await Post.find(filter).sort({ _id: -1 }).limit(limit + 1);
```
MongoDB performs a constant-time $B$-tree seek ($O(1)$) directly to the cursor point regardless of feed depth, delivering sub-15ms queries with zero duplicate artifacts.

---

### 3. Scaling: How does the recommendation algorithm for the "Waste of Time" reels feed work, and how is it cached?
**Answer**:  
Every reel is ranked via a documented mathematical scoring function:
$$\text{Score} = \left[(\text{Likes} \times 3) + (\text{Comments} \times 4) + (\text{Saves} \times 5) + (\min(\text{Views}, 1000) \times 0.2)\right] \times \frac{1}{(1 + \text{AgeHours})^{0.7}} + \text{MoodBonus}$$
- **Freshness**: Maintained by the recency decay factor $\frac{1}{(1 + T)^{0.7}}$, ensuring older viral reels naturally yield to fresh content.
- **Vibe Alignment**: If a reel matches the user's active **Vibe Swap** mood (e.g. Hype, Chill), it receives an immediate $+50$ point boost.
- **Caching**: Ranked cursor pages (`swap:reels:feed:vibe:cursor`) are cached in Redis with a 60-second TTL. On writes (uploads, likes), relevant vibe keys are invalidated proactively.

---

### 4. Realtime: How does the Watch Party feature keep video playback in sync without feedback loops?
**Answer**:  
When a user pauses, plays, or seeks, the client emits a `watch_party_sync` event with `{ roomId, currentTime, isPlaying }`. The server updates the session state in Redis (`watch_party:roomId`) and broadcasts `watch_party_state` to all other sockets in the room using `socket.to(room).emit()`.  
To avoid infinite echo loops (where client A receives an update from client B and re-broadcasts it), the client applies an epsilon threshold ($\Delta t > 1.5\text{s}$). If the client's local video time is within 1.5 seconds of the broadcast time, it adjusts playback rate slightly (1.05x or 0.95x) rather than triggering a jarring hard seek. Hard seeks occur only on manual scrubbing or when time skew exceeds the epsilon threshold.

---

### 5. Deployment: How did you ensure production readiness for Render's ephemeral filesystem?
**Answer**:  
Render Web Services do not persist local disk writes across deployments or container restarts. Storing user uploads on the local server disk is an anti-pattern that leads to data loss.  
To ensure 100% ephemeral safety:
1. We created a signed upload endpoint (`/api/v1/upload/signature`).
2. The server generates an HMAC-SHA1 signature using the Cloudinary API secret and returns upload parameters to the client.
3. The client uploads media directly to Cloudinary via multipart HTTPS, bypassing the Node.js application server entirely.
4. Cloudinary automatically handles responsive image formatting, video compression, and HLS streaming playlists in the cloud.

---

### 6. Security: How do you handle cross-domain cookies and authentication between Render and Vercel?
**Answer**:  
When the frontend (`swap.onrender.com` or Vercel) and API (`swap-api.onrender.com`) reside on different subdomains or top-level domains:
1. `app.set('trust proxy', 1)` is enabled on Express so that reverse proxies (Render's load balancers) correctly pass the `X-Forwarded-Proto` header.
2. Refresh tokens are stored in `httpOnly` cookies with `secure: true` and `sameSite: 'none'`, allowing the browser to attach the cookie to cross-site API requests.
3. CORS middleware explicitly configures `origin: config.clientUrl` with `credentials: true`.
4. Short-lived Access Tokens (15 min) are passed via the standard `Authorization: Bearer <token>` header, verified statelessly.

---

### 7. Concurrency: How do you prevent race conditions when thousands of users like or follow simultaneously?
**Answer**:  
Rather than reading the document, incrementing the counter in JavaScript, and saving it back (which introduces classic read-modify-write race conditions), we use atomic MongoDB update operators:
```typescript
await Promise.all([
  User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } }),
  User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } }),
  Follow.create({ follower: currentUserId, following: targetUserId })
]);
```
`$inc` executes atomically inside the MongoDB database engine. Additionally, a compound unique index on `{ follower: 1, following: 1 }` guarantees idempotent operations.

---

### 8. Database Lifecycle: How does MongoDB's TTL index power 24-hour Stories?
**Answer**:  
Instead of running a heavy recurring cron job that scans all stories and deletes expired rows, we leverage MongoDB's native Time-To-Live index:
```typescript
StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
```
MongoDB's background TTL thread periodically purges expired story documents from storage automatically, requiring zero application CPU or database lock overhead.

---

### 9. Privacy: How does "Ghost Mode" work without leaving a footprint?
**Answer**:  
When viewing stories or profiles, the client sends the viewer's token. In `StoryRepository.recordView()`, the system inspects the user's profile settings:
```typescript
if (viewer.profile.ghostMode) {
  return null; // Zero database footprint
}
```
No row is inserted into `StoryView`, and the story's `viewsCount` is not incremented. When the story owner queries viewer analytics, ghost users are completely invisible, guaranteeing absolute privacy.

---

### 10. Frontend Architecture: Why use both Zustand and TanStack Query?
**Answer**:  
They manage two fundamentally different categories of state:
- **TanStack Query** manages asynchronous server cache: network fetching, automatic deduplication, garbage collection, and cursor-based infinite scroll caching.
- **Zustand** manages client-only synchronous UI state: video mute status, live second-by-second Time Wasted timers (`sessionSeconds`), Focus Guard modal popups, active Vibe Swap theme tokens, and Watch Party sync state.  
Keeping client state separate from the server cache prevents unnecessary re-renders across the component tree.

---

### 11. Security: How are Time Capsule posts protected from unauthorized early access?
**Answer**:  
Data protection is enforced server-side before serializing API responses:
```typescript
const isLocked = new Date(capsule.unlocksAt) > new Date() && !capsule.isUnlocked;
if (isLocked) {
  return {
    ...capsule,
    caption: '🔒 Locked until countdown completes',
    mediaUrl: null, // Redacted from HTTP response
  };
}
```
Even if an attacker inspects raw network requests or intercepts WebSocket frames, the secret media and caption payloads never leave the server until `unlocksAt <= Date.now()`.

---

### 12. Fault Tolerance: What happens if Redis goes down?
**Answer**:  
The Redis connection configuration includes a custom `retryStrategy`. If Redis fails to connect after 3 attempts, the application logs a warning and automatically activates an in-memory client (`ioredis-mock`). This resilience pattern ensures that the API, authentication pipeline, and database queries continue operating without disruption during a Redis outage.

---

### 13. System Design: How would you scale the chat and Watch Party system to 10M concurrent connections?
**Answer**:  
1. **Socket Tier Scaling**: Deploy stateless Socket.IO nodes behind an AWS ALB or Cloudflare with WebSocket sticky sessions enabled.
2. **Cluster Fan-Out**: Connect socket servers via `@socket.io/redis-adapter` so room events emitted on Node A publish to a Redis Pub/Sub cluster and fan out to peers on Node B.
3. **Partitioning**: Partition conversation documents by `conversationId` hash across MongoDB Atlas shards.
4. **Message Ingestion**: Offload heavy message write pipelines to an Apache Kafka or RabbitMQ buffer before batch-persisting to MongoDB.

---

### 14. Testing: What is your testing philosophy for full-stack applications?
**Answer**:  
I apply the **Testing Pyramid**:
- **Integration Tests (41 Jest tests)**: Using `mongodb-memory-server`, we spin up a real in-memory MongoDB engine in 2 seconds to validate repository methods, authentication, atomic counters, recommendation math, and Zod validators against live Mongoose queries.
- **Unit & Component Tests (8 Vitest tests)**: Test client-side stores, time formatters, and brand components in a fast `jsdom` sandbox.
- **End-to-End Tests (Playwright)**: Test critical user journeys across real browsers: authenticating, toggling Vibe Swap, scrolling the Waste of Time reel feed, and viewing Swap Duets.

---

### 15. Trade-offs: What was the biggest architectural compromise you made in this project?
**Answer**:  
*Compromise*: Choosing an in-process algorithm scoring calculation over an asynchronous offline recommendation pipeline (such as Apache Spark or Python vector embeddings).  
*Reasoning*: For an early-stage production platform, an in-process mathematical formula combining engagement metrics, recency decay, and mood matching—cached aggressively in Redis—delivers sub-40ms response times without the infrastructure overhead of managing dedicated machine learning inference clusters. As user activity scales to millions of events per hour, the scoring engine can easily transition to an offline ML pipeline with pre-computed candidate sets streamed to Redis.
