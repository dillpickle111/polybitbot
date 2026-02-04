import { TableOfContents } from "@/components/table-of-contents";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface MdxPageLayoutProps {
  children: React.ReactNode;
  tocItems: TocItem[];
}

export function MdxPageLayout({ children, tocItems }: MdxPageLayoutProps) {
  return (
    <div className="flex gap-8">
      <article className="min-w-0 max-w-[65ch] flex-1 text-base leading-7">
        {children}
      </article>
      <TableOfContents items={tocItems} />
    </div>
  );
}
