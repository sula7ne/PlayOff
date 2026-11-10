import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type BreakdownSegment = { name: string; value: number };

export type RevenueBreakdown = {
  playstation: number;
  bar: number;
  playstationDetails: BreakdownSegment[];
  barCategories: BreakdownSegment[];
  barProducts: { name: string; category: string; value: number }[];
};

export function useRevenueBreakdown(
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
    queryKey: ["revenue-breakdown", from, to, adminId],
    queryFn: () =>
      apiFetch<RevenueBreakdown>(
        `/api/admin/revenue-breakdown${qs ? `?${qs}` : ""}`,
      ),
    refetchInterval: 15_000,
  });
}
