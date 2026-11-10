"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOpenShift } from "@/hooks/use-shift";
import { useShiftModalStore } from "@/store/shift-modal-store";

export function ShiftRequiredModal() {
  const { isOpen, onResolve, close } = useShiftModalStore();
  const openShift = useOpenShift();

  const handleOpen = () => {
    openShift.mutate(undefined, {
      onSuccess: () => {
        const resolve = onResolve;
        close();
        resolve?.();
      },
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Смена закрыта</DialogTitle>
          <DialogDescription>
            Для проведения продаж и запуска станций необходимо открыть смену.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Отмена
          </Button>
          <Button onClick={handleOpen} disabled={openShift.isPending}>
            {openShift.isPending ? "Открытие…" : "Открыть смену"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
