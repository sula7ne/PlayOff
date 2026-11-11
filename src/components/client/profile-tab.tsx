"use client";

import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { useClientBookings, useClientProfile } from "@/hooks/use-client";
import { ActiveSessionBanner } from "@/components/client/active-session-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTenge, formatTime } from "@/lib/format";

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

export function ProfileTab() {
  const router = useRouter();
  const { data, isLoading } = useClientProfile();
  const { data: bookings = [] } = useClientBookings();

  if (isLoading) {
    return <Skeleton className="m-4 h-64 rounded-2xl" />;
  }

  const user = data?.user;
  const activeBooking = data?.activeBooking;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-xl font-bold text-accent">
          {(user?.name ?? "Г")[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-semibold">
            {user?.name ?? "Гость"}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="size-3" />
            {user?.rank} · {user?.xp} XP
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold tabular-nums">
            {formatTenge(user?.balance ?? 0)}
          </div>
          <div className="text-xs text-muted-foreground">Баланс</div>
        </div>
      </div>

      {activeBooking && <ActiveSessionBanner booking={activeBooking} />}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Мои бронирования
        </h2>
        {bookings.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-muted-foreground">
            Пока нет бронирований.
          </p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => router.push(`/bookings/${b.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-white/20"
              >
                <div>
                  <div className="text-sm font-medium">
                    {b.station?.name ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(b.startTime)}–{formatTime(b.endTime)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {formatTenge(b.totalPrice)}
                  </div>
                  <div
                    className={`text-xs font-medium ${STATUS_CLASS[b.status] ?? "text-zinc-500"}`}
                  >
                    {STATUS_LABEL[b.status] ?? b.status}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
