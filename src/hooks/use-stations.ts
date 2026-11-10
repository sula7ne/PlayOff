import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Station, StationStatus } from "@/types/station";

type ApiStation = {
  id: string;
  name: string;
  isVip: boolean;
  status: StationStatus;
  busySince: string | null;
  posX: number;
  posY: number;
  images: string[];
  games: string[];
};

function toStation(raw: ApiStation): Station {
  return {
    id: raw.id,
    name: raw.name,
    isVip: raw.isVip,
    status: raw.status,
    busySinceMs: raw.busySince ? new Date(raw.busySince).getTime() : null,
    posX: raw.posX,
    posY: raw.posY,
    images: raw.images,
    games: raw.games,
  };
}

export function useStations() {
  return useQuery({
    queryKey: ["stations"],
    queryFn: async () => {
      const data = await apiFetch<{ stations: ApiStation[] }>(
        "/api/admin/stations",
      );

      return data.stations.map(toStation);
    },
    refetchInterval: 15_000,
  });
}

export function useUpdateStationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      durationHours,
      applyHappyHour,
      applyPromo21,
    }: {
      id: string;
      status: StationStatus;
      durationHours?: number | null;
      applyHappyHour?: boolean | null;
      applyPromo21?: boolean | null;
    }) =>
      apiFetch(`/api/admin/stations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          durationHours,
          applyHappyHour,
          applyPromo21,
        }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

export type StationInput = {
  name: string;
  isVip?: boolean;
  posX?: number;
  posY?: number;
  images?: string[];
  games?: string[];
};

export type StationUpdateInput = {
  name?: string;
  status?: "FREE" | "MAINTENANCE";
  posX?: number;
  posY?: number;
  images?: string[];
  games?: string[];
};

export function useCreateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StationInput) =>
      apiFetch("/api/admin/stations", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

export function useUpdateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & StationUpdateInput) =>
      apiFetch(`/api/admin/stations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

export function useDeleteStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/stations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}
