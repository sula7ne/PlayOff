"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { StationStatus } from "@/types/station";
import { cn } from "@/lib/utils";
import { useStations } from "@/hooks/use-stations";

const STATUS_LABEL: Record<
  StationStatus,
  { label: string; className: string }
> = {
  FREE: {
    label: "Свободно",
    className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/25",
  },
  BUSY: {
    label: "Занято",
    className: "bg-red-500/10 text-red-400 ring-red-500/25",
  },
  RESERVED: {
    label: "Бронь",
    className: "bg-amber-500/10 text-amber-400 ring-amber-500/25",
  },
  MAINTENANCE: {
    label: "Обслуживание",
    className: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/25",
  },
};

export default function StationsPage() {
  const { data: stations = [], isLoading, isError } = useStations();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Управление станциями
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Парк консолей клуба: зал, статус и джойстики.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Не удалось загрузить станции.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">№</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">VIP</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => {
                const status = STATUS_LABEL[station.status];

                return (
                  <tr
                    key={station.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-semibold">{station.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {station.isVip ? (
                        <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                          VIP
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
