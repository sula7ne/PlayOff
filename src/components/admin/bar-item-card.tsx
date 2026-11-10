"use client";

import { UtensilsCrossed, Cookie, CupSoda, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTenge } from "@/lib/format";
import type { BarItem } from "@/hooks/use-bar";

function CategoryIcon({ category }: { category: string | null }) {
  if (category === "Кухня") {
    return <UtensilsCrossed className="size-5 text-accent" />;
  }
  if (category === "Снэки") {
    return <Cookie className="size-5 text-accent" />;
  }
  if (category === "Бар") {
    return <CupSoda className="size-5 text-accent" />;
  }
  return <Package className="size-5 text-accent" />;
}

export function BarItemCard({
  item,
  canManage,
  onAdd,
  onEdit,
  onDelete,
}: {
  item: BarItem;
  canManage: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      {item.imageUrl && (
        <div className="-mx-4 -mt-4 mb-1 h-28 overflow-hidden rounded-t-2xl bg-white/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between">
        <CategoryIcon category={item.category} />
        <div className="flex items-center gap-2">
          {canManage && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-zinc-800/50 hover:text-foreground"
                aria-label="Редактировать товар"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Удалить товар"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
              item.stock <= 15
                ? "bg-red-500/10 text-red-400 ring-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
            )}
          >
            {item.stock} шт
          </span>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-foreground">{item.name}</div>
        <div className="text-xs text-muted-foreground">{item.category}</div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="font-semibold tabular-nums">
          {formatTenge(item.price)}
        </span>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Добавить ${item.name} в корзину`}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-all hover:bg-accent/80 active:scale-95"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
