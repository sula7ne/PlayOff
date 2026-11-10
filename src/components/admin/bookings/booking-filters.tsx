"use client";

import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "ALL", label: "Все" },
  { value: "PENDING", label: "Ожидает" },
  { value: "CONFIRMED", label: "Подтверждена" },
  { value: "CANCELLED", label: "Отменена" },
] as const;

export type BookingFilter = (typeof FILTERS)[number]["value"];

export function BookingFilters({
  value,
  onChange,
}: {
  value: BookingFilter;
  onChange: (value: BookingFilter) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === filter.value
              ? "bg-accent text-white"
              : "border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/10",
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
