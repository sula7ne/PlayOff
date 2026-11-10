"use client";

import { cn } from "@/lib/utils";
import { formatTenge } from "@/lib/format";
import { HAPPY_HOUR_RATE } from "@/lib/pricing";
import { useSessionModal } from "@/hooks/use-session-modal";

export function SessionForm({
  session,
}: {
  session: ReturnType<typeof useSessionModal>;
}) {
  const handleHoursChange = (value: string) => {
    const n = Number.parseInt(value, 10);
    session.setPaidHours(Number.isNaN(n) || n < 0 ? 0 : n);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="session-hours" className="block text-sm font-medium">
          Оплачиваемые часы
        </label>
        <input
          id="session-hours"
          type="number"
          min={1}
          max={session.maxHours}
          value={session.paidHours}
          disabled={session.isOpenEnded}
          onChange={(e) => handleHoursChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-50"
        />
        {session.paidHours >= session.maxHours && (
          <p className="text-xs text-muted-foreground">
            Максимум {session.maxHours} ч (до 02:00)
          </p>
        )}
      </div>

      {/* Временно скрыто — до упора (почасовая оплата) */}
      {/* <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={session.isOpenEnded}
          onChange={(e) => session.setIsOpenEnded(e.target.checked)}
          className="size-4 rounded accent-accent"
        />
        <span>До упора (почасовая оплата)</span>
      </label> */}

      <div className="space-y-2 rounded-lg border border-white/10 p-3">
        <p className="text-sm font-medium">Акции</p>

        <label
          className={cn(
            "flex items-center gap-2 text-sm",
            (session.isVip) && "cursor-not-allowed opacity-50",
          )}
        >
          <input
            type="checkbox"
            checked={session.applyHappyHour}
            disabled={session.isVip}
            onChange={(e) => session.setApplyHappyHour(e.target.checked)}
            className="size-4 rounded accent-accent"
          />
          <span>
            Счастливые часы · до 18:00 · {HAPPY_HOUR_RATE} ₸/час
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={session.applyPromo21}
            onChange={(e) => session.setApplyPromo21(e.target.checked)}
            className="size-4 rounded accent-accent"
          />
          <span>Акция «2+1» · будни · +1 час за каждые 2</span>
        </label>
      </div>

      <div className="space-y-1.5 rounded-lg bg-muted p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Тариф</span>
          <span className="font-medium">{session.rate} ₸/час</span>
        </div>

        {session.isOpenEnded ? (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Оплата</span>
            <span className="font-medium">по факту времени</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Время</span>
            <span className="font-medium">
              {session.paidHours} ч оплачено + {session.freeHours} ч в подарок =
              {` ${session.totalHours} ч`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-base font-semibold">
          <span>Итого</span>
          <span className="tabular-nums">
            {session.isOpenEnded
              ? `${session.rate} ₸/час`
              : formatTenge(session.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
