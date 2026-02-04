import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "About",
  description: "About Signal",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container flex-1 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="mt-4 text-muted-foreground leading-7">
          Signal is an analytics tool for Polymarket&apos;s Bitcoin Up or Down 15-minute prediction markets. It combines technical analysis, market microstructure, and a robust edge model to surface probabilistic insights.
        </p>
        <p className="mt-4 text-muted-foreground leading-7">
          This tool is for research and education only. It does not provide financial advice. Use at your own risk.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
