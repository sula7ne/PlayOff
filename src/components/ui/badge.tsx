import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
