"use client";

import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTenge } from "@/lib/format";
import { useRevenueBreakdown } from "@/hooks/use-revenue-breakdown";

const COLORS = [
  "#ff1f3d",
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#f59e0b",
  "#f472b6",
  "#60a5fa",
];

type View = "root" | "ps" | "bar" | "products";

const chartConfig = {} satisfies ChartConfig;

export function RevenueBreakdownChart({
  from,
  to,
}: {
  from?: string | null;
  to?: string | null;
}) {
  const { data, isLoading } = useRevenueBreakdown(from, to);

  const [view, setView] = useState<View>("root");
  const [category, setCategory] = useState("");

  if (isLoading) {
    return <Skeleton className="h-[320px] w-full rounded-xl" />;
  }

  const breakdown = data;

  let title = "Источники дохода";
  let segments: { name: string; value: number }[] = [];

  if (view === "root") {
    segments = [
      { name: "PlayStation", value: breakdown?.playstation ?? 0 },
      { name: "Бар", value: breakdown?.bar ?? 0 },
    ];
  } else if (view === "ps") {
    title = "PlayStation: зоны";
    segments = breakdown?.playstationDetails ?? [];
  } else if (view === "bar") {
    title = "Бар: категории";
    segments = breakdown?.barCategories ?? [];
  } else {
    title = `Бар: ${category}`;
    segments = (breakdown?.barProducts ?? [])
      .filter((p) => p.category === category)
      .map((p) => ({ name: p.name, value: p.value }));
  }

  const visibleSegments = segments.filter((s) => s.value > 0);
  const total = visibleSegments.reduce((sum, s) => sum + s.value, 0);

  const handleClick = (data: { name?: string }) => {
    const name = data?.name ?? "";

    if (view === "root") {
      if (name === "PlayStation") {
        setView("ps");
      } else if (name === "Бар") {
        setView("bar");
      }
    } else if (view === "bar") {
      setCategory(name);
      setView("products");
    }
  };

  const goBack = () => {
    if (view === "products") {
      setView("bar");
    } else {
      setView("root");
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {view !== "root" && (
          <button
            type="button"
            onClick={goBack}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            ← Назад
          </button>
        )}
      </div>

      <ChartContainer config={chartConfig} className="h-[240px] w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const v = Number(value);
                  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return `${String(name)} · ${pct}% · ${formatTenge(v)}`;
                }}
              />
            }
          />
          <Pie
            data={visibleSegments}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={visibleSegments.length > 1 ? 2 : 0}
            onClick={(data) => handleClick(data as { name?: string })}
          >
            {visibleSegments.map((segment, index) => (
              <Cell
                key={segment.name}
                fill={COLORS[index % COLORS.length]}
                cursor="pointer"
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="mt-4 space-y-2">
        {visibleSegments.map((segment, index) => (
          <div
            key={segment.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              {segment.name}
            </span>
            <span className="font-medium tabular-nums">
              {total > 0 ? `${Math.round((segment.value / total) * 100)}%` : "0%"}
              {" · "}
              {formatTenge(segment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
