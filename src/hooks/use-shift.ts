import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type WorkShift = {
  id: string;
  adminId: string;
  startTime: string;
  endTime: string | null;
  status: "OPEN" | "CLOSED";
  initialCash: number;
  finalCash: number | null;
  totalRevenue: number | null;
};

export type ShiftReport = {
  totalRevenue: number;
  cash: number;
  nonCash: number;
  bar: number;
  station: number;
  initialCash: number;
  finalCash: number;
};

export function useCurrentShift() {
  return useQuery({
    queryKey: ["current-shift"],
    queryFn: () => apiFetch<{ shift: WorkShift | null }>("/api/shifts/current"),
  });
}

export function useOpenShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<{ shift: WorkShift }>("/api/shifts/open", { method: "POST" }),
    onSuccess: (data) => {
      queryClient.setQueryData(["current-shift"], { shift: data.shift });
      void queryClient.invalidateQueries({ queryKey: ["current-shift"] });
    },
  });
}

export function useCloseShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<{ shift: WorkShift; report: ShiftReport }>("/api/shifts/close", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.setQueryData(["current-shift"], { shift: null });
      void queryClient.invalidateQueries({ queryKey: ["current-shift"] });
    },
  });
}
