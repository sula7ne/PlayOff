"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useStations, useDeleteStation } from "@/hooks/use-stations";
import { useSession } from "@/hooks/use-session";
import { StationCard } from "@/components/admin/station-card";
import { SessionModal } from "@/components/admin/session-modal";
import { StationFormModal } from "@/components/admin/station-form-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Station } from "@/types/station";

export function StationGrid() {
  const { data: stations = [], isLoading, isError } = useStations();
  const { data: sessionData } = useSession();
  const deleteStation = useDeleteStation();

  const isSuperAdmin = sessionData?.session?.role === "SUPER_ADMIN";

  const [selected, setSelected] = useState<Station | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [deleting, setDeleting] = useState<Station | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isSuperAdmin && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Добавить станцию
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Не удалось загрузить станции. Проверьте подключение к базе данных.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onClick={() => setSelected(station)}
              canManage={isSuperAdmin}
              onEdit={() => setEditing(station)}
              onDelete={() => setDeleting(station)}
            />
          ))}
        </div>
      )}

      <SessionModal
        station={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      />

      <StationFormModal
        station={editing}
        open={formOpen || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
      />

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить станцию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить станцию {deleting?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={deleteStation.isPending}
              onClick={() => {
                if (deleting) {
                  deleteStation.mutate(deleting.id, {
                    onSuccess: () => setDeleting(null),
                  });
                }
              }}
            >
              {deleteStation.isPending ? "Удаление…" : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
