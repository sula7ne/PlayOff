import { X } from "lucide-react";
import { BookingStatusBadge, PaymentBadge } from "@/components/admin/badges";
import { formatDate, formatTenge, formatTime } from "@/lib/format";
import type { Booking } from "@/hooks/use-bookings";

export function BookingRow({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: () => void;
}) {
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">
          {booking.user?.name ?? booking.user?.phone ?? "—"}
        </div>
        <div className="text-xs text-muted-foreground">
          {booking.user?.phone}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium">{booking.station?.name ?? "—"}</div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium">{formatDate(booking.startTime)}</div>
        <div className="text-xs text-muted-foreground">
          {formatTime(booking.startTime)}–{formatTime(booking.endTime)}
        </div>
      </td>
      <td className="px-4 py-3">
        <BookingStatusBadge status={booking.status} />
      </td>
      <td className="px-4 py-3">
        <PaymentBadge method={booking.paymentMethod} />
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums">
        {formatTenge(booking.totalPrice)}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          {booking.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/25"
            >
              <X className="size-3.5" />
              Отменить
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
