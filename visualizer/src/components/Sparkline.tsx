"use client";

import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[] | null;
  className?: string;
  height?: number;
  accentClass?: string;
}

export function Sparkline({
  data,
  className,
  height = 48,
  accentClass = "text-primary",
}: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className={cn("flex items-center justify-center text-muted-foreground text-xs", className)}
        style={{ height }}
      >
        —
      </div>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${w} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={accentClass}
        points={pts.join(" ")}
      />
    </svg>
  );
}
