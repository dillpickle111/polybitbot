import { getDocBySlug, MDXContent, extractHeadings } from "@/lib/mdx";
import { MdxPageLayout } from "@/components/mdx";
import { notFound } from "next/navigation";

export default function DocsIndexPage() {
  const doc = getDocBySlug("index");
  if (!doc) notFound();

  const headings = extractHeadings(doc.content);

  return (
    <MdxPageLayout tocItems={headings}>
      <MDXContent source={doc.content} />
    </MdxPageLayout>
  );
}
