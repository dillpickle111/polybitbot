import { getDocBySlug, getAllDocSlugs, MDXContent, extractHeadings } from "@/lib/mdx";
import { MdxPageLayout } from "@/components/mdx";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.filter((s) => s !== "index").map((slug) => ({ slug }));
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const doc = getDocBySlug(params.slug);
  if (!doc) notFound();

  const headings = extractHeadings(doc.content);

  return (
    <MdxPageLayout tocItems={headings}>
      <MDXContent source={doc.content} />
    </MdxPageLayout>
  );
}
