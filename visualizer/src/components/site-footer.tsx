import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          Signal. Not financial advice.
        </p>
        <a
          href="https://github.com/FrondEnt/PolymarketBTC15mAssistant"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
