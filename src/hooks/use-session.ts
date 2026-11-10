import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type AdminSession = {
  id: string;
  login: string;
  role: "ADMIN" | "SUPER_ADMIN" | "USER";
};

export function useSession() {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: () => apiFetch<{ session: AdminSession | null }>("/api/auth/me"),
  });
}
