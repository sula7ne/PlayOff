import type { StationStatus } from "@/types/station";

export const STATION_STATUS_META: Record<
  StationStatus,
  { label: string; dot: string; badge: string }
> = {
  FREE: {
    label: "Свободно",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/25",
  },
  BUSY: {
    label: "Занято",
    dot: "bg-red-400",
    badge: "bg-red-500/10 text-red-400 ring-red-500/25",
  },
  RESERVED: {
    label: "Бронь",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 ring-amber-500/25",
  },
  MAINTENANCE: {
    label: "Обслуживание",
    dot: "bg-zinc-400",
    badge: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/25",
  },
};

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
