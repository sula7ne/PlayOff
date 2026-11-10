"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { formatTenge } from "@/lib/format";
import { usePosCartLogic } from "@/hooks/use-pos-cart-logic";
import { PosCartItem } from "@/components/admin/bar/pos-cart-item";
import { PosPaymentSelector } from "@/components/admin/bar/pos-payment-selector";

export function PosCart() {
  const cart = usePosCartLogic();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShoppingCart className="size-4 text-accent" />
          Корзина
        </h2>
        {cart.items.length > 0 && (
          <button type="button" onClick={cart.clearCart}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="size-3.5" />Очистить
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Корзина пуста</p>
      ) : (
        <div className="space-y-2">
          {cart.items.map((item) => (
            <PosCartItem key={item.id} item={item}
              onIncrement={() => cart.increment(item.id)}
              onDecrement={() => cart.decrement(item.id)}
              onRemove={() => cart.removeItem(item.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Способ оплаты</p>
          <PosPaymentSelector value={cart.paymentMethod} onChange={cart.setPaymentMethod} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Итого</span>
          <span className="text-lg font-bold tabular-nums">{formatTenge(cart.total)}</span>
        </div>
        {cart.isError && <p className="text-xs text-red-400">Не удалось создать заказ.</p>}
        <button type="button" onClick={cart.checkout} disabled={cart.items.length === 0 || cart.isPending}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/80 disabled:opacity-50">
          {cart.isPending ? "Создание…" : "Создать заказ"}
        </button>
      </div>
    </div>
  );
}
