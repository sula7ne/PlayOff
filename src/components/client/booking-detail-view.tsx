"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Gamepad2 } from "lucide-react";
import { useClientBookings } from "@/hooks/use-client";
import { formatTenge, formatTime, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Подтверждена",
  PENDING: "Ожидает оплаты",
  CANCELLED: "Отменена",
};

const STATUS_CLASS: Record<string, string> = {
  CONFIRMED: "text-emerald-400",
  PENDING: "text-amber-400",
  CANCELLED: "text-zinc-500",
};

function formatDuration(ms: number): string {
  const hours = ms / 3600000;
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (whole === 0) return `${minutes} мин`;
  return minutes > 0 ? `${whole} ч ${minutes} мин` : `${whole} ч`;
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="size-4" />}
        {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { data: bookings = [], isLoading } = useClientBookings();
  const booking = bookings.find((b) => b.id === bookingId) ?? null;

  if (isLoading && !booking) {
    return <Skeleton className="m-4 h-64 rounded-2xl" />;
  }

  if (!booking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-muted-foreground">Бронь не найдена</p>
        <Button variant="outline" onClick={() => router.push("/profile")}>
          В профиль
        </Button>
      </div>
    );
  }

  const startMs = new Date(booking.startTime).getTime();
  const endMs = new Date(booking.endTime).getTime();
  const duration = endMs - startMs;

  return (
    <div className="p-4 pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-3 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Назад
      </button>

      <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <Gamepad2 className="size-5 text-accent" />
        {booking.station?.name ?? "—"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Детали бронирования.
      </p>

      <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <Row
          icon={CalendarDays}
          label="Дата"
          value={formatDate(booking.startTime)}
        />
        <Row
          icon={Clock}
          label="Время"
          value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`}
        />
        <Row icon={Clock} label="Длительность" value={formatDuration(duration)} />
        <Row label="Сумма" value={formatTenge(booking.totalPrice)} />
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <span className="text-muted-foreground">Статус</span>
          <span
            className={`font-medium ${STATUS_CLASS[booking.status] ?? "text-zinc-500"}`}
          >
            {STATUS_LABEL[booking.status] ?? booking.status}
          </span>
        </div>
      </div>

      {booking.status === "PENDING" && (
        <Button
          className="mt-4 w-full"
          onClick={() => router.push(`/pay/${booking.id}`)}
        >
          Вернуться к оплате
        </Button>
      )}

      {booking.status === "CANCELLED" && (
        <div className="mt-4 rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-3 text-center text-sm text-zinc-400">
          Бронь отменена
        </div>
      )}
    </div>
  );
}
