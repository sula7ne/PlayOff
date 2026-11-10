import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type PaymentMethod = "CASH" | "KASPI_QR";

export type Booking = {
  id: string;
  stationId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  user: { id: string; phone: string; name: string | null } | null;
  station: {
    id: string;
    name: string;
  } | null;
};

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () =>
      apiFetch<{ bookings: Booking[] }>("/api/admin/bookings").then(
        (data) => data.bookings,
      ),
    refetchInterval: 15_000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      phone: string;
      name?: string;
      stationId: string;
      startTime: string;
      endTime: string;
      totalPrice?: number;
    }) =>
      apiFetch("/api/admin/bookings", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      apiFetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
