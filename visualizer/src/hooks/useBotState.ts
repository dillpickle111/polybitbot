"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { BotState } from "@/types/botState";

const STALE_THRESHOLD_MS = 10_000;
const POLL_FRESH_MS = 1000;
const POLL_STALE_MS = 3000;
const POLL_ERROR_MS = 5000;
const POLL_PAUSED_MS = 5000;

function getStateUrl(): string {
  if (typeof window === "undefined") return "/api/state";
  return "/api/state";
}

function isFresh(updatedAt: number | null | undefined): boolean {
  if (updatedAt == null) return false;
  return Date.now() - updatedAt <= STALE_THRESHOLD_MS;
}

type PollStatus = "fresh" | "stale" | "error" | "paused";

export function useBotState(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  const [state, setState] = useState<BotState | null>(null);
  const [connected, setConnected] = useState(false);
  const [stale, setStale] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const fetchState = useCallback(async (): Promise<PollStatus> => {
    try {
      const res = await fetch(getStateUrl());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && typeof data === "object" && data.status === "paused") {
        setState(null);
        setConnected(false);
        setStale(true);
        setPaused(true);
        setError(null);
        return "paused";
      }
      if (data && typeof data === "object" && (data.timestamp != null || data.ts != null || data.market != null)) {
        const s = data as BotState;
        if (s.timestamp == null && (data as { ts?: string }).ts) {
          (s as { timestamp?: string }).timestamp = (data as { ts: string }).ts;
        }
        setState(s);
        setConnected(true);
        setPaused(false);
        setError(null);
        const fresh = isFresh(s.updatedAt);
        setStale(!fresh);
        return fresh ? "fresh" : "stale";
      }
      setState(null);
      setConnected(false);
      setStale(true);
      setPaused(false);
      return "stale";
    } catch (e) {
      setConnected(false);
      setStale(true);
      setPaused(false);
      setError(String((e as Error)?.message ?? e));
      return "error";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;
    cancelledRef.current = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const schedule = (delay: number) => {
      if (cancelledRef.current) return;
      timeoutId = setTimeout(async () => {
        if (cancelledRef.current) return;
        const status = await fetchState();
        if (cancelledRef.current) return;
        const nextDelay =
          status === "error"
            ? POLL_ERROR_MS
            : status === "paused"
              ? POLL_PAUSED_MS
              : status === "stale"
                ? POLL_STALE_MS
                : POLL_FRESH_MS;
        schedule(nextDelay);
      }, delay);
    };
    const run = async () => {
      const status = await fetchState();
      if (cancelledRef.current) return;
      const nextDelay =
        status === "error"
          ? POLL_ERROR_MS
          : status === "paused"
            ? POLL_PAUSED_MS
            : status === "stale"
              ? POLL_STALE_MS
              : POLL_FRESH_MS;
      schedule(nextDelay);
    };
    run();
    return () => {
      cancelledRef.current = true;
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [fetchState, enabled]);

  return { state, connected, stale, paused, error, refetch: fetchState };
}
