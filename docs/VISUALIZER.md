# Visualizer breakdown

How the web dashboard is built and how it connects to the bot.

---

## 1. Two processes, two ports

| Port | Process       | Protocol  | Purpose                          |
|------|---------------|-----------|----------------------------------|
| **3333** | Next.js (viz) | HTTP      | Serve UI; browser opens this     |
| **3334** | Bot           | WebSocket | Broadcast BotState to UI         |

- **Bot** (`npm run bot`): Runs Polymarket/BTC logic, prints terminal dashboard, and (when `VISUALIZER_ENABLE` is not `false`) starts a WebSocket server on 3334 and broadcasts structured **BotState** each tick. No HTTP server.
- **Visualizer** (`npm run viz`): Next.js app that binds to 3333 and serves the UI. It connects to `ws://localhost:3334`, receives `{ type: "state", state: BotState }` messages, and re-renders. No terminal parsing.

---

## 2. Bot side

- **`src/state.js`**  
  `buildBotState(vars)` builds a structured object from the same variables used for terminal rendering (market, prices, strike, predict, ta, betAdvantage, regime, session, etTime). No guessing; all fields come from the main loop.

- **`src/visualizer/wsServer.js`**  
  - `startWsServer(port)` – starts WebSocket server on `VIS_WS_PORT` (default 3334). Only called when `CONFIG.visualizer.enable` is true.  
  - `broadcastState(state)` – sends `JSON.stringify({ type: "state", state })` to all connected clients.  
  - Logs: `[viz] WS server on ws://localhost:3334` and periodically `[viz] broadcast state to N client(s)`.

- **`src/index.js`**  
  - Main loop unchanged: terminal render every tick.  
  - Each tick: `buildBotState({ ... })` then `broadcastState(botState)` when visualizer is enabled.

---

## 3. Visualizer app (`visualizer/`)

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind, shadcn-style components (Card, Badge, Separator, Progress).
- **Entry:** `src/app/layout.tsx`, `src/app/page.tsx`.
- **Data:** `useBotState()` hook opens `ws://localhost:NEXT_PUBLIC_VIS_WS_PORT` (default 3334), listens for `{ type: "state", state }`, updates React state. No polling of HTTP.
- **UI:** Bloomberg-terminal layout with top bar, SETUP QUALITY module, Market card (title, slug, time left), Bet advantage card, Odds (UP/DOWN, liquidity), Strike (price to beat, current, diff), Prediction (progress bar), TA snapshot (badges), Session. Resilient when state is null (shows “Waiting for bot…”).

---

## 4. Env vars

| Variable | Default | Where   | Description |
|----------|---------|---------|-------------|
| `VISUALIZER_ENABLE` | `true` | Bot     | `false` = bot does not start WS server (terminal-only). |
| `VIS_WS_PORT` | `3334` | Bot     | Port for WebSocket server. |
| `NEXT_PUBLIC_VIS_WS_PORT` | `3334` | Visualizer | Port the UI uses to connect to the bot. |

---

## 5. Run commands

| Goal | Command |
|------|--------|
| Bot only (terminal) | `npm run bot` or `npm start` |
| Bot without WS | `VISUALIZER_ENABLE=false npm run bot` |
| UI only (dev) | `npm run viz` (from repo root) or `cd visualizer && npm run dev` |
| Both (2 terminals) | Terminal 1: `npm run bot`; Terminal 2: `npm run viz`; Browser: http://localhost:3333 |

---

## 6. Files

**Bot:**  
- `src/state.js` – BotState builder  
- `src/visualizer/wsServer.js` – WS server + broadcast  
- `src/index.js` – main loop, terminal render, buildBotState + broadcastState each tick  
- `src/config.js` – visualizer.enable, visualizer.wsPort  

**Visualizer:**  
- `visualizer/src/app/page.tsx` – main page, useBotState, Dashboard  
- `visualizer/src/hooks/useBotState.ts` – WebSocket client  
- `visualizer/src/types/botState.ts` – BotState interface (duplicate of bot shape)  
- `visualizer/src/components/ui/*` – Card, Badge, Separator, Progress  

**Docs:**  
- `docs/ROOT_CAUSE_AND_FIX.md` – why “localhost invalid response” happened and how it was fixed  
- `docs/VISUALIZER.md` – this file  
