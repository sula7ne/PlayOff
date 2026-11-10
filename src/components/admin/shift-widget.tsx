"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTenge } from "@/lib/format";
import {
  useCloseShift,
  useCurrentShift,
  useOpenShift,
  type ShiftReport,
} from "@/hooks/use-shift";

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export function ShiftWidget() {
  const { data, isLoading } = useCurrentShift();
  const openShift = useOpenShift();
  const closeShift = useCloseShift();

  const [closeDialog, setCloseDialog] = useState(false);
  const [report, setReport] = useState<ShiftReport | null>(null);

  const isOpen = Boolean(data?.shift);

  const handleClose = () => {
    closeShift.mutate(undefined, {
      onSuccess: (res) => setReport(res.report),
    });
  };

  if (isLoading) {
    return <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-800/50" />;
  }

  return (
    <div className="flex items-center gap-3">
      {isOpen ? (
        <>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
            Смена открыта
          </span>
          <Button
            size="sm"
            className="bg-red-600 text-white hover:bg-red-500"
            onClick={() => setCloseDialog(true)}
          >
            Закрыть смену
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          onClick={() => openShift.mutate()}
          disabled={openShift.isPending}
        >
          {openShift.isPending ? "Открытие…" : "Открыть смену"}
        </Button>
      )}

      <Dialog
        open={closeDialog}
        onOpenChange={(open) => {
          setCloseDialog(open);
          if (!open) {
            setReport(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Закрыть смену</DialogTitle>
            <DialogDescription>Z-отчёт за текущую смену.</DialogDescription>
          </DialogHeader>

          {report ? (
            <div className="space-y-2">
              <ReportRow label="Выручка" value={formatTenge(report.totalRevenue)} />
              <ReportRow label="— Бар" value={formatTenge(report.bar)} />
              <ReportRow label="— Станции" value={formatTenge(report.station)} />
              <ReportRow label="Наличные" value={formatTenge(report.cash)} />
              <ReportRow
                label="Безнал (Kaspi QR)"
                value={formatTenge(report.nonCash)}
              />
              <ReportRow label="Итого в кассе" value={formatTenge(report.finalCash)} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Подтвердите закрытие смены для подсчёта итогов.
            </p>
          )}

          <DialogFooter>
            {report ? (
              <Button onClick={() => setCloseDialog(false)}>Готово</Button>
            ) : (
              <Button onClick={handleClose} disabled={closeShift.isPending}>
                {closeShift.isPending ? "Закрытие…" : "Подтвердить закрытие"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
