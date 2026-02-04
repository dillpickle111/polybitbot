import { cn } from "@/lib/utils";
import { AlertCircle, Info, Lightbulb } from "lucide-react";

type CalloutVariant = "info" | "warning" | "tip";

const variantStyles: Record<CalloutVariant, { icon: typeof Info; className: string }> = {
  info: {
    icon: Info,
    className: "border-l-border bg-muted/50",
  },
  warning: {
    icon: AlertCircle,
    className: "border-l-amber-500/50 bg-amber-500/5",
  },
  tip: {
    icon: Lightbulb,
    className: "border-l-primary/50 bg-primary/5",
  },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ variant = "info", title, children, className }: CalloutProps) {
  const { icon: Icon, className: variantClass } = variantStyles[variant];
  return (
    <div
      className={cn(
        "my-6 rounded-md border-l-4 pl-4 pr-4 py-3",
        variantClass,
        className
      )}
    >
      <div className="flex gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          {title && <p className="mb-1 font-semibold text-foreground">{title}</p>}
          <div className="text-sm text-muted-foreground [&>p]:mt-0 [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
