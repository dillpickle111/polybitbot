# Refactor Summary: Vercel-Ready Public Deployment

## 1) File-by-File Diff Summary

### New files
- **visualizer/src/app/api/ingest/route.ts** — POST handler; accepts BotState JSON, stores in Upstash Redis (or in-memory fallback when KV not configured)
- **visualizer/src/app/api/state/route.ts** — GET handler; returns latest state or `{ timestamp: null }`
- **visualizer/vercel.json** — `{ "framework": "nextjs" }` for when visualizer is root

### Modified files
- **visualizer/package.json**
  - Scripts: `dev` → `next dev`, `start` → `next start` (removed `node server.js`)
  - Added `@upstash/redis`
  - Removed `ws`
- **visualizer/src/hooks/useBotState.ts** — Replaced WebSocket with HTTP polling to `/api/state` every 1.5s
- **visualizer/src/app/terminal/page.tsx** — Replaced WebSocket with HTTP polling to `/api/state`; added `mapToTerminalState()` for BotState → TerminalState
- **visualizer/src/app/layout.tsx** — `baseUrl` uses `VERCEL_URL` or `NEXT_PUBLIC_BASE_URL`, fallback `http://localhost:3000`
- **src/index.js** — Removed `startWsServer`, `broadcastState`, `buildIngestPayload`; POSTs `botState` directly to `INGEST_URL`
- **scripts/run-bot-ingest.js** — No longer hardcodes localhost; passes through `INGEST_URL` from env; warns if unset
- **package.json** — `dev` script sets `INGEST_URL=http://localhost:3000/api/ingest` for local bot+UI

### Deleted files
- **visualizer/server.js** — Custom Node server (WebSocket + /api/ingest + /api/state) removed; replaced by Next.js API routes

### Unchanged but now unused
- **src/visualizer/wsServer.js** — No longer imported; can be removed in a later cleanup
- **src/ingest.js** — `buildIngestPayload` no longer used; bot POSTs full BotState

---

## 2) Exact Vercel Env Vars to Set

In Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `UPSTASH_REDIS_REST_URL` | `https://xxx.upstash.io` | From [Upstash Console](https://console.upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | `AXxx...` | From Upstash |
| `NEXT_PUBLIC_BASE_URL` | `https://polybitbot.vercel.app` | Optional; for metadata/OG. Auto-derived from `VERCEL_URL` if unset |

**Vercel project settings:**
- **Root Directory:** `visualizer`
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** (auto)

---

## 3) Exact Bot Host Env Vars to Set

On Railway / Fly / Render or any always-on host running the bot:

| Variable | Value | Notes |
|----------|-------|-------|
| `INGEST_URL` | `https://polybitbot.vercel.app/api/ingest` | **Required** for dashboard/terminal to receive data |
| `POLYGON_RPC_URL` | `https://polygon-rpc.com` | Optional; improves Chainlink fallback |
| `POLYGON_RPC_URLS` | `https://polygon-rpc.com,https://rpc.ankr.com/polygon` | Optional |
| `POLYGON_WSS_URLS` | `wss://polygon-bor-rpc.publicnode.com` | Optional |
| `POLYMARKET_AUTO_SELECT_LATEST` | `true` | Default |
| `POLYMARKET_SERIES_ID` | `10192` | Default |
| `POLYMARKET_SERIES_SLUG` | `btc-up-or-down-15m` | Default |

---

## 4) How to Run Locally

### UI only (no bot data)
```bash
cd visualizer && npm install && npm run dev
```
Open http://localhost:3000 — dashboard and terminal will poll `/api/state`; shows "Waiting for bot…" / OFFLINE until bot POSTs.

### Bot only (terminal output, no UI)
```bash
npm install && npm run bot
```
Runs trading loop. To also send data to a deployed UI:
```bash
INGEST_URL=https://polybitbot.vercel.app/api/ingest npm run bot
```

### Both (UI + bot, local)
```bash
npm install
cd visualizer && npm install
cd .. && npm run dev
```
- UI: http://localhost:3000
- Bot POSTs to http://localhost:3000/api/ingest (set by `dev` script)
- Uses in-memory store when Upstash env vars are not set in visualizer

### With Upstash locally
Create `visualizer/.env.local`:
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...
```
Then `npm run dev` — state persists in Redis across restarts.
