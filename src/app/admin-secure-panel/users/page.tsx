"use client";

import { useState } from "react";
import { Search, Users as UsersIcon } from "lucide-react";
import { UsersTable } from "@/components/admin/users-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/use-users";

export default function UsersPage() {
  const { data: users = [], isLoading, isError } = useUsers();
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const filtered = query
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(query) ||
          u.phone.replace(/\D/g, "").includes(query.replace(/\D/g, "")),
      )
    : users;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Игроки и ранги</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Клиенты клуба, опыт (XP) и ранги в стиле Dota 2.
        </p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или телефону…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pr-3 pl-9 text-sm outline-none backdrop-blur-xl placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Не удалось загрузить игроков.
        </div>
      )}

      {!isLoading && !isError && <UsersTable players={filtered} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-muted-foreground">
          <UsersIcon className="size-8" />
          <p className="mt-2 text-sm">Никого не найдено</p>
        </div>
      )}
    </div>
  );
}
