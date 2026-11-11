"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { formatTenge } from "@/lib/format";
import {
  computePackagePrice,
  getMaxPaidHours,
  getMaxPaidHoursWithin,
} from "@/lib/pricing";
import { StationGames } from "@/components/station-games";

function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function computeMaxPaidHours(
  station: ClientStation,
  startMs: number,
): number {
  const now = Date.now();
  const bookings = station.upcomingBookings
    .map((b) => ({
      s: new Date(b.startTime).getTime(),
      e: new Date(b.endTime).getTime(),
    }))
    .filter((b) => b.e > now && b.e > startMs);

  const overlapping = bookings.find((b) => b.s <= startMs && b.e > startMs);
  if (overlapping) return 0;

  const nextStart = bookings
    .map((b) => b.s)
    .filter((t) => t > startMs)
    .sort((a, b) => a - b)[0];

  if (nextStart) {
    return getMaxPaidHoursWithin(
      new Date(startMs),
      (nextStart - startMs) / 3600000,
    );
  }

  return getMaxPaidHours(new Date(startMs));
}

export function BookingModal({
  station,
  onClose,
}: {
  station: ClientStation;
  onClose: () => void;
}) {
  const router = useRouter();
  const createBooking = useCreateClientBooking();

  const [startTime, setStartTime] = useState(() =>
    toLocalInput(new Date(Date.now() + 30 * 60000)),
  );
  const [hours, setHours] = useState(1);

  const startDate = new Date(startTime);
  const validStart = Number.isNaN(startDate.getTime()) ? new Date() : startDate;
  const maxPaidHours = computeMaxPaidHours(station, validStart.getTime());
  const effectiveHours = Math.min(hours, Math.max(1, maxPaidHours));
  const pricing = computePackagePrice(station.isVip, effectiveHours, validStart);
  const canBook = maxPaidHours >= 1;

  const submit = () => {
    if (!canBook) return;

    createBooking.mutate(
      {
        stationId: station.id,
        startTime: validStart.toISOString(),
        hours: effectiveHours,
      },
      {
        onSuccess: (res) => {
          onClose();
          router.push(`/pay/${res.booking.id}`);
        },
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
        <DialogHeader>
          <DialogTitle>Бронь станции {station.name}</DialogTitle>
          <DialogDescription>
            Выберите время начала и длительность сеанса.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {station.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {station.images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${station.name} · фото ${i + 1}`}
                  className="size-24 shrink-0 rounded-xl border border-white/10 object-cover"
                />
              ))}
            </div>
          )}

          <StationGames games={station.games} />

          <div className="space-y-1.5">
            <Label htmlFor="booking-start">Начало</Label>
            <Input
              id="booking-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                const max = computeMaxPaidHours(
                  station,
                  new Date(e.target.value).getTime(),
                );
                if (max >= 1) setHours((h) => Math.min(h, max));
              }}
            />
          </div>

          {maxPaidHours >= 1 ? (
            <div className="space-y-1.5">
              <Label htmlFor="booking-hours">Количество часов</Label>
              <Input
                id="booking-hours"
                type="number"
                inputMode="numeric"
                min={1}
                max={maxPaidHours}
                value={hours}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  setHours(
                    Number.isNaN(n) || n < 1 ? 1 : Math.min(n, maxPaidHours),
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">
                Доступно максимум {maxPaidHours} ч в этом слоте
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
              В выбранное время станция занята. Выберите другое время.
            </div>
          )}

          <div className="rounded-xl bg-white/[0.04] p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">
              {formatTenge(pricing.price)}
            </div>
            <div className="text-xs text-muted-foreground">
              Итого · {pricing.rate}₸/час
              {pricing.freeHours > 0 ? ` · +${pricing.freeHours}ч в подарок` : ""}
            </div>
          </div>

          {createBooking.isError && (
            <p className="text-sm text-red-400">
              Не удалось создать бронь. Попробуйте другое время.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!canBook || createBooking.isPending}>
            {createBooking.isPending ? "Создание…" : "Забронировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
