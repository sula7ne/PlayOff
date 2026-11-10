"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatTenge } from "@/lib/format";
import {
  HAPPY_HOUR_RATE,
  computePriceWithPromos,
  isHappyHour,
  isWeekday,
} from "@/lib/pricing";

export function SessionPriceCalculator() {
  const [paidHours, setPaidHours] = useState(1);
  const [isVip, setIsVip] = useState(false);
  const [applyHappyHour, setApplyHappyHour] = useState<boolean>(
    () => typeof window !== "undefined" && isHappyHour(new Date()),
  );
  const [applyPromo21, setApplyPromo21] = useState<boolean>(
    () => typeof window !== "undefined" && isWeekday(new Date()),
  );

  const { rate, freeHours, totalHours, price } = computePriceWithPromos(
    isVip,
    paidHours,
    applyHappyHour && !isVip,
    applyPromo21,
  );

  const handleHoursChange = (value: string) => {
    const n = Number.parseInt(value, 10);
    setPaidHours(Number.isNaN(n) || n < 0 ? 0 : n);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div>
        <p className="mb-2 text-sm font-medium">Зона</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsVip(false)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              !isVip
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            Общий зал
          </button>
          <button
            type="button"
            onClick={() => setIsVip(true)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              isVip
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            VIP
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="paid-hours" className="block text-sm font-medium">
          Оплачиваемые часы
        </label>
        <input
          id="paid-hours"
          type="number"
          min={0}
          value={paidHours}
          onChange={(e) => handleHoursChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-2 rounded-lg border border-white/10 p-3">
        <p className="text-sm font-medium">Акции</p>

        <label
          className={cn(
            "flex items-center gap-2 text-sm",
            isVip && "cursor-not-allowed opacity-50",
          )}
        >
          <input
            type="checkbox"
            checked={applyHappyHour}
            disabled={isVip}
            onChange={(e) => setApplyHappyHour(e.target.checked)}
            className="size-4 rounded accent-accent"
          />
          <span>
            Счастливые часы · до 18:00 · {HAPPY_HOUR_RATE} ₸/час
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={applyPromo21}
            onChange={(e) => setApplyPromo21(e.target.checked)}
            className="size-4 rounded accent-accent"
          />
          <span>Акция «2+1» · будни · +1 час за каждые 2</span>
        </label>

        {isVip && (
          <p className="text-xs text-muted-foreground">
            Счастливые часы не действуют в VIP-зоне.
          </p>
        )}
      </div>

      <div className="space-y-1.5 rounded-lg bg-muted p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Тариф</span>
          <span className="font-medium">
            {rate} ₸/час
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Время</span>
          <span className="font-medium">
            {paidHours} ч оплачено + {freeHours} ч в подарок = {totalHours} ч
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-base font-semibold">
          <span>Итого</span>
          <span className="tabular-nums">{formatTenge(price)}</span>
        </div>
      </div>
    </div>
  );
}
