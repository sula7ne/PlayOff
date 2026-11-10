import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type AdminUser = {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
};

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: () =>
      apiFetch<{ admins: AdminUser[] }>("/api/admin/admins").then(
        (d) => d.admins,
      ),
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      username: string;
      name: string;
      password: string;
      role: "ADMIN" | "SUPER_ADMIN";
    }) =>
      apiFetch("/api/admin/admins", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      role,
    }: {
      id: string;
      name?: string;
      role?: "ADMIN" | "SUPER_ADMIN";
    }) =>
      apiFetch(`/api/admin/admins/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, role }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/admins/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}
