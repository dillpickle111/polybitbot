#!/usr/bin/env node
/**
 * Runs the bot with INGEST_URL set for the Bloomberg terminal UI.
 * Cross-platform: sets env before spawning.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const env = { ...process.env, INGEST_URL: "http://localhost:3333/api/ingest" };
const child = spawn("node", ["src/index.js"], {
  cwd: root,
  env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
