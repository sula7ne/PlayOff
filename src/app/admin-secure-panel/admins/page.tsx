"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminsTable } from "@/components/admin/admins-table";
import { CreateAdminModal } from "@/components/admin/create-admin-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmins } from "@/hooks/use-admins";

export default function AdminsPage() {
  const { data: admins = [], isLoading, isError } = useAdmins();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Админы</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управление сотрудниками и их ролями.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
        >
          <Plus className="size-4" />
          Добавить админа
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Не удалось загрузить админов.
        </div>
      )}

      {!isLoading && !isError && <AdminsTable admins={admins} />}

      <CreateAdminModal open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
