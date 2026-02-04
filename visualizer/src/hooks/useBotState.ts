"use client";

import { useEffect, useState } from "react";
import type { BotState, VizMessage } from "@/types/botState";

const WS_PORT =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_VIS_WS_PORT
    ? Number(process.env.NEXT_PUBLIC_VIS_WS_PORT)
    : 3334;

export function useBotState() {
  const [state, setState] = useState<BotState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `ws://localhost:${WS_PORT}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as VizMessage;
        if (msg.type === "state" && msg.state) setState(msg.state);
      } catch {
        // ignore
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setError("WebSocket error");

    return () => ws.close();
  }, []);

  return { state, connected, error };
}
