import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PaymentMethod } from "@/hooks/use-bookings";

export type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  paymentMethod: PaymentMethod;
  category: string | null;
  createdAt: string;
  adminName: string | null;
  label: string | null;
};

export type FinanceSummary = {
  total: number;
  kaspi: number;
  cash: number;
};

export type TransactionDetails = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  paymentMethod: PaymentMethod;
  category: string | null;
  createdAt: string;
  adminName: string | null;
  gamingSession: {
    id: string;
    startTime: string;
    endTime: string | null;
    totalPrice: number | null;
    durationHours: number | null;
    applyHappyHour: boolean | null;
    applyPromo21: boolean | null;
    station: { name: string; isVip: boolean } | null;
  } | null;
  order: {
    number: number;
    totalAmount: number;
    refundedAt: string | null;
    station: { name: string } | null;
    items: {
      id: string;
      quantity: number;
      price: number;
      barItem: { name: string; price: number };
    }[];
  } | null;
  booking: {
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
    station: { name: string; isVip: boolean } | null;
    user: { name: string | null; phone: string | null } | null;
  } | null;
};

export function useFinance(
  from?: string | null,
  to?: string | null,
  adminId?: string | null,
) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (adminId && adminId !== "all") params.set("adminId", adminId);
  const qs = params.toString();

  return useQuery({
    queryKey: ["finance", from, to, adminId],
    queryFn: () =>
      apiFetch<{ summary: FinanceSummary; transactions: Transaction[] }>(
        `/api/admin/finance${qs ? `?${qs}` : ""}`,
      ),
    refetchInterval: 15_000,
  });
}

export function useTransactionDetails(id: string | null) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () =>
      apiFetch<{ transaction: TransactionDetails }>(
        `/api/admin/finance/${id}`,
      ),
    enabled: id !== null,
  });
}
