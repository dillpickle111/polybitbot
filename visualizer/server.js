/**
 * Custom server: Next.js + WebSocket + /api/ingest
 * Used for Bloomberg terminal UI at /terminal
 */
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
