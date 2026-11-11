"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Minus, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  STATION_STATUS_META,
  formatElapsed,
} from "@/components/admin/station-status";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useDeleteStation, useStations } from "@/hooks/use-stations";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionModal } from "@/components/admin/session-modal";
import type { Station } from "@/types/station";
import { StationFormModal } from "@/components/admin/station-form-modal";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";

export function InteractiveClubMap() {
  const { data: stations = [], isLoading, isError } = useStations();
  const { data: sessionData } = useSession();
  const deleteStation = useDeleteStation();

  const isSuperAdmin = sessionData?.session?.role === "SUPER_ADMIN";

  const [now, setNow] = useState(0);
  const [selected, setSelected] = useState<Station | null>(null);
  const [editing, setEditing] = useState<Station | null>(null);
  const [deleting, setDeleting] = useState<Station | null>(null);
  const [manageMode, setManageMode] = useState(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
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
    <div className="space-y-4">
      {isSuperAdmin && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant={manageMode ? "default" : "outline"}
            onClick={() => setManageMode((v) => !v)}
          >
            <Pencil className="size-4" />
            {manageMode ? "Готово" : "Управление станциями"}
          </Button>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative touch-none select-none overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-zinc-950">
            <Skeleton className="size-full rounded-none" />
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
          onPanningStart={(ref) => {
            panStartRef.current = {
              x: ref.state.positionX,
              y: ref.state.positionY,
            };
          }}
          onPanningStop={(ref) => {
            const start = panStartRef.current;
            panStartRef.current = null;
            if (start) {
              const dx = ref.state.positionX - start.x;
              const dy = ref.state.positionY - start.y;
              if (dx * dx + dy * dy > 25) {
                isPanningRef.current = true;
              }
            }
          }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div className="relative h-[560px] w-full">
              {/* Панель управления зумом */}
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
                contentStyle={{ width: "100%", height: "100%", minWidth: "1050px", minHeight: "600px" }}
              >
                {/* Холст карты с планом помещений */}
                <div className="relative h-[600px] w-[1050px]">
                  {/* Фоновые контуры комнат */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Коридор */}
                    <svg className="absolute inset-0 size-full overflow-visible">
                      <path
                        d="M 50 380 H 160 V 290 H 560 V 290 H 700 V 300 H 750 V 460 H 700 V 350 H 560 V 460 H 510 V 350 H 220 V 460 H 50"
                        fill="rgba(39, 39, 42, 0.25)"
                        stroke="rgba(113, 113, 122, 0.4)"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                      />
                    </svg>

                    <div className="absolute left-[35px] top-[415px] rotate-90 text-[10px] font-bold text-zinc-400 tracking-wider">
                      ⬇ ВХОД
                    </div>

                    {/* РЕСЕПШН */}
                    <div className="absolute left-[79px] top-[425px] w-[80px] h-[35px] border border-amber-500/40 rounded-t-md bg-amber-500/10 flex flex-col items-center justify-center p-1 text-amber-300 text-xs font-semibold shadow-sm">
                      <span className="text-amber-400/80">Ресепшн</span>
                    </div>

                    {/* ТУАЛЕТ */}
                    <div className="absolute left-[159.5px] top-[415px] w-[60px] h-[45px] border border-blue-500/40 rounded-t-md bg-blue-500/10 flex items-center justify-center text-zinc-400 text-xs font-medium">
                      <span className="text-blue-400/80">WC 🚻</span>
                    </div>
                    
                    {/* VIP 1 контур */}
                    <div className="absolute left-[220.5px] top-[180px] w-[160px] h-[110px] border border-zinc-700/60 bg-zinc-900/20 flex items-start p-2 text-zinc-500 text-xs font-medium">VIP 1</div>
                    
                    {/* Общий зал контур */}
                    <div className="absolute left-[380px] top-[90px] w-[350px] h-[200px] border border-zinc-700/60 bg-zinc-900/20 flex items-start p-2 text-zinc-500 text-xs font-medium">Общий зал</div>

                    {/* Нижний ряд VIP комнат (2, 3, 4) */}
                    <div className="absolute left-[220px] top-[350px] w-[140px] h-[110px] border border-zinc-700/60 bg-zinc-900/20 p-2 text-zinc-500 text-xs font-medium">VIP 2</div>
                    <div className="absolute left-[370px] top-[350px] w-[140px] h-[110px] border border-zinc-700/60 bg-zinc-900/20 p-2 text-zinc-500 text-xs font-medium">VIP 3</div>
                    <div className="absolute left-[560px] top-[350px] w-[140px] h-[110px] border border-zinc-700/60 bg-zinc-900/20 p-2 text-zinc-500 text-xs font-medium">VIP 4</div>
                    {/* VIP 5 смещена вправо */}
                    <div className="absolute left-[750px] top-[350px] w-[140px] h-[110px] border border-zinc-700/60 bg-zinc-900/20 p-2 text-zinc-500 text-xs font-medium">VIP 5</div>
                  </div>

                  {/* Рендер станций */}
                  {stations.map((station) => {
                    const meta = STATION_STATUS_META[station.status];
                    const busy = station.status === "BUSY";
                    const elapsed =
                      busy && station.busySinceMs !== null
                        ? formatElapsed(Math.max(0, now - station.busySinceMs))
                        : null;

                    return (
                      <div
                        key={station.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (isPanningRef.current) {
                            isPanningRef.current = false;
                            return;
                          }
                          setSelected(station);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(station);
                          }
                        }}
                        style={{
                          left: `${station.posX}px`,
                          top: `${station.posY}px`,
                          width: "100px",
                          height: "75px",
                        }}
                        className={cn(
                          "absolute flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border text-center transition-colors shadow-lg z-10",
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
                          <span className="text-[11px] text-zinc-300">
                            {meta.label}
                          </span>
                        )}

                        {isSuperAdmin && manageMode && (
                          <div
                            className="absolute -right-1.5 -top-1.5 flex gap-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setEditing(station)}
                              className="rounded-md bg-zinc-900 p-1 text-zinc-400 shadow hover:text-white"
                              aria-label="Редактировать станцию"
                            >
                              <Pencil className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(station)}
                              className="rounded-md bg-zinc-900 p-1 text-zinc-400 shadow hover:text-red-400"
                              aria-label="Удалить станцию"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>
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

      <SessionModal
        key={selected?.id ?? "empty"}
        station={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />

      <StationFormModal
        station={editing}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
      />

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить станцию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить станцию {deleting?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={deleteStation.isPending}
              onClick={() => {
                if (deleting) {
                  deleteStation.mutate(deleting.id, {
                    onSuccess: () => setDeleting(null),
                  });
                }
              }}
            >
              {deleteStation.isPending ? "Удаление…" : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}