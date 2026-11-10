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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateClientBooking,
  type ClientStation,
} from "@/hooks/use-client";
import { hapticImpact } from "@/lib/telegram";
import { formatTenge } from "@/lib/format";
import { computePackagePrice, getMaxPaidHours } from "@/lib/pricing";
import { StationGames } from "@/components/station-games";
import { cn } from "@/lib/utils";

const DURATIONS = [1, 2, 3, 4];

function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function BookingModal({
  station,
  onClose,
}: {
  station: ClientStation;
  onClose: () => void;
}) {
  const createBooking = useCreateClientBooking();

  const [startTime, setStartTime] = useState(() =>
    toLocalInput(new Date(Date.now() + 30 * 60000)),
  );
  const [hours, setHours] = useState(1);
  const [result, setResult] = useState<{ deeplink: string } | null>(null);

  const startDate = new Date(startTime);
  const validStart = Number.isNaN(startDate.getTime()) ? new Date() : startDate;
  const maxHours = getMaxPaidHours(validStart);
  const pricing = computePackagePrice(station.isVip, hours, validStart);

  const submit = () => {
    if (!startTime) return;

    createBooking.mutate(
      {
        stationId: station.id,
        startTime: new Date(startTime).toISOString(),
        hours,
      },
      {
        onSuccess: (res) => setResult({ deeplink: res.deeplink }),
      },
    );
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        {result ? (
          <>
            <DialogHeader>
              <DialogTitle>Оплата брони</DialogTitle>
              <DialogDescription>
                Откройте Kaspi для оплаты. Бронь подтвердится автоматически.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-xl bg-white/[0.04] p-4 text-center">
                <div className="text-2xl font-bold tabular-nums">
                  {formatTenge(pricing.price)}
                </div>
                <div className="text-xs text-muted-foreground">К оплате</div>
              </div>

              <a
                href={result.deeplink}
                onClick={() => hapticImpact("light")}
                className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
              >
                Оплатить через Kaspi
              </a>

              <p className="text-center text-xs text-muted-foreground">
                Бронь активна 15 минут. Если не оплатить — она отменится
                автоматически.
              </p>

              <Button variant="outline" className="w-full" onClick={onClose}>
                Готово
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Бронь станции {station.name}</DialogTitle>
              <DialogDescription>
                Выберите время начала и длительность сеанса.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <StationGames games={station.games} />

              <div className="space-y-1.5">
                <Label>Начало</Label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Длительность</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map((h) => {
                    const disabled = h > maxHours;
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          hapticImpact("selection");
                          setHours(h);
                        }}
                        className={cn(
                          "rounded-lg py-2 text-sm font-medium transition-colors",
                          disabled && "cursor-not-allowed opacity-30",
                          hours === h
                            ? "bg-accent text-white"
                            : "border border-white/10 text-muted-foreground",
                        )}
                      >
                        {h}ч
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.04] p-4 text-center">
                <div className="text-2xl font-bold tabular-nums">
                  {formatTenge(pricing.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Итого · {pricing.rate}₸/час
                  {pricing.freeHours > 0
                    ? ` · +${pricing.freeHours}ч в подарок`
                    : ""}
                </div>
              </div>

              {createBooking.isError && (
                <p className="text-sm text-red-400">
                  Не удалось создать бронь. Попробуйте другую станцию.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button onClick={submit} disabled={createBooking.isPending}>
                {createBooking.isPending ? "Создание…" : "Забронировать"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
