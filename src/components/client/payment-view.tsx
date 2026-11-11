"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import {
  useCancelClientBooking,
  useClientBookingPay,
} from "@/hooks/use-client";
import { hapticImpact } from "@/lib/telegram";
import { formatTenge } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PaymentView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const cancelBooking = useCancelClientBooking();
  const { data, isLoading, isError } = useClientBookingPay(bookingId);

  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmBack, setConfirmBack] = useState(false);

  const expiresAt = data?.expiresAt ?? "";
  const name = data?.name ?? "";
  const deeplink = data?.deeplink ?? "";
  const amount = data?.amount ?? 0;

  useEffect(() => {
    if (!expiresAt) return;

    const expires = new Date(expiresAt).getTime();
    const id = setInterval(() => {
      const remaining = expires - Date.now();
      setRemainingMs(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(id);
  }, [expiresAt]);

  const expired = remainingMs !== null && remainingMs <= 0;

  const handleCancel = () => {
    setConfirmCancel(false);
    cancelBooking.mutate(bookingId, {
      onSuccess: () => router.push("/"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Бронь недоступна для оплаты (отменена или уже оплачена).
        </p>
        <Button onClick={() => router.push("/")}>На карту</Button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      <button
        type="button"
        onClick={() => {
          hapticImpact("selection");
          setConfirmBack(true);
        }}
        className="mb-3 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Назад
      </button>

      <h1 className="text-xl font-bold tracking-tight">Бронь · {name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Оплата бронирования станции.
      </p>

      {expired ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
            Время вышло, бронь отменена. Попробуйте снова.
          </div>
          <Button className="w-full" onClick={() => router.push("/")}>
            На карту
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Оплатите заказ в течение 5 минут, иначе бронь будет снята и станция
            станет доступна другим.
          </p>

          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <Clock className="size-6 text-accent" />
            <div className="mt-2 text-4xl font-bold tabular-nums">
              {remainingMs !== null ? formatRemaining(remainingMs) : "5:00"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              до отмены брони
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.04] p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">
              {formatTenge(amount)}
            </div>
            <div className="text-xs text-muted-foreground">К оплате</div>
          </div>

          <a
            href={deeplink}
            onClick={() => hapticImpact("light")}
            className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
          >
            Оплатить через Kaspi
          </a>

          <Button
            variant="outline"
            className="w-full text-red-400 hover:text-red-300"
            onClick={() => {
              hapticImpact("selection");
              setConfirmCancel(true);
            }}
            disabled={cancelBooking.isPending}
          >
            Отменить бронирование
          </Button>
        </div>
      )}

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Отменить бронирование?</DialogTitle>
            <DialogDescription>
              Бронь будет снята, и станция «{name}» станет доступна другим.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>
              Нет
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? "Отмена…" : "Да, отменить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBack} onOpenChange={setConfirmBack}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Уйти со страницы?</DialogTitle>
            <DialogDescription>
              Бронь останется активной до конца таймера. Если вы не оплатите
              вовремя, она будет снята автоматически.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBack(false)}>
              Остаться
            </Button>
            <Button onClick={() => router.push("/")}>Уйти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
