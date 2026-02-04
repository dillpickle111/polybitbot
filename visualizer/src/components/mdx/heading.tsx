import { cn } from "@/lib/utils";

function slugify(text: string) {
  return String(text).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as: "h1" | "h2" | "h3" | "h4";
  children: React.ReactNode;
}

const headingStyles = {
  h1: "scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0",
  h2: "scroll-m-20 border-b border-border pb-2 text-xl font-semibold tracking-tight first:mt-0 mt-8",
  h3: "scroll-m-20 text-lg font-semibold tracking-tight mt-6",
  h4: "scroll-m-20 text-base font-semibold tracking-tight mt-6",
};

export function Heading({ as: Tag, children, className, ...props }: HeadingProps) {
  const text = typeof children === "string" ? children : String(children);
  const id = slugify(text);

  return (
    <Tag id={id} className={cn(headingStyles[Tag], className)} {...props}>
      <a href={`#${id}`} className="group inline-flex items-center no-underline hover:underline">
        <span className="mr-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          #
        </span>
        {children}
      </a>
    </Tag>
  );
}
