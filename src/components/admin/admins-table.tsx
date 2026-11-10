"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteAdmin,
  useUpdateAdmin,
  type AdminUser,
} from "@/hooks/use-admins";

function RoleBadge({ role }: { role: "ADMIN" | "SUPER_ADMIN" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        role === "SUPER_ADMIN"
          ? "bg-accent/15 text-accent ring-accent/30"
          : "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
      )}
    >
      {role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
    </span>
  );
}

export function AdminsTable({ admins }: { admins: AdminUser[] }) {
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Логин</th>
            <th className="px-4 py-3 font-medium">Имя</th>
            <th className="px-4 py-3 font-medium">Роль</th>
            <th className="px-4 py-3 text-right font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr
              key={admin.id}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
            >
              <td className="px-4 py-3 font-medium">{admin.username}</td>
              <td className="px-4 py-3">{admin.name ?? "—"}</td>
              <td className="px-4 py-3">
                <Select
                  value={admin.role}
                  onValueChange={(value) =>
                    updateAdmin.mutate({
                      id: admin.id,
                      role: value as "ADMIN" | "SUPER_ADMIN",
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <RoleBadge role={admin.role} />
                  <button
                    type="button"
                    onClick={() => deleteAdmin.mutate(admin.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Удалить админа"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
