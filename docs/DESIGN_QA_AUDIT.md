# Design QA Audit — Screenshot-based (Simulated)

## Route: `/` (Landing)

1. **No visual proof of technical depth** — All text, no artifact. Stripe/Vercel show one concrete example (API response, deployment log, etc.).
2. **Essay-like copy density** — Core Insight, System, Methodology sections read like paragraphs; could be 30% tighter.
3. **Redundant CTAs** — Hero has Docs/Whitepaper/Open App; bottom section repeats same three links.
4. **Generic pre block** — `Data → Inference → Feasibility → Output` feels placeholder, not a real artifact.
5. **Section rhythm too uniform** — All sections use same `py-16 md:py-24`; no visual hierarchy via spacing variation.

## Route: `/docs`

1. **Heading scale too large** — H1 at `text-4xl`, H2 at `text-3xl` feels like a blog, not product docs.
2. **Paragraph spacing too airy** — `[&:not(:first-child)]:mt-6` on every p creates excessive vertical rhythm.
3. **List spacing loose** — `[&>li]:mt-2` + `my-6` makes lists feel floaty.
4. **TOC active state subtle** — Only font-medium change; no clear "you are here" indicator.
5. **Sidebar section labels** — `text-xs` + `mb-2 mt-4` could be tighter; "Docs" / "Whitepaper" as section headers feel cramped.

## Route: `/whitepaper`

1. **Same as docs** — Heading scale, paragraph/list spacing, TOC, sidebar all identical (per spec: docs + whitepaper visually identical).
2. **Prose max-width** — Already ~65ch in mdx-layout; verify it's applied consistently.

## Route: `/app`

1. **No clear 3-zone hierarchy** — Cards are a flat grid; Decision/Evidence/Telemetry not separated.
2. **Too many metrics above fold** — 4+ cards (Bot vs Public, Setup Quality, Edge Quality, Robust Edge) before any structure.
3. **Decision buried in card** — WATCH/PASS lives inside Robust Edge card; should be primary, with reason string prominent.
4. **Evidence scattered** — Key metrics (edge, time, cost) mixed with secondary info.
5. **Telemetry not separated** — TA Snapshot, Microstructure, Sources in accordion; no clear "raw details" zone with spacing separators.
