"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTenge } from "@/lib/format";
import { useAnalytics } from "@/hooks/use-analytics";

const chartConfig = {
  console: { label: "Аренда консолей", color: "#ff1f3d" },
  bar: { label: "Бар / Доп. услуги", color: "#22d3ee" },
} satisfies ChartConfig;

const MONTHS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

function formatTick(key: string, granularity: "hour" | "day"): string {
  if (granularity === "hour") {
    return `${key.slice(11, 13)}:00`;
  }

  const [, month, day] = key.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]}`;
}

function formatChartLabel(key: string, granularity: "hour" | "day"): string {
  const dd = key.slice(8, 10);
  const mm = key.slice(5, 7);
  const yyyy = key.slice(0, 4);

  if (granularity === "hour") {
    return `${dd}.${mm}.${yyyy} ${key.slice(11, 13)}:00`;
  }

  return `${dd}.${mm}.${yyyy}`;
}

export function RevenueChart({
  from,
  to,
}: {
  from?: string | null;
  to?: string | null;
}) {
  const { data, isLoading } = useAnalytics(from, to);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  const points = data?.data ?? [];
  const granularity = data?.granularity ?? "day";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-4 text-sm font-semibold">Динамика выручки</h3>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart data={points} margin={{ left: 12, right: 12, top: 8 }}>
          <defs>
            <linearGradient id="fillConsole" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-console)"
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor="var(--color-console)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id="fillBar" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-bar)"
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor="var(--color-bar)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" />
          <XAxis
            dataKey="key"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => formatTick(String(value), granularity)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            domain={[0, "auto"]}
            allowDecimals={false}
            tickFormatter={(value) => String(value)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                sortByValue
                labelFormatter={(value) =>
                  formatChartLabel(String(value), granularity)
                }
                formatter={(value, name) =>
                  `${name === "console" ? "Станции" : "Бар"} · ${formatTenge(Number(value))}`
                }
              />
            }
          />
          <Area
            dataKey="console"
            type="monotone"
            stackId="1"
            fill="url(#fillConsole)"
            stroke="var(--color-console)"
            strokeWidth={2}
          />
          <Area
            dataKey="bar"
            type="monotone"
            stackId="1"
            fill="url(#fillBar)"
            stroke="var(--color-bar)"
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
