"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import {
  useClientStations,
  type ClientStation,
} from "@/hooks/use-client";
import { BookingModal } from "@/components/client/booking-modal";
import { hapticImpact } from "@/lib/telegram";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ClientStation["status"], string> = {
  FREE: "Свободна",
  BUSY: "Занята",
  RESERVED: "Бронь",
  MAINTENANCE: "ТО",
};

export function StationMapTab() {
  const { data: stations = [], isLoading, isError } = useClientStations();
  const [selected, setSelected] = useState<ClientStation | null>(null);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold tracking-tight">Карта станций</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Выберите свободную станцию для бронирования.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {stations.map((s) => {
          const free = s.status === "FREE";

          return (
            <button
              key={s.id}
              type="button"
              disabled={!free}
              onClick={() => {
                hapticImpact("light");
                setSelected(s);
              }}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border p-4 text-left transition-colors",
                free
                  ? "border-white/10 bg-white/[0.04] hover:border-accent/50"
                  : "border-white/5 bg-white/[0.02] opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Gamepad2 className="size-4 text-accent" />
                  {s.name}
                </span>
                {s.isVip && (
                  <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">
                    VIP
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.name ?? (s.isVip ? "VIP зона" : "Станция")}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  free
                    ? "text-emerald-400"
                    : s.status === "BUSY"
                      ? "text-red-400"
                      : "text-amber-400",
                )}
              >
                {STATUS_LABEL[s.status]}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Загрузка…
        </p>
      )}
      {isError && (
        <p className="mt-4 text-center text-sm text-red-400">
          Не удалось загрузить станции.
        </p>
      )}

      {selected && (
        <BookingModal station={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
