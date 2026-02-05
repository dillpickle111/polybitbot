import { Redis } from "@upstash/redis";
import type { BotState } from "@/types/botState";

const KV_KEY = "polybitbot:state";
const isProduction = process.env.NODE_ENV === "production";

const PAUSED_RESPONSE = {
  updatedAt: null as number | null,
  status: "paused" as const,
  note: "Bot paused",
};

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

let memoryStore: BotState | null = null;

export async function setState(state: BotState): Promise<void> {
  if (process.env.BOT_DISABLED === "true") return;
  const redis = getRedis();
  if (redis) {
    await redis.set(KV_KEY, JSON.stringify(state));
  } else if (!isProduction) {
    memoryStore = state;
  } else {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production. In-memory fallback is disabled."
    );
  }
}

export async function getState(): Promise<BotState | null> {
  if (process.env.BOT_DISABLED === "true") return PAUSED_RESPONSE as unknown as BotState | null;
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(KV_KEY);
    if (raw == null) return null;
    if (typeof raw === "string") return JSON.parse(raw) as BotState;
    return raw as BotState;
  }
  if (!isProduction) return memoryStore;
  return null;
}
