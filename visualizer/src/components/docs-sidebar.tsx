"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const docsNav: { title: string; href?: string; section?: boolean }[] = [
  { title: "Docs", section: true },
  { title: "Overview", href: "/docs" },
  { title: "Architecture", href: "/docs/architecture" },
  { title: "Data Sources", href: "/docs/data-sources" },
  { title: "Edge Math", href: "/docs/edge-math" },
  { title: "Risk + Limits", href: "/docs/risk-limits" },
  { title: "Local Development", href: "/docs/local-development" },
  { title: "Deployment", href: "/docs/deployment" },
  { title: "Whitepaper", href: "/whitepaper" },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 border-r border-border pr-6">
      <nav className="sticky top-20 space-y-0.5">
        {docsNav.map((item, i) =>
          item.section ? (
            <p key={i} className="mb-1.5 mt-5 first:mt-0 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {item.title}
            </p>
          ) : item.href ? (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-1 text-sm transition-colors rounded-sm",
                pathname === item.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          ) : null
        )}
      </nav>
    </aside>
  );
}
