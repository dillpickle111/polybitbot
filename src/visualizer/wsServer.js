import { WebSocketServer } from "ws";

let wss = null;

/**
 * Start WebSocket server for visualizer. Bind to VIS_WS_PORT (default 3334).
 * Only call when VISUALIZER_ENABLE is not "false".
 * @param {number} port
 * @returns {void}
 */
export function startWsServer(port = 3334) {
  if (wss) return;
  wss = new WebSocketServer({ port, host: "127.0.0.1" });
  wss.on("listening", () => {
    console.log(`[viz] WS server on ws://localhost:${port}`);
  });
  wss.on("error", (err) => {
    console.error("[viz] WS server error:", err?.message ?? err);
  });
}

/**
 * Broadcast state to all connected clients. Message shape: { type: "state", state: BotState }.
 * @param {ReturnType<import("../state.js")["buildBotState"]>} state
 */
export function broadcastState(state) {
  if (!wss) return;
  const payload = JSON.stringify({ type: "state", state });
  const clients = wss.clients ?? [];
  let sent = 0;
  for (const client of clients) {
    if (client.readyState === 1) {
      try {
        client.send(payload);
        sent += 1;
      } catch (e) {
        // ignore
      }
    }
  }
  if (sent > 0 && Math.floor(Date.now() / 10000) !== (broadcastState._lastLogSec ?? 0)) {
    broadcastState._lastLogSec = Math.floor(Date.now() / 10000);
    console.log(`[viz] broadcast state to ${sent} client(s)`);
  }
}
