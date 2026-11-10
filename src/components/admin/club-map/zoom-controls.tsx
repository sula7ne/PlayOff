"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";

const BUTTON_CLASS =
  "flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-zinc-800";

export function ZoomControls({
  zoomIn,
  zoomOut,
  resetTransform,
}: {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
}) {
  return (
    <div className="absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1 backdrop-blur">
      <button
        type="button"
        onClick={zoomIn}
        aria-label="Приблизить"
        className={BUTTON_CLASS}
      >
        <Plus className="size-4" />
      </button>
      <button
        type="button"
        onClick={zoomOut}
        aria-label="Отдалить"
        className={BUTTON_CLASS}
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        onClick={resetTransform}
        aria-label="Сбросить масштаб"
        className={BUTTON_CLASS}
      >
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
}
