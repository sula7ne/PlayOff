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
};

export type FinanceSummary = {
  total: number;
  kaspi: number;
  cash: number;
};

export function useFinance(from?: string | null, to?: string | null) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();

  return useQuery({
    queryKey: ["finance", from, to],
    queryFn: () =>
      apiFetch<{ summary: FinanceSummary; transactions: Transaction[] }>(
        `/api/admin/finance${qs ? `?${qs}` : ""}`,
      ),
    refetchInterval: 15_000,
  });
}
