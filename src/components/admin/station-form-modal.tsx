"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MultiImageUploader } from "@/components/admin/multi-image-uploader";
import { useCreateStation, useUpdateStation } from "@/hooks/use-stations";
import type { Station } from "@/types/station";

function StationForm({
  station,
  onClose,
}: {
  station: Station | null;
  onClose: () => void;
}) {
  const createStation = useCreateStation();
  const updateStation = useUpdateStation();

  const [name, setName] = useState(station?.name ?? "");
  const [isVip, setIsVip] = useState(station?.isVip ?? false);
  const [images, setImages] = useState<string[]>(station?.images ?? []);
  const [gamesText, setGamesText] = useState(station?.games?.join(", ") ?? "");
  const [maintenance, setMaintenance] = useState(
    station?.status === "MAINTENANCE",
  );

  const isPending = createStation.isPending || updateStation.isPending;
  const isError = createStation.isError || updateStation.isError;

  const games = gamesText
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    if (station) {
      updateStation.mutate(
        {
          id: station.id,
          name: name.trim(),
          images,
          games,
          status: maintenance ? "MAINTENANCE" : "FREE",
        },
        { onSuccess: onClose },
      );
    } else {
      createStation.mutate(
        {
          name: name.trim(),
          isVip,
          images,
          games,
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{station ? station.name : "Добавить станцию"}</DialogTitle>
        <DialogDescription>
          {station
            ? "Название, фотографии и игры станции."
            : "Новая игровая станция на карте."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="st-name">Название</Label>
          <Input
            id="st-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="№ 2 или VIP № 5"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Фотографии</Label>
          <MultiImageUploader value={images} onChange={setImages} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="st-games">Игры (через запятую)</Label>
          <Input
            id="st-games"
            value={gamesText}
            onChange={(e) => setGamesText(e.target.value)}
            placeholder="FIFA, GTA V, Mortal Kombat"
          />
          {games.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {games.map((g) => (
                <Badge key={g}>{g}</Badge>
              ))}
            </div>
          )}
        </div>

        {!station ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
              className="size-4 rounded border-white/20 bg-white/5 accent-accent"
            />
            VIP-станция
          </label>
        ) : (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="size-4 rounded border-white/20 bg-white/5 accent-accent"
            />
            Обслуживание / ремонт
          </label>
        )}
      </div>

      {isError && (
        <p className="text-sm text-red-400">Не удалось сохранить станцию.</p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Сохранение…" : station ? "Сохранить" : "Добавить"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function StationFormModal({
  station,
  open,
  onOpenChange,
}: {
  station: Station | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {station ? (
          <StationForm
            key={station.id}
            station={station}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <StationForm station={null} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
