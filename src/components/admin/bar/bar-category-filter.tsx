"use client";

import { cn } from "@/lib/utils";
import { BAR_CATEGORIES } from "@/lib/constants";

const CATEGORIES = ["Все", ...BAR_CATEGORIES];

export function BarCategoryFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === c
              ? "bg-accent text-white"
              : "border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/10",
          )}>
          {c}
        </button>
      ))}
    </div>
  );
}
