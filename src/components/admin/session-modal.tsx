"use client";

import { Gamepad2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSessionModal } from "@/hooks/use-session-modal";
import { SessionForm } from "@/components/admin/session-form";
import { StationGames } from "@/components/station-games";
import type { Station } from "@/types/station";

export function SessionModal({
  station,
  open,
  onOpenChange,
}: {
  station: Station | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const session = useSessionModal(
    station?.id ?? null,
    station?.isVip ?? false,
    () => onOpenChange(false),
  );

  if (!station) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="size-5 text-accent" />
            {station.name}
          </DialogTitle>
          <DialogDescription>{station.name ?? "Управление станцией"}</DialogDescription>
        </DialogHeader>

        <StationGames games={station.games} />

        {station.status === "FREE" && <SessionForm session={session} />}

        {station.status === "BUSY" && (
          <p className="text-sm text-muted-foreground">Сессия активна. Завершите её, чтобы освободить станцию.</p>
        )}
        {station.status === "RESERVED" && (
          <p className="text-sm text-muted-foreground">Станция забронирована. Можно снять бронь и освободить её.</p>
        )}
        {station.status === "MAINTENANCE" && (
          <p className="text-sm text-muted-foreground">Станция в обслуживании. Верните её в строй для запуска сессий.</p>
        )}

        <DialogFooter>
          {station.status === "FREE" && <Button onClick={() => session.changeStatus("BUSY")}>Запустить сессию</Button>}
          {station.status === "BUSY" && (
            <Button variant="destructive" onClick={() => session.changeStatus("FREE")}>Завершить сессию</Button>
          )}
          {station.status === "RESERVED" && <Button onClick={() => session.changeStatus("FREE")}>Снять бронь</Button>}
          {station.status === "MAINTENANCE" && <Button onClick={() => session.changeStatus("FREE")}>Вернуть в строй</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
