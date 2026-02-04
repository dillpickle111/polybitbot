# Full Audit Paste for ChatGPT

Copy everything below the line and paste into ChatGPT.

---

## 1. Vercel deployment setup

**Root directory:** Must be set to `visualizer` in Vercel dashboard (Next.js app lives in subfolder).

**vercel.json** (at repo root):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "visualizer/.next",
  "framework": "nextjs",
  "installCommand": "cd visualizer && npm install"
}
```

**Note:** If Root Directory is set to `visualizer` in Vercel UI, the install/build may run from that folder; vercel.json may conflict. No screenshot available—user should confirm in Vercel dashboard.

---

## 2. Bot connection code (where UI fetches/calls the bot)

### A. Dashboard (`/app`) — useBotState hook

**File:** `visualizer/src/hooks/useBotState.ts`

```typescript
"use client";

import { useEffect, useState } from "react";
import type { BotState, VizMessage } from "@/types/botState";

const WS_PORT =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_VIS_WS_PORT
    ? Number(process.env.NEXT_PUBLIC_VIS_WS_PORT)
    : 3334;

export function useBotState() {
  const [state, setState] = useState<BotState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `ws://localhost:${WS_PORT}`;   // <-- HARDCODED localhost:3334
    const ws = new WebSocket(url);
    // ... rest of hook
  }, []);

  return { state, connected, error };
}
```

**Problem:** `ws://localhost:3334` is hardcoded (or uses NEXT_PUBLIC_VIS_WS_PORT). On deployed site, this points to the user's own machine. Never works in production.

---

### B. Terminal page (`/terminal`) — WebSocket connection

**File:** `visualizer/src/app/terminal/page.tsx` (line 125-128)

```typescript
const proto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
const url = `${proto}//${typeof window !== "undefined" ? window.location.host : "localhost:3333"}/ws`;
```

**Behavior:** In browser, uses `window.location.host` → e.g. `wss://your-site.vercel.app/ws`. Correct pattern for production.

**Problem:** The `/ws` endpoint is served by `visualizer/server.js` (custom Node server with WebSocket). Vercel does NOT run custom Node servers. Vercel runs Next.js in serverless mode only. So `/ws` does not exist on Vercel—request will 404 or fail.

---

### C. Layout baseUrl (metadata/OG)

**File:** `visualizer/src/app/layout.tsx` (line 7)

```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3333";
```

Used for metadataBase, OpenGraph, etc. Should be set to production URL in Vercel env vars.

---

### D. Bot ingest script (how bot sends data to UI)

**File:** `scripts/run-bot-ingest.js`

```javascript
const env = { ...process.env, INGEST_URL: "http://localhost:3333/api/ingest" };
const child = spawn("node", ["src/index.js"], { cwd: root, env, stdio: "inherit" });
```

The bot POSTs state to `INGEST_URL`. Locally that's `http://localhost:3333/api/ingest`. The visualizer's custom server (`server.js`) receives it. Bot does NOT run on Vercel—it runs locally or on a separate host.

---

## 3. package.json scripts

### Root `package.json`

```json
{
  "name": "polyassistent",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "node src/index.js",
    "bot": "node src/index.js",
    "viz": "cd visualizer && npm run dev",
    "build": "npm run build:visualizer",
    "build:visualizer": "cd visualizer && npm install && npm run build",
    "dev": "concurrently -n ui,bot -c cyan,green \"cd visualizer && npm run dev\" \"node scripts/run-bot-ingest.js\"",
    "dev:ui": "cd visualizer && npm run dev",
    "dev:bot": "node scripts/run-bot-ingest.js"
  },
  "devDependencies": { "concurrently": "^9.1.0" },
  "dependencies": {
    "ethers": "^6.11.1",
    "https-proxy-agent": "^7.0.6",
    "socks-proxy-agent": "^8.0.5",
    "undici": "^6.21.3",
    "ws": "^8.18.0"
  }
}
```

### `visualizer/package.json`

```json
{
  "name": "polymarket-visualizer",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "node server.js",
    "dev:next": "next dev -p 3333",
    "build": "next build",
    "start": "NODE_ENV=production node server.js",
    "start:next": "next start -p 3333"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@tailwindcss/typography": "^0.5.15",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "cmdk": "^1.1.1",
    "geist": "^1.5.1",
    "gray-matter": "^4.0.3",
    "lucide-react": "^0.460.0",
    "next": "14.2.18",
    "next-mdx-remote": "^5.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.4",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3"
  }
}
```

**Critical:** `dev` and `start` use `node server.js` (custom server with WebSocket + /api/ingest). Vercel does NOT run `server.js`—it runs `next build` output in serverless mode. So WebSocket and /api/ingest are never deployed.

---

## 4. Project tree (top level)

```
$ ls -la
.gitignore
docs/
package-lock.json
package.json
public/
README.md
scripts/
src/
vercel.json
visualizer/

$ ls -la visualizer
content/
next-env.d.ts
next.config.js
package-lock.json
package.json
postcss.config.cjs
server.js          <-- Custom Node server (NOT run by Vercel)
src/
tailwind.config.ts
tsconfig.json
```

---

## 5. Next.js routes / app structure

```
$ find visualizer/src/app -maxdepth 3 -type d -print
visualizer/src/app
visualizer/src/app/app
visualizer/src/app/changelog
visualizer/src/app/terminal
visualizer/src/app/about
visualizer/src/app/docs
visualizer/src/app/docs/[slug]
visualizer/src/app/whitepaper
visualizer/src/app/(content)
visualizer/src/app/(content)/docs
visualizer/src/app/(content)/docs/[slug]
visualizer/src/app/(content)/whitepaper
```

**visualizer/src/app/api:** Does NOT exist. No Next.js API routes. All /api/* is in custom server.js.

---

## 6. Custom server (visualizer/server.js) — full file

This is what serves /api/ingest, /api/state, and /ws. Vercel does NOT run this.

```javascript
const { createServer } = require("node:http");
const { parse } = require("node:url");
const next = require("next");
const { WebSocketServer } = require("ws");

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3333;

let latestState = null;
const wss = new WebSocketServer({ noServer: true });

function broadcast(data) {
  const msg = JSON.stringify({ type: "state", state: data });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/ingest") {
      // Bot POSTs state here
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          latestState = data;
          broadcast(data);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: String(e?.message ?? e) }));
        }
      });
      return;
    }

    if (req.method === "GET" && req.url === "/api/state") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(latestState ?? { ts: null }));
      return;
    }

    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "");
    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
        if (latestState) {
          ws.send(JSON.stringify({ type: "state", state: latestState }));
        }
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Terminal UI: http://localhost:${port}/terminal`);
    console.log(`> WebSocket: ws://localhost:${port}/ws`);
  });
});
```

---

## 7. Environment variables

**No .env.example in repo.** From config and code:

**Bot (src/config.js, src/index.js):**
- POLYMARKET_SLUG, POLYMARKET_SERIES_ID, POLYMARKET_SERIES_SLUG
- POLYMARKET_AUTO_SELECT_LATEST, POLYMARKET_LIVE_WS_URL
- POLYGON_RPC_URL, POLYGON_RPC_URLS, POLYGON_WSS_URLS
- CHAINLINK_BTC_USD_AGGREGATOR
- VISUALIZER_ENABLE, VIS_WS_PORT (default 3334)
- INGEST_URL (set by run-bot-ingest.js to http://localhost:3333/api/ingest)
- ROBUST_MIN_ROI, ROBUST_MIN_TIME_MULT, ROBUST_MIN_KELLY_PCT, ROBUST_FEE_PCT, ROBUST_SLIPPAGE_PCT
- HTTPS_PROXY, HTTP_PROXY, ALL_PROXY

**Visualizer (for Vercel):**
- NEXT_PUBLIC_BASE_URL (for metadata/OG)
- NEXT_PUBLIC_VIS_WS_PORT (for useBotState—currently defaults to 3334, and URL is localhost anyway)

---

## 8. Architecture summary

| Component | What it does | Runs on Vercel? |
|----------|--------------|-----------------|
| Bot (src/index.js) | Trading loop, Chainlink/Binance/Polymarket, TA, POSTs to INGEST_URL | No |
| Bot WS server (src/visualizer/wsServer.js) | WebSocket on 3334, broadcasts state | No (part of bot) |
| Visualizer server (visualizer/server.js) | Next.js + /api/ingest + /api/state + /ws | No (custom Node server) |
| Next.js app (visualizer/) | UI pages: /, /app, /terminal, /docs, etc. | Yes (static + serverless) |

**Two UIs, two connection patterns:**
1. **Dashboard (/app):** useBotState → `ws://localhost:3334` → bot's WebSocket. Hardcoded localhost. Never works when deployed.
2. **Terminal (/terminal):** WebSocket to `window.location.host/ws` → expects visualizer server.js /ws. But server.js is not run on Vercel, so /ws does not exist.

---

## 9. Quick self-audit results (grep)

```
localhost    → Found in: useBotState.ts, terminal/page.tsx (fallback), layout.tsx, server.js, docs, scripts, etc.
3333         → Port for visualizer HTTP
3334         → Port for bot WebSocket
BOT_URL      → Not found
NEXT_PUBLIC_BOT → Not found
/api/state   → In server.js (custom server, not Vercel)
```

**Verdict:** `localhost:3334` in useBotState.ts and the absence of /ws on Vercel mean the deployed app cannot reach the bot. The bot does not run on Vercel.

---

## 10. Production logs / network proof (user to provide)

- Vercel Function logs (if any)
- Build logs
- On deployed site: DevTools → Network → failing request → Request URL + Response/Console error

---

## 11. Repo link

https://github.com/dillpickle111/polybitbot (fork of FrondEnt/PolymarketBTC15mAssistant)

---

END OF AUDIT PASTE
