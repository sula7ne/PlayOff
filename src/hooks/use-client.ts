import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type ClientBookingSlot = {
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED";
};

export type ClientStation = {
  id: string;
  name: string;
  isVip: boolean;
  status: "FREE" | "BUSY" | "RESERVED" | "MAINTENANCE";
  posX: number;
  posY: number;
  images: string[];
  games: string[];
  upcomingBookings: ClientBookingSlot[];
};

export type ClientBarItem = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
};

export type ClientProfile = {
  id: string;
  telegramId: string | null;
  name: string | null;
  phone: string | null;
  xp: number;
  balance: number;
  rank: string;
};

export type ClientBooking = {
  id: string;
  stationId: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentMethod: string;
  totalPrice: number;
  expiresAt: string | null;
  station: {
    id: string;
    name: string;
  } | null;
};

export function useClientProfile() {
  return useQuery({
    queryKey: ["client-me"],
    queryFn: () =>
      apiFetch<{
        user: ClientProfile;
        activeBooking: ClientBooking | null;
      }>("/api/client/me"),
  });
}

export function useClientStations() {
  return useQuery({
    queryKey: ["client-stations"],
    queryFn: async () => {
      const data = await apiFetch<{ stations: ClientStation[] }>(
        "/api/client/stations",
      );

      return data.stations;
    },
    refetchInterval: 15_000,
  });
}

export function useClientBar() {
  return useQuery({
    queryKey: ["client-bar"],
    queryFn: () =>
      apiFetch<{ items: ClientBarItem[] }>("/api/client/bar").then(
        (d) => d.items,
      ),
  });
}

export function useClientBookings() {
  return useQuery({
    queryKey: ["client-bookings"],
    queryFn: () =>
      apiFetch<{ bookings: ClientBooking[] }>("/api/client/bookings").then(
        (d) => d.bookings,
      ),
    refetchInterval: 5_000,
  });
}

export type ClientBookingPay = {
  deeplink: string;
  name: string;
  expiresAt: string | null;
  amount: number;
};

export function useClientBookingPay(id: string | null) {
  return useQuery({
    queryKey: ["client-booking-pay", id],
    queryFn: () =>
      apiFetch<ClientBookingPay>(`/api/client/bookings/${id}/pay`),
    enabled: id !== null,
  });
}

export function useCreateClientBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      stationId: string;
      startTime: string;
      hours: number;
    }) =>
      apiFetch<{ booking: ClientBooking; deeplink: string }>(
        "/api/client/bookings",
        { method: "POST", body: JSON.stringify(input) },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["client-stations"] });
    },
  });
}

export function useCancelClientBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/client/bookings/${id}`, { method: "PATCH" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["client-me"] });
      void queryClient.invalidateQueries({ queryKey: ["client-stations"] });
    },
  });
}

export function useCreateClientOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      stationId?: string | null;
      paymentMethod: "CASH" | "KASPI_QR";
      items: { id: string; quantity: number }[];
    }) =>
      apiFetch("/api/client/orders", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["client-bar"] });
      void queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
    },
  });
}
