/**
 * Feasibility-adjusted edge example: raw edge → adjusted edge with 3 factors.
 * Proves technical depth without looking like a dashboard.
 */

export function Artifact() {
  const rawEdge = 8.2;
  const uncertainty = 2.1;
  const timeMult = 0.72;
  const execCost = 1.4;
  const edgeLow = rawEdge - uncertainty;
  const afterTime = edgeLow * timeMult;
  const final = afterTime - execCost;

  return (
    <div className="rounded border border-border bg-muted/30 p-5 font-mono text-sm">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Feasibility-adjusted edge (example)
      </p>
      <div className="space-y-3 text-muted-foreground">
        <div className="flex justify-between gap-4">
          <span>Raw edge (p − q)</span>
          <span className="tabular-nums text-foreground">+{rawEdge}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>− Uncertainty (90% one-sided)</span>
          <span className="tabular-nums">−{uncertainty}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>× Time multiplier</span>
          <span className="tabular-nums">× {(timeMult * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>− Exec cost (fees, spread)</span>
          <span className="tabular-nums">−{execCost}%</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-3">
          <span className="font-medium text-foreground">Adjusted edge</span>
          <span className="tabular-nums font-semibold text-primary">
            +{final.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
