import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type UserRank =
  | "HERALD"
  | "GUARDIAN"
  | "CRUSADER"
  | "ARCHON"
  | "LEGEND"
  | "ANCIENT"
  | "DIVINE"
  | "TITAN";

export type Player = {
  id: string;
  phone: string;
  name: string | null;
  xp: number;
  balance: number;
  rank: UserRank;
};

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () =>
      apiFetch<{ users: Player[] }>("/api/admin/users").then((d) => d.users),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      xp,
      balance,
      rank,
    }: {
      id: string;
      xp?: number;
      balance?: number;
      rank?: UserRank;
    }) =>
      apiFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ xp, balance, rank }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
