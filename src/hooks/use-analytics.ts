import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type RevenuePoint = {
  key: string;
  console: number;
  bar: number;
};

export type Granularity = "hour" | "day";

export function useAnalytics(from?: string | null, to?: string | null) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();

  return useQuery({
    queryKey: ["analytics", from, to],
    queryFn: () =>
      apiFetch<{ data: RevenuePoint[]; granularity: Granularity }>(
        `/api/admin/analytics${qs ? `?${qs}` : ""}`,
      ),
    refetchInterval: 15_000,
  });
}
