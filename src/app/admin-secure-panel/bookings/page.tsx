"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BookingsTable } from "@/components/admin/bookings-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookingFilters,
  type BookingFilter,
} from "@/components/admin/bookings/booking-filters";
import { CreateBookingModal } from "@/components/admin/create-booking-modal";
import { useBookings } from "@/hooks/use-bookings";

export default function BookingsPage() {
  const { data: bookings = [], isLoading, isError } = useBookings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<BookingFilter>("ALL");

  const filtered =
    filter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Бронирования</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Запланированные сеансы с оплатой Kaspi QR.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
        >
          <Plus className="size-4" />
          Новое бронирование
        </button>
      </div>

      <BookingFilters value={filter} onChange={setFilter} />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Не удалось загрузить бронирования.
        </div>
      )}

      {!isLoading && !isError && <BookingsTable bookings={filtered} />}

      <CreateBookingModal open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
