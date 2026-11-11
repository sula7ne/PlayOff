"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useClientBar, type ClientBarItem } from "@/hooks/use-client";
import { getCartTotal, useCartStore } from "@/store/cart-store";
import { hapticImpact } from "@/lib/telegram";
import { formatTenge } from "@/lib/format";
import { BAR_CATEGORIES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function BarItemCard({
  item,
  onAdd,
}: {
  item: ClientBarItem;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      {item.imageUrl && (
        <div className="mb-1 h-24 overflow-hidden rounded-xl bg-white/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="text-sm font-medium">{item.name}</div>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums">
          {formatTenge(item.price)}
        </span>
        <button
          type="button"
          onClick={onAdd}
          disabled={item.stock <= 0}
          aria-label={`Добавить ${item.name}`}
          className="flex size-8 items-center justify-center rounded-lg bg-accent text-white transition-all hover:bg-accent/80 active:scale-95 disabled:opacity-40"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function BarTab() {
  const { data: items = [], isLoading } = useClientBar();
  const cart = useCartStore();
  const [category, setCategory] = useState("Все");
  const [cartOpen, setCartOpen] = useState(false);

  const categories = ["Все", ...BAR_CATEGORIES];
  const visible =
    category === "Все"
      ? items
      : items.filter((i) => i.category === category);
  const total = getCartTotal(cart.items);
  const totalCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="p-4 pb-28">
      <h1 className="text-xl font-bold tracking-tight">Бар</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              hapticImpact("selection");
              setCategory(c);
            }}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c
                ? "bg-accent text-white"
                : "border border-white/10 text-muted-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Загрузка…
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {visible.map((item) => (
            <BarItemCard
              key={item.id}
              item={item}
              onAdd={() => {
                hapticImpact("light");
                cart.addItem({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                });
              }}
            />
          ))}
        </div>
      )}

      {cart.items.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-white/10 bg-zinc-950/95 p-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">
                {totalCount} тов.
              </div>
              <div className="text-lg font-bold tabular-nums">
                {formatTenge(total)}
              </div>
            </div>
            <Button
              onClick={() => {
                hapticImpact("light");
                setCartOpen(true);
              }}
            >
              <ShoppingCart className="size-4" />
              Корзина
            </Button>
          </div>
        </div>
      )}

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Корзина</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTenge(item.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cart.decrement(item.id)}
                    className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-muted-foreground"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => cart.increment(item.id)}
                    className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-muted-foreground"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Оплата и оформление заказа производятся на ресепшн.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCartOpen(false)}>
              Закрыть
            </Button>
            <Button disabled className="bg-zinc-700/60 text-zinc-400">
              На ресепшн
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
