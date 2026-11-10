"use client";

import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatElapsed,
  STATION_STATUS_META,
} from "@/components/admin/station-status";
import type { Station } from "@/types/station";

export function StationMapNode({
  station,
  now,
  isSuperAdmin,
  onClick,
  onEdit,
  onDelete,
}: {
  station: Station;
  now: number;
  isSuperAdmin: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = STATION_STATUS_META[station.status];
  const busy = station.status === "BUSY";
  const elapsed =
    busy && station.busySinceMs !== null
      ? formatElapsed(Math.max(0, now - station.busySinceMs))
      : null;

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
      style={{
        left: `${station.posX}px`,
        top: `${station.posY}px`,
        width: "100px",
        height: "75px",
      }}
      className={cn(
        "absolute z-10 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border text-center shadow-lg transition-colors",
        station.status === "FREE" &&
          "border-emerald-500/30 bg-emerald-500/15 hover:border-emerald-500/60",
        station.status === "BUSY" &&
          "border-red-500/40 bg-red-500/15 hover:border-red-500/70",
        station.status === "RESERVED" &&
          "border-amber-500/30 bg-amber-500/15 hover:border-amber-500/60",
        station.status === "MAINTENANCE" &&
          "border-zinc-600/50 bg-zinc-800/60 opacity-70",
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
        <span className={cn("size-1.5 rounded-full", meta.dot)} />
        {station.name}
      </span>

      {busy && elapsed ? (
        <span className="font-mono text-sm font-semibold tabular-nums text-red-300">
          {elapsed}
        </span>
      ) : (
        <span className="text-[11px] text-zinc-300">{meta.label}</span>
      )}

      {isSuperAdmin && (
        <div
          className="absolute -right-1.5 -top-1.5 flex gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md bg-zinc-900 p-1 text-zinc-400 shadow hover:text-white"
            aria-label="Редактировать станцию"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md bg-zinc-900 p-1 text-zinc-400 shadow hover:text-red-400"
            aria-label="Удалить станцию"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
