"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import {
  useClientStations,
  type ClientStation,
} from "@/hooks/use-client";
import { BookingModal } from "@/components/client/booking-modal";
import { hapticImpact } from "@/lib/telegram";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<ClientStation["status"], string> = {
  FREE: "bg-emerald-400",
  BUSY: "bg-red-400",
  RESERVED: "bg-amber-400",
  MAINTENANCE: "bg-zinc-400",
};

const STATUS_BOX: Record<ClientStation["status"], string> = {
  FREE: "border-emerald-500/30 bg-emerald-500/15",
  BUSY: "border-red-500/40 bg-red-500/15",
  RESERVED: "border-amber-500/30 bg-amber-500/15",
  MAINTENANCE: "border-zinc-600/50 bg-zinc-800/60 opacity-70",
};

function stationStatusLabel(station: ClientStation, now: number): string {
  const bookings = station.upcomingBookings
    .map((b) => ({
      s: new Date(b.startTime).getTime(),
      e: new Date(b.endTime).getTime(),
    }))
    .filter((b) => b.e > now);

  if (station.status === "BUSY") return "Занята";
  if (station.status === "MAINTENANCE") return "ТО";

  if (station.status === "RESERVED") {
    const current = bookings.find((b) => b.s <= now && b.e > now);
    if (current) return `Бронь до ${formatTime(new Date(current.e).toISOString())}`;
    return "Бронь";
  }

  const next = bookings.filter((b) => b.s > now).sort((a, b) => a.s - b.s)[0];
  if (next) return `Свободна до ${formatTime(new Date(next.s).toISOString())}`;
  return "Свободна";
}

export function StationMapTab() {
  const { data: stations = [], isLoading, isError } = useClientStations();
  const [selected, setSelected] = useState<ClientStation | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const width = el.clientWidth || 1;
      setFitScale(Math.max(0.2, Math.min(1, width / 1050)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold tracking-tight">Карта станций</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Нажмите на станцию, чтобы выбрать время и забронировать.
      </p>

      <div
        ref={containerRef}
        className="relative mt-4 touch-none select-none overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80 text-sm text-muted-foreground">
            Загрузка…
          </div>
        )}

        <TransformWrapper
          key={fitScale}
          initialScale={fitScale}
          minScale={0.4}
          maxScale={4}
          centerOnInit
          smooth={false}
          wheel={{ step: 0.03 }}
          pinch={{ step: 0.03 }}
          panning={{ disabled: false }}
          doubleClick={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div className="relative h-[calc(100dvh-180px)] min-h-[400px] w-full">
              <div className="absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1 backdrop-blur">
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  aria-label="Приблизить"
                  className="flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-zinc-800"
                >
                  <Plus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  aria-label="Отдалить"
                  className="flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-zinc-800"
                >
                  <Minus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  aria-label="Сбросить масштаб"
                  className="flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-zinc-800"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  minWidth: "1050px",
                  minHeight: "600px",
                }}
              >
                <div className="relative h-[600px] w-[1050px]">
                  {/* Фоновые контуры */}
                  <div className="pointer-events-none absolute inset-0">
                    <svg className="absolute inset-0 size-full overflow-visible">
                      <path
                        d="M 50 380 H 160 V 290 H 560 V 290 H 700 V 300 H 750 V 460 H 700 V 350 H 560 V 460 H 510 V 350 H 220 V 460 H 50"
                        fill="rgba(39, 39, 42, 0.25)"
                        stroke="rgba(113, 113, 122, 0.4)"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                      />
                    </svg>

                    <div className="absolute left-[35px] top-[415px] rotate-90 text-[10px] font-bold tracking-wider text-zinc-400">
                      ⬇ ВХОД
                    </div>

                    <div className="absolute left-[79px] top-[425px] flex h-[35px] w-[80px] flex-col items-center justify-center rounded-t-md border border-amber-500/40 bg-amber-500/10 p-1 text-xs font-semibold text-amber-300 shadow-sm">
                      <span className="text-amber-400/80">Ресепшн</span>
                    </div>

                    <div className="absolute left-[159.5px] top-[415px] flex h-[45px] w-[60px] items-center justify-center rounded-t-md border border-blue-500/40 bg-blue-500/10 text-xs font-medium text-zinc-400">
                      <span className="text-blue-400/80">WC 🚻</span>
                    </div>

                    <div className="absolute left-[220.5px] top-[180px] flex h-[110px] w-[160px] items-start border border-zinc-700/60 bg-zinc-900/20 p-2 text-xs font-medium text-zinc-500">
                      VIP 1
                    </div>

                    <div className="absolute left-[380px] top-[90px] flex h-[200px] w-[350px] items-start border border-zinc-700/60 bg-zinc-900/20 p-2 text-xs font-medium text-zinc-500">
                      Общий зал
                    </div>

                    <div className="absolute left-[220px] top-[350px] flex h-[110px] w-[140px] items-start border border-zinc-700/60 bg-zinc-900/20 p-2 text-xs font-medium text-zinc-500">
                      VIP 2
                    </div>
                    <div className="absolute left-[370px] top-[350px] flex h-[110px] w-[140px] items-start border border-zinc-700/60 bg-zinc-900/20 p-2 text-xs font-medium text-zinc-500">
                      VIP 3
                    </div>
                    <div className="absolute left-[560px] top-[350px] flex h-[110px] w-[140px] items-start border border-zinc-700/60 bg-zinc-900/20 p-2 text-xs font-medium text-zinc-500">
                      VIP 4
                    </div>
                    <div className="absolute left-[750px] top-[350px] flex h-[110px] w-[140px] items-start border border-zinc-700/60 bg-zinc-900/20 p-2 text-xs font-medium text-zinc-500">
                      VIP 5
                    </div>
                  </div>

                  {/* Станции */}
                  {stations.map((station) => {
                    const label = stationStatusLabel(station, now);
                    const bookable = station.status === "FREE";

                    return (
                      <button
                        key={station.id}
                        type="button"
                        disabled={!bookable}
                        onClick={() => {
                          hapticImpact("light");
                          setSelected(station);
                        }}
                        style={{
                          left: `${station.posX}px`,
                          top: `${station.posY}px`,
                          width: "100px",
                          height: "75px",
                        }}
                        className={cn(
                          "absolute z-10 flex flex-col items-center justify-center gap-1 rounded-lg border text-center shadow-lg transition-colors",
                          STATUS_BOX[station.status],
                          bookable
                            ? "cursor-pointer hover:border-emerald-500/60"
                            : "cursor-not-allowed",
                        )}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              STATUS_DOT[station.status],
                            )}
                          />
                          {station.name}
                        </span>
                        <span className="text-[11px] leading-tight text-zinc-300">
                          {label}
                        </span>
                      </button>
                    );
                  })}

                  {isError && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-red-400">
                      Не удалось загрузить станции.
                    </div>
                  )}
                </div>
              </TransformComponent>
            </div>
          )}
        </TransformWrapper>
      </div>

      {selected && (
        <BookingModal station={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
