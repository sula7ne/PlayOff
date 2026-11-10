"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatTenge } from "@/lib/format";
import { PaymentBadge } from "@/components/admin/badges";
import { useRefundOrder, type Order } from "@/hooks/use-bar";

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const refundOrder = useRefundOrder();
  const [confirming, setConfirming] = useState(false);

  const isRefunded = order?.refundedAt != null;

  const handleRefund = () => {
    if (!order) return;

    refundOrder.mutate(order.id, {
      onSuccess: () => {
        setConfirming(false);
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setConfirming(false);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle>Заказ №{order.number}</DialogTitle>
              <DialogDescription>
                {order.stationId
                  ? `${order.station?.name ?? "?"}`
                  : "Быстрая продажа (стол)"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {item.barItem.name} ×{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <PaymentBadge method={order.paymentMethod} />
              <span className="text-lg font-bold tabular-nums">
                {formatTenge(order.totalAmount)}
              </span>
            </div>

            {isRefunded && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                Возврат оформлен
              </div>
            )}

            {refundOrder.isError && (
              <p className="text-sm text-red-400">
                Не удалось вернуть заказ.
              </p>
            )}

            <DialogFooter>
              {!isRefunded &&
                (confirming ? (
                  <>
                    <Button variant="outline" onClick={() => setConfirming(false)}>
                      Отмена
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRefund}
                      disabled={refundOrder.isPending}
                    >
                      {refundOrder.isPending ? "Возврат…" : "Подтвердить возврат"}
                    </Button>
                  </>
                ) : (
                  <Button variant="destructive" onClick={() => setConfirming(true)}>
                    Вернуть заказ
                  </Button>
                ))}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
