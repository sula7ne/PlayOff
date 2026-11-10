import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PaymentMethod } from "@/hooks/use-bookings";

export type BarItem = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  number: number;
  stationId: string | null;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  refundedAt: string | null;
  items: {
    id: string;
    quantity: number;
    barItem: { id: string; name: string; price: number };
  }[];
  station: { id: string; name: string } | null;
};

export function useBarItems() {
  return useQuery({
    queryKey: ["bar-items"],
    queryFn: () =>
      apiFetch<{ items: BarItem[] }>("/api/admin/bar").then((d) => d.items),
  });
}

export function useCreateBarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      name: string;
      code?: string | null;
      category?: string;
      price: number;
      stock?: number;
      imageUrl?: string | null;
    }) =>
      apiFetch("/api/admin/bar", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bar-items"] });
    },
  });
}

export function useUpdateBarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      code,
      category,
      price,
      stock,
      imageUrl,
    }: {
      id: string;
      name?: string;
      code?: string | null;
      category?: string;
      price?: number;
      stock?: number;
      imageUrl?: string | null;
    }) =>
      apiFetch(`/api/admin/bar/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, code, category, price, stock, imageUrl }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bar-items"] });
    },
  });
}

export function useDeleteBarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/bar/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bar-items"] });
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      apiFetch<{ orders: Order[] }>("/api/admin/orders").then((d) => d.orders),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      stationId?: string | null;
      paymentMethod: PaymentMethod;
      items: { id: string; quantity: number }[];
    }) =>
      apiFetch("/api/admin/orders", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["bar-items"] });
      void queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/orders/${id}/refund`, { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["bar-items"] });
      void queryClient.invalidateQueries({ queryKey: ["finance"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["revenue-breakdown"] });
    },
  });
}
