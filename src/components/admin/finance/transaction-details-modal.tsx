"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTenge, formatTime } from "@/lib/format";
import { PaymentBadge } from "@/components/admin/badges";
import { isHappyHour } from "@/lib/pricing";
import { useTransactionDetails } from "@/hooks/use-finance";

function formatDuration(ms: number): string {
  const hours = ms / 3600000;
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (whole === 0) return `${minutes} мин`;
  return minutes > 0 ? `${whole} ч ${minutes} мин` : `${whole} ч`;
}

function GamingSessionDetails({
  t,
}: {
  t: NonNullable<ReturnType<typeof useTransactionDetails>["data"]>["transaction"];
}) {
  const gs = t.gamingSession;
  if (!gs) return null;

  const paid = gs.durationHours;
  const freeHours = gs.applyPromo21 && paid != null ? Math.floor(paid / 2) : 0;
  const isVip = gs.station?.isVip ?? false;
  const happy = gs.applyHappyHour ?? isHappyHour(new Date(gs.startTime));
  const rateLabel = isVip ? "VIP" : happy ? "Happy hour" : "Стандарт";

  const startMs = new Date(gs.startTime).getTime();
  const endMs = gs.endTime ? new Date(gs.endTime).getTime() : null;

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
      <Row label="Станция" value={gs.station?.name ?? "?"} />
      <Row
        label="Пакет"
        value={
          paid != null
            ? freeHours > 0
              ? `${paid} ч + ${freeHours} бонус (2+1)`
              : `${paid} ч`
            : "Без фикс. часов"
        }
      />
      <Row label="Тариф" value={rateLabel} />
      <Row label="Время" value={`${formatTime(gs.startTime)} → ${gs.endTime ? formatTime(gs.endTime) : "сейчас"}`} />
      {paid == null && endMs != null && (
        <Row label="Длительность" value={formatDuration(endMs - startMs)} />
      )}
    </div>
  );
}

function OrderDetails({
  t,
}: {
  t: NonNullable<ReturnType<typeof useTransactionDetails>["data"]>["transaction"];
}) {
  const order = t.order;
  if (!order) return null;

  return (
    <div className="space-y-2">
      {order.station && (
        <div className="text-xs text-muted-foreground">
          Станция: {order.station.name}
        </div>
      )}
      <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3"
          >
            <span className="min-w-0 flex-1 truncate">
              {item.barItem.name} ×{item.quantity}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatTenge(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingDetails({
  t,
}: {
  t: NonNullable<ReturnType<typeof useTransactionDetails>["data"]>["transaction"];
}) {
  const booking = t.booking;
  if (!booking) return null;

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
      <Row label="Станция" value={booking.station?.name ?? "?"} />
      <Row
        label="Время"
        value={`${formatTime(booking.startTime)} → ${formatTime(booking.endTime)}`}
      />
      {booking.user && (
        <Row
          label="Клиент"
          value={booking.user.name ?? booking.user.phone ?? "—"}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function TransactionDetailsModal({
  transactionId,
  open,
  onOpenChange,
}: {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useTransactionDetails(
    open ? transactionId : null,
  );
  const t = data?.transaction;

  const title = t?.gamingSession
    ? "Игровая сессия"
    : t?.order
      ? `Заказ №${t.order.number}`
      : t?.booking
        ? "Бронь"
        : t?.category ?? "Транзакция";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!isLoading && t && (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {formatTime(t.createdAt)}
                {t.adminName ? ` · ${t.adminName}` : ""}
              </DialogDescription>
            </DialogHeader>

            {t.gamingSession && <GamingSessionDetails t={t} />}
            {t.order && <OrderDetails t={t} />}
            {t.booking && <BookingDetails t={t} />}

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <PaymentBadge method={t.paymentMethod} />
              <span className="text-lg font-bold tabular-nums">
                {formatTenge(t.amount)}
              </span>
            </div>
          </>
        )}

        {!isLoading && !t && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Не удалось загрузить транзакцию.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
