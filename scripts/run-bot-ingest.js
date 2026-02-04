#!/usr/bin/env node
/**
 * Runs the bot with INGEST_URL from env. Set INGEST_URL to your deployed API, e.g.:
 *   INGEST_URL=https://polybitbot.vercel.app/api/ingest npm run dev:bot
 * For local UI: INGEST_URL=http://localhost:3000/api/ingest npm run dev:bot
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const env = { ...process.env };
if (!env.INGEST_URL) {
  console.warn("[run-bot-ingest] INGEST_URL not set. Bot will run but won't POST to API.");
}

const child = spawn("node", ["src/index.js"], {
  cwd: root,
  env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
