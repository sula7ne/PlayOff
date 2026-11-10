import { Banknote, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus, PaymentMethod } from "@/hooks/use-bookings";

const PAYMENT_META: Record<
  PaymentMethod,
  { label: string; className: string }
> = {
  CASH: {
    label: "Наличные",
    className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  },
  KASPI_QR: {
    label: "Kaspi QR",
    className: "bg-red-500/10 text-red-400 ring-red-500/20",
  },
};

const BOOKING_META: Record<BookingStatus, { label: string; className: string }> =
  {
    PENDING: {
      label: "Ожидает оплаты",
      className: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    },
    CONFIRMED: {
      label: "Подтверждена",
      className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    },
    CANCELLED: {
      label: "Отменена",
      className: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
    },
  };

export function PaymentBadge({ method }: { method: PaymentMethod }) {
  const meta = PAYMENT_META[method];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        meta.className,
      )}
    >
      {method === "CASH" ? (
        <Banknote className="size-3" />
      ) : (
        <QrCode className="size-3" />
      )}
      {meta.label}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const meta = BOOKING_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
