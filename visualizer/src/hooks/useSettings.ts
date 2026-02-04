"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "polymarket-viz-settings";

export type LayoutDensity = "comfortable" | "compact";
export interface ModuleVisibility {
  setupQuality: boolean;
  marketPrices: boolean;
  btcPrice: boolean;
  botVsMarket: boolean;
  edgeQuality: boolean;
  robustEdge: boolean;
  conditions: boolean;
  taSnapshot: boolean;
  microstructure: boolean;
  sources: boolean;
}

export interface VizSettings {
  layoutDensity: LayoutDensity;
  modules: ModuleVisibility;
}

const DEFAULT_SETTINGS: VizSettings = {
  layoutDensity: "comfortable",
  modules: {
    setupQuality: true,
    marketPrices: true,
    btcPrice: true,
    botVsMarket: true,
    edgeQuality: true,
    robustEdge: true,
    conditions: true,
    taSnapshot: true,
    microstructure: true,
    sources: true,
  },
};

function load(): VizSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<VizSettings> & { accentColor?: unknown };
      const { accentColor: _, ...rest } = parsed;
      return {
        ...DEFAULT_SETTINGS,
        ...rest,
        modules: { ...DEFAULT_SETTINGS.modules, ...parsed?.modules },
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function save(s: VizSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<VizSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(load());
  }, []);

  const update = useCallback((patch: Partial<VizSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.modules) {
        next.modules = { ...prev.modules, ...patch.modules };
      }
      save(next);
      return next;
    });
  }, []);

  const toggleModule = useCallback((key: keyof ModuleVisibility) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        modules: { ...prev.modules, [key]: !prev.modules[key] },
      };
      save(next);
      return next;
    });
  }, []);

  return { settings, update, toggleModule };
}
