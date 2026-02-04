import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";
import { Heading, CodeBlock, Callout } from "@/components/mdx";

const contentDir = path.join(process.cwd(), "content");

export const mdxComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h1" {...props}>{children}</Heading>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h2" {...props}>{children}</Heading>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h3" {...props}>{children}</Heading>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h4" {...props}>{children}</Heading>
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-7 [&:not(:first-child)]:mt-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 ml-6 list-disc [&>li]:mt-1" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-4 ml-6 list-decimal [&>li]:mt-1" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <CodeBlock {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary no-underline hover:underline underline-offset-4" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="mt-6 border-l-2 border-border pl-6 italic text-muted-foreground" {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-border" {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="border-b border-border transition-colors hover:bg-muted/50" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="h-12 px-4 text-left align-middle font-medium" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="p-4 align-middle" {...props} />
  ),
  Callout,
};

export function getDocBySlug(slug: string, base = "docs") {
  const basePath = path.join(contentDir, base);
  const filePath = path.join(basePath, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data, content };
}

export function getAllDocSlugs(base = "docs") {
  const basePath = path.join(contentDir, base);
  if (!fs.existsSync(basePath)) return [];
  return fs.readdirSync(basePath)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function MDXContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={mdxComponents} />;
}

export function extractHeadings(source: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const items: { id: string; text: string; level: number }[] = [];
  let m;
  while ((m = headingRegex.exec(source)) !== null) {
    const level = m[1].length;
    const text = m[2].replace(/#+\s*$/, "").trim();
    const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    items.push({ id, text, level });
  }
  return items;
}
