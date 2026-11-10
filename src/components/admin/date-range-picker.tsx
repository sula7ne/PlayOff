"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  endOfYesterday,
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYesterday,
} from "@/lib/period";

export type DateRange = { from: Date | null; to: Date | null };

type PresetKey = "today" | "yesterday" | "week" | "month" | "all";
type ActivePreset = PresetKey | "custom";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Сегодня" },
  { key: "yesterday", label: "Вчера" },
  { key: "week", label: "За эту неделю" },
  { key: "month", label: "За этот месяц" },
  { key: "all", label: "За всё время" },
];

function getPresetRange(key: PresetKey): DateRange {
  switch (key) {
    case "today":
      return { from: startOfToday(), to: null };
    case "yesterday":
      return { from: startOfYesterday(), to: endOfYesterday() };
    case "week":
      return { from: startOfWeek(), to: null };
    case "month":
      return { from: startOfMonth(), to: null };
    default:
      return { from: null, to: null };
  }
}

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${date.getFullYear()}`;
}

export function DateRangePicker({
  range,
  onChange,
}: {
  range: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const [activePreset, setActivePreset] = useState<ActivePreset>("all");
  const [open, setOpen] = useState(false);

  const label = range.from
    ? range.to
      ? `${formatDate(range.from)} – ${formatDate(range.to)}`
      : `с ${formatDate(range.from)}`
    : "Произвольный период";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => {
            setActivePreset(preset.key);
            onChange(getPresetRange(preset.key));
          }}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            activePreset === preset.key
              ? "bg-accent text-white"
              : "border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/10",
          )}
        >
          {preset.label}
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant="outline" size="sm" />}
          className={cn(
            "gap-2",
            activePreset === "custom" ? "text-accent" : "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          {label}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            min={1}
            selected={{
              from: range.from ?? undefined,
              to: range.to ?? undefined,
            }}
            onSelect={(selection) => {
              setActivePreset("custom");
              onChange({
                from: selection?.from ?? null,
                to: selection?.to ?? null,
              });
              if (selection?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
