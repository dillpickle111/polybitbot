# Polymarket BTC 15m Assistant

A real-time analytics assistant for Polymarket **"Bitcoin Up or Down" 15-minute** markets. Public-facing product site with docs, whitepaper, and live dashboard.

## Site Overview

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/app` | Live dashboard (behind disclaimer gate) |
| `/docs` | Documentation index |
| `/docs/*` | MDX docs (Overview, Architecture, Data Sources, Edge Math, Risk + Limits, Local Development, Deployment) |
| `/whitepaper` | MDX whitepaper |
| `/changelog` | Release feed |
| `/about` | About page |

**View on GitHub:** [https://github.com/FrondEnt/PolymarketBTC15mAssistant](https://github.com/FrondEnt/PolymarketBTC15mAssistant)

## Quick Start

```bash
# Install
npm install
cd visualizer && npm install

# Run (bot + UI)
npm run dev
```

Open **http://localhost:3333** — landing at `/`, dashboard at `/app`, docs at `/docs`.

## What It Combines

- Polymarket market selection + UP/DOWN prices + liquidity
- Polymarket live WS **Chainlink BTC/USD CURRENT PRICE** (same feed shown on the Polymarket UI)
- Fallback to on-chain Chainlink (Polygon) via HTTP/WSS RPC
- Binance spot price for reference
- Short-term TA snapshot (Heiken Ashi, RSI, MACD, VWAP, Delta 1/3m)
- A simple live **Predict (LONG/SHORT %)** derived from the assistant’s current TA scoring

## Requirements

- Node.js **18+** (https://nodejs.org/en)
- npm (comes with Node)


## Run from terminal (step-by-step)

### 1) Clone the repository

```bash
git clone https://github.com/FrondEnt/PolymarketBTC15mAssistant.git
```

Alternative (no git):

- Click the green `<> Code` button on GitHub
- Choose `Download ZIP`
- Extract the ZIP
- Open a terminal in the extracted project folder

Then open a terminal in the project folder.

### 2) Install dependencies

```bash
npm install
```

### 3) (Optional) Set environment variables

You can run without extra config (defaults are included), but for more stable Chainlink fallback it’s recommended to set at least one Polygon RPC.

#### Windows PowerShell (current terminal session)

```powershell
$env:POLYGON_RPC_URL = "https://polygon-rpc.com"
$env:POLYGON_RPC_URLS = "https://polygon-rpc.com,https://rpc.ankr.com/polygon"
$env:POLYGON_WSS_URLS = "wss://polygon-bor-rpc.publicnode.com"
```

Optional Polymarket settings:

```powershell
$env:POLYMARKET_AUTO_SELECT_LATEST = "true"
# $env:POLYMARKET_SLUG = "btc-updown-15m-..."   # pin a specific market
```

#### Windows CMD (current terminal session)

```cmd
set POLYGON_RPC_URL=https://polygon-rpc.com
set POLYGON_RPC_URLS=https://polygon-rpc.com,https://rpc.ankr.com/polygon
set POLYGON_WSS_URLS=wss://polygon-bor-rpc.publicnode.com
```

Optional Polymarket settings:

```cmd
set POLYMARKET_AUTO_SELECT_LATEST=true
REM set POLYMARKET_SLUG=btc-updown-15m-...
```

Notes:
- These environment variables apply only to the current terminal window.
- If you want permanent env vars, set them via Windows System Environment Variables or use a `.env` loader of your choice.

## Configuration

This project reads configuration from environment variables.

You can set them in your shell, or create a `.env` file and load it using your preferred method.

### Polymarket

- `POLYMARKET_AUTO_SELECT_LATEST` (default: `true`)
  - When `true`, automatically picks the latest 15m market.
- `POLYMARKET_SERIES_ID` (default: `10192`)
- `POLYMARKET_SERIES_SLUG` (default: `btc-up-or-down-15m`)
- `POLYMARKET_SLUG` (optional)
  - If set, the assistant will target a specific market slug.
- `POLYMARKET_LIVE_WS_URL` (default: `wss://ws-live-data.polymarket.com`)

### Chainlink on Polygon (fallback)

- `CHAINLINK_BTC_USD_AGGREGATOR`
  - Default: `0xc907E116054Ad103354f2D350FD2514433D57F6f`

HTTP RPC:
- `POLYGON_RPC_URL` (default: `https://polygon-rpc.com`)
- `POLYGON_RPC_URLS` (optional, comma-separated)
  - Example: `https://polygon-rpc.com,https://rpc.ankr.com/polygon`

WSS RPC (optional but recommended for more real-time fallback):
- `POLYGON_WSS_URL` (optional)
- `POLYGON_WSS_URLS` (optional, comma-separated)

### Proxy support

The bot supports HTTP(S) proxies for both HTTP requests (fetch) and WebSocket connections.

Supported env vars (standard):

- `HTTPS_PROXY` / `https_proxy`
- `HTTP_PROXY` / `http_proxy`
- `ALL_PROXY` / `all_proxy`

Examples:

PowerShell:

```powershell
$env:HTTPS_PROXY = "http://127.0.0.1:8080"
# or
$env:ALL_PROXY = "socks5://127.0.0.1:1080"
```

CMD:

```cmd
set HTTPS_PROXY=http://127.0.0.1:8080
REM or
set ALL_PROXY=socks5://127.0.0.1:1080
```

#### Proxy with username + password (simple guide)

1) Take your proxy host and port (example: `1.2.3.4:8080`).

2) Add your login and password in the URL:

- HTTP/HTTPS proxy:
  - `http://USERNAME:PASSWORD@HOST:PORT`
- SOCKS5 proxy:
  - `socks5://USERNAME:PASSWORD@HOST:PORT`

3) Set it in the terminal and run the bot.

PowerShell:

```powershell
$env:HTTPS_PROXY = "http://USERNAME:PASSWORD@HOST:PORT"
npm start
```

CMD:

```cmd
set HTTPS_PROXY=http://USERNAME:PASSWORD@HOST:PORT
npm start
```

Important: if your password contains special characters like `@` or `:` you must URL-encode it.

Example:

- password: `p@ss:word`
- encoded: `p%40ss%3Aword`
- proxy URL: `http://user:p%40ss%3Aword@1.2.3.4:8080`

## Run

### Terminal only (bot)

```bash
npm start
# or
npm run bot
```

The bot runs the Polymarket/BTC logic and prints the dashboard in the terminal every second.

### Web visualizer (Next.js + shadcn)

The visualizer is a **separate Next.js app** that shows live bot state in the browser. It does **not** parse terminal output; the bot broadcasts structured JSON over WebSocket.

**Two terminals:**

1. **Terminal 1 – bot (WebSocket on 3334):**
   ```bash
   npm run bot
   ```
   You should see: `[viz] WS server on ws://localhost:3334`

2. **Terminal 2 – UI (HTTP on 3333):**
   ```bash
   npm run viz
   ```
   First time: `cd visualizer && npm install` then `npm run dev`.

3. **Browser:** open **http://localhost:3333**

The UI connects to `ws://localhost:3334` and updates live. If the bot is not running, the UI loads but shows “Waiting for bot…”.

**Env vars:**

| Variable | Default | Description |
|----------|---------|-------------|
| `VISUALIZER_ENABLE` | `true` | Set to `false` to run bot without starting the WS server (terminal-only). |
| `VIS_WS_PORT` | `3334` | Port the bot’s WebSocket server binds to. |
| `NEXT_PUBLIC_VIS_WS_PORT` | `3334` | Port the Next.js app uses to connect to the bot (set in visualizer if different). |

**Terminal-only mode (no WebSocket):**

```bash
VISUALIZER_ENABLE=false npm run bot
```

The bot runs as before; no WS server is started. The UI at http://localhost:3333 can still be opened but will show disconnected.

**Root cause of “localhost invalid response”:** Previously the bot served the dashboard on 3333; path/timing issues caused 404 or invalid HTTP. This is fixed by serving the UI from Next.js on 3333 and the bot only exposing WebSocket on 3334. See `docs/ROOT_CAUSE_AND_FIX.md`.

**Step-by-step:** See `docs/HOW_TO_USE.md` for setup, two-terminal run, and troubleshooting.

**Customization & hotkeys (dashboard at /app):**

The visualizer uses a modern YC-style layout with a Settings drawer. Options are saved in `localStorage`.

| Hotkey | Action |
|--------|--------|
| `⌘K` / `Ctrl+K` | Open command palette — jump to modules, toggle visibility |

**Settings (gear icon, stored in localStorage):**
- **Density:** Comfortable / Compact — padding and spacing
- **Accent color:** green / cyan / purple — highlight color
- **Module visibility:** show/hide Setup Quality, Market Prices, BTC Price, Conditions, TA Snapshot, Microstructure, Sources

**SETUP QUALITY:** 0–100 score (Poor/Fair/Good/Great) with one-line rationale. "View details" expands the breakdown (liquidity/cost, volatility regime, trend vs chop, signal agreement).

### Bloomberg terminal UI (one command)

A **Bloomberg-style terminal** is available at `/terminal` with a dark, dense, keyboard-first layout.

**One command (runs bot + UI together):**

```bash
npm run dev
```

This starts:
1. **UI** on http://localhost:3333 (Next.js + WebSocket + ingest API)
2. **Bot** with `INGEST_URL` set, POSTing snapshots to `/api/ingest` every tick

**Browser:** open **http://localhost:3333/terminal**

**Or run separately (two terminals):**

1. **Terminal 1 – UI:**
   ```bash
   npm run dev:ui
   ```
   (or `cd visualizer && npm run dev`)

2. **Terminal 2 – Bot with ingest:**
   ```bash
   INGEST_URL=http://localhost:3333/api/ingest npm run bot
   ```
   On Windows CMD: `set INGEST_URL=http://localhost:3333/api/ingest && npm run bot`

   On Windows PowerShell: `$env:INGEST_URL="http://localhost:3333/api/ingest"; npm run bot`

3. **Browser:** http://localhost:3333/terminal

**Terminal keyboard shortcuts:**
- `g` – Toggle green/cyan theme
- `r` – Reconnect stream
- `s` – Pause/resume updates
- `?` – Show help modal

**Smoke test (exact steps):**
1. `npm install` (from project root)
2. `cd visualizer && npm install` (first time only)
3. `npm run dev` (from project root)
4. Wait ~5–10 seconds for the bot to fetch data and POST to ingest
5. Open http://localhost:3333/terminal in a browser
6. Verify: connection status shows **LIVE** (green), BTC price and market panels populate
7. Press `?` to open help modal, `g` to toggle green/cyan theme, `s` to pause updates

### Stop

Press `Ctrl + C` in the terminal.

### Update to latest version

```bash
git pull
npm install
npm start
```

## Notes / Troubleshooting

- If you see no Chainlink updates:
  - Polymarket WS might be temporarily unavailable. The bot falls back to Chainlink on-chain price via Polygon RPC.
  - Ensure at least one working Polygon RPC URL is configured.
- If the console looks like it “spams” lines:
  - The renderer uses `readline.cursorTo` + `clearScreenDown` for a stable, static screen, but some terminals may still behave differently.

## Build

```bash
npm run build          # From project root (builds visualizer)
cd visualizer && npm run build  # Visualizer only
```

Both should complete without errors. The visualizer is a Next.js app with marketing landing (`/`), docs (`/docs`), whitepaper (`/whitepaper`), changelog (`/changelog`), about (`/about`), and the live dashboard (`/app`). Use `⌘K` (or `Ctrl+K`) for the command palette.

**OG image:** Add `visualizer/public/og.png` (1200×630) for social sharing previews. Metadata references `/og.png`.

## View on GitHub

[https://github.com/FrondEnt/PolymarketBTC15mAssistant](https://github.com/FrondEnt/PolymarketBTC15mAssistant)

## Safety

This is not financial advice. Use at your own risk. The dashboard uses PASS/WATCH language; no "trade now" or buy recommendations.

created by @krajekis
