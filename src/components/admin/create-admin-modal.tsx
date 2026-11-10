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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAdmin } from "@/hooks/use-admins";

export function CreateAdminModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createAdmin = useCreateAdmin();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");

  const handleSubmit = () => {
    if (!username.trim() || !name.trim() || !password.trim()) {
      return;
    }

    createAdmin.mutate(
      {
        username: username.trim(),
        name: name.trim(),
        password: password.trim(),
        role,
      },
      {
        onSuccess: () => {
          setUsername("");
          setName("");
          setPassword("");
          setRole("ADMIN");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Добавить админа</DialogTitle>
          <DialogDescription>Создание нового администратора.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ad-username">Логин (username)</Label>
            <Input
              id="ad-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin2"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-name">Имя</Label>
            <Input
              id="ad-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-password">Пароль</Label>
            <Input
              id="ad-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Роль</Label>
            <Select
              value={role}
              onValueChange={(v) =>
                setRole(v === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Админ</SelectItem>
                <SelectItem value="SUPER_ADMIN">Супер-админ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {createAdmin.isError && (
            <p className="text-sm text-red-400">Не удалось создать админа.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={createAdmin.isPending}>
            {createAdmin.isPending ? "Создание…" : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
