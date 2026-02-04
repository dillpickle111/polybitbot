# Root cause: "localhost invalid response" and fix

## What was wrong

- **Port 3333 was served by the bot** via an in-process HTTP server (`http.createServer` in `src/index.js`). That server:
  - Served static files from `public/` (built React/Vite app) and `/api/state` JSON.
  - Depended on `public/index.html` and `public/assets/*` existing and being readable at request time.
- **Why the browser showed "invalid response" or 404:**
  1. **Path / timing:** The server used `fs.readFile` (async) for `GET /`. Depending on cwd, path resolution, or timing, the file could be missing or the response could be sent incorrectly, leading to 404 or malformed HTTP.
  2. **Single process:** The bot and the “visualizer” were the same process. If the bot hit an error or the static root was wrong, localhost:3333 returned errors or “invalid response” instead of a valid HTML page.
  3. **No real separation:** The UI expected to be served by the bot, so “fix visualizer” was tied to fixing the bot’s HTTP server and file serving, which was brittle.

## Fix: separate UI and bot

- **Next.js UI on 3333 (HTTP):** The visualizer is now a **separate Next.js app** in `visualizer/`. You run it with `npm run viz` (or `cd visualizer && npm run dev`). It binds to **port 3333** and serves a normal HTTP page. The browser always gets valid HTML/JS from Next.js, so “invalid response” from the UI server is eliminated.
- **Bot on 3334 (WebSocket only):** The bot **no longer starts an HTTP server**. It only runs the trading loop and, when `VISUALIZER_ENABLE` is not `false`, starts a **WebSocket server on port 3334** and broadcasts structured **BotState** JSON each tick. No HTTP, no static files, no binding to 3333.
- **Structured state:** The UI gets state via **WebSocket messages** `{ type: "state", state: BotState }` built from the same variables used for the terminal (see `src/state.js`). There is no parsing of terminal output.

So:

- **“Invalid response”** was fixed by **not** serving the app from the bot; the app is served by Next.js on 3333.
- **404** was fixed by no longer relying on the bot to serve `index.html`; the only thing on 3333 is the Next.js dev server (or a built Next.js app), which always serves a valid page.

## Current architecture

| Port | Process        | Protocol | Purpose                          |
|------|-----------------|----------|----------------------------------|
| 3333 | Next.js (viz)  | HTTP     | Serve UI; browser opens this     |
| 3334 | Bot             | WebSocket| Broadcast BotState to UI         |

- **Terminal:** Unchanged; bot still renders the same dashboard in the terminal every tick.
- **VISUALIZER_ENABLE=false:** Bot does not start the WS server; UI still loads on 3333 but shows “Waiting for bot…” / disconnected.
