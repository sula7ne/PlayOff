"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { formatTenge } from "@/lib/format";
import { PaymentBadge } from "@/components/admin/badges";
import { OrderDetailsModal } from "@/components/admin/bar/order-details-modal";
import { useOrders, type Order } from "@/hooks/use-bar";

export function OrderHistory() {
  const { data: orders = [] } = useOrders();
  const [selected, setSelected] = useState<Order | null>(null);

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Receipt className="size-4 text-accent" />
          <h2 className="text-sm font-semibold">Последние заказы</h2>
        </div>
        <ul className="divide-y divide-white/5">
          {orders.map((order) => (
            <li key={order.id}>
              <button type="button" onClick={() => setSelected(order)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    Заказ №{order.number}
                    {order.stationId ? ` · ${order.station?.name ?? "?"}` : " · стол"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {order.items.map((i) => `${i.barItem.name} ×${i.quantity}`).join(", ")}
                  </div>
                </div>
                <PaymentBadge method={order.paymentMethod} />
                <span className="font-semibold tabular-nums">{formatTenge(order.totalAmount)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <OrderDetailsModal
        order={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      />
    </>
  );
}
