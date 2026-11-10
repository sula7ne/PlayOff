"use client";

import { X } from "lucide-react";
import { BookingStatusBadge, PaymentBadge } from "@/components/admin/badges";
import { formatTenge, formatTime } from "@/lib/format";
import { BookingRow } from "@/components/admin/bookings/booking-row";
import { useUpdateBookingStatus, type Booking } from "@/hooks/use-bookings";

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const updateStatus = useUpdateBookingStatus();
  const cancel = (id: string) => updateStatus.mutate({ id, status: "CANCELLED" });

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Клиент</th>
              <th className="px-4 py-3 font-medium">Станция</th>
              <th className="px-4 py-3 font-medium">Время</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Оплата</th>
              <th className="px-4 py-3 text-right font-medium">Сумма</th>
              <th className="px-4 py-3 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} onCancel={() => cancel(booking.id)} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{booking.user?.name ?? booking.user?.phone ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{booking.user?.phone}</div>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {booking.station?.name ?? "—"} · {formatTime(booking.startTime)}–{formatTime(booking.endTime)}
              </span>
              <span className="font-semibold">{formatTenge(booking.totalPrice)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <PaymentBadge method={booking.paymentMethod} />
              {booking.status !== "CANCELLED" && (
                <button type="button" onClick={() => cancel(booking.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-medium text-red-400">
                  <X className="size-3.5" />Отменить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
