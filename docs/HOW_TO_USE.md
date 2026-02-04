# How to use the bot and visualizer

## One-time setup

From the **project root** (`PolymarketBTC15mAssistant-1/`):

```bash
# 1. Install bot dependencies (if not already done)
npm install

# 2. Install visualizer dependencies
cd visualizer && npm install && cd ..
```

## Running everything

Use **two terminals**.

### Terminal 1 – Bot

From the project root:

```bash
npm run bot
```

You should see:

- `[viz] WS server on ws://localhost:3334`
- The terminal dashboard (market, TA, BET ADVANTAGE, Polymarket, etc.) updating every second

Leave this running.

### Terminal 2 – Visualizer (Next.js UI)

From the project root:

```bash
npm run viz
```

Or from the visualizer folder:

```bash
cd visualizer && npm run dev
```

You should see:

- `▲ Next.js 14.x.x`
- `- Local: http://localhost:3333`
- `✓ Ready in ...`

Leave this running.

### Browser

Open:

**http://localhost:3333**

- **Connected (green):** The UI is receiving live state from the bot. Numbers update as the bot ticks.
- **Waiting for bot…:** The UI is running but the bot is not, or the bot’s WebSocket server is not running. Start the bot in Terminal 1.
- **Start the bot…:** Same as above; start the bot to see data.

## What you’ll see

- **Header:** “Polymarket BTC 15m” and connection status (Connected / Waiting for bot).
- **Market:** Current market title, slug, time left, regime.
- **Bet advantage:** Whether the bot suggests a bet (ENTER UP/DOWN) or no trade, plus the full interpretation.
- **Odds:** UP/DOWN prices (¢) and liquidity.
- **Strike:** Price to beat, current price, diff.
- **Prediction:** LONG vs SHORT (progress bar).
- **TA snapshot:** Heiken Ashi, RSI, MACD, deltas, VWAP.
- **Session:** ET time and session label.

All of this is the same data the terminal shows; it comes over WebSocket, not by parsing the terminal.

## Terminal-only (no visualizer)

To run only the bot and use the terminal dashboard:

```bash
VISUALIZER_ENABLE=false npm run bot
```

No WebSocket server is started. The UI at http://localhost:3333 can still be opened (if you run `npm run viz` separately) but will show disconnected.

## If something doesn’t work

1. **“Invalid response” or 404 at http://localhost:3333**  
   Make sure you’re starting the **visualizer** with `npm run viz`, not the bot. The bot does not serve HTTP on 3333.

2. **UI shows “Waiting for bot…”**  
   Start the bot in another terminal with `npm run bot`. You should see `[viz] WS server on ws://localhost:3334`.

3. **Next.js 500 or PostCSS error**  
   Restart the visualizer (Ctrl+C in Terminal 2, then `npm run viz` again). If you changed `postcss.config.js`, a restart is required.

4. **Port already in use**  
   - Bot WS: change port with `VIS_WS_PORT=3335 npm run bot`, and in the visualizer set `NEXT_PUBLIC_VIS_WS_PORT=3335` (e.g. in `visualizer/.env.local`).
   - Next.js: change port with `npm run dev -- -p 3335` and open http://localhost:3335.

## Env vars (optional)

| Variable | Default | Where to set |
|----------|---------|----------------|
| `VISUALIZER_ENABLE` | `true` | Bot env; set to `false` for terminal-only. |
| `VIS_WS_PORT` | `3334` | Bot env; WebSocket server port. |
| `NEXT_PUBLIC_VIS_WS_PORT` | `3334` | Visualizer env (e.g. `visualizer/.env.local`); port the UI uses to connect to the bot. |
