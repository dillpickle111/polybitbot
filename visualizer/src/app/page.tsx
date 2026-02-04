import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Artifact } from "@/components/landing/Artifact";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Decision intelligence for probabilistic markets.
            </h1>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              Robust edge scoring that survives uncertainty, time feasibility, and execution cost.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/docs"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                Docs
              </Link>
              <Link
                href="/whitepaper"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                Whitepaper
              </Link>
              <Link
                href="/app"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                Open App
              </Link>
            </div>
          </div>
        </section>

        {/* Artifact: Feasibility-adjusted edge */}
        <section className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <Artifact />
          </div>
        </section>

        {/* Core Insight — reduced */}
        <section className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight">Core Insight</h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Raw edges ignore uncertainty, time feasibility, and execution cost. 
              The system only surfaces a signal when edge survives a 90% one-sided discount, 
              feasible time-to-close, and cost subtraction.
            </p>
          </div>
        </section>

        {/* System — reduced */}
        <section className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight">System</h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Polymarket, Chainlink, Binance → TA probability, regime, robust edge → PASS/WATCH. 
              Analytics only; no execution.
            </p>
            <p className="mt-6">
              <Link href="/whitepaper" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                Whitepaper →
              </Link>
            </p>
          </div>
        </section>

        {/* CTAs */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl flex flex-wrap gap-6">
            <Link href="/docs" className="text-sm font-medium text-primary hover:underline underline-offset-4">
              Docs
            </Link>
            <Link href="/whitepaper" className="text-sm font-medium text-primary hover:underline underline-offset-4">
              Whitepaper
            </Link>
            <Link href="/app" className="text-sm font-medium text-primary hover:underline underline-offset-4">
              Open App
            </Link>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
