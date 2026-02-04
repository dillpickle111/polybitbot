import { getDocBySlug, MDXContent, extractHeadings } from "@/lib/mdx";
import { MdxPageLayout } from "@/components/mdx";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Whitepaper",
  description: "Signal — Methodology, robust edge formula, and design rationale",
  openGraph: {
    title: "Whitepaper | Signal",
    description: "Methodology and design for robust edge scoring in prediction markets",
  },
};

export default function WhitepaperPage() {
  const doc = getDocBySlug("whitepaper", ".");
  if (!doc) notFound();

  const headings = extractHeadings(doc.content);

  return (
    <MdxPageLayout tocItems={headings}>
      <MDXContent source={doc.content} />
    </MdxPageLayout>
  );
}
