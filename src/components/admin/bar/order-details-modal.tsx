import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTenge } from "@/lib/format";
import { PaymentBadge } from "@/components/admin/badges";
import type { Order } from "@/hooks/use-bar";

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <div key={item.id} className="flex items-center justify-between text-sm">
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
