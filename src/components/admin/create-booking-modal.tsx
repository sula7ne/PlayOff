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
import { useBookingForm } from "@/hooks/use-booking-form";
import { BookingForm } from "@/components/admin/booking-form";

export function CreateBookingModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useBookingForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новое бронирование</DialogTitle>
          <DialogDescription>Оплата брони — только через Kaspi QR.</DialogDescription>
        </DialogHeader>

        <BookingForm form={form} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={form.submit} disabled={form.isPending}>
            {form.isPending ? "Создание…" : "Создать бронирование"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
