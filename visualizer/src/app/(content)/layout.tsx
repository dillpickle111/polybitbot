import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DocsSidebar } from "@/components/docs-sidebar";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container flex-1 flex gap-8 py-8">
        <DocsSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}
