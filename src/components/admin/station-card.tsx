"use client";

import { useEffect, useState } from "react";
import { Gamepad2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATION_STATUS_META, formatElapsed } from "@/components/admin/station-status";
import type { Station } from "@/types/station";

export function StationCard({
  station,
  onClick,
  canManage = false,
  onEdit,
  onDelete,
}: {
  station: Station;
  onClick: () => void;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const status = STATION_STATUS_META[station.status];
  const isBusy = station.status === "BUSY";
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!isBusy) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isBusy]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur-xl transition-all hover:bg-white/[0.07]",
        station.status === "FREE" && "hover:border-emerald-500/40",
        station.status === "BUSY" && "border-red-500/30 hover:border-red-500/60 shadow-[0_0_24px_-6px_rgba(255,31,61,0.35)]",
        station.status === "RESERVED" && "hover:border-amber-500/40",
        station.status === "MAINTENANCE" && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="size-5 text-accent" />
          <span className="text-sm font-semibold text-foreground">{station.name}</span>
        </div>

        <div className="flex items-center gap-1">
          {canManage && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-zinc-800/50 hover:text-foreground"
                aria-label="Редактировать станцию"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Удалить станцию"
              >
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
          {station.isVip && (
            <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">VIP</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", status.badge)}>
          <span className={cn("size-1.5 rounded-full", status.dot, isBusy && "animate-pulse")} />
          {status.label}
        </span>
      </div>

      {isBusy && station.busySinceMs !== null && (
        <div className="font-mono text-sm font-semibold tabular-nums text-red-400">
          {formatElapsed(Math.max(0, now - station.busySinceMs))}
        </div>
      )}
    </div>
  );
}
