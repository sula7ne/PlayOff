"use client";

import { Zap } from "lucide-react";
import { formatTenge } from "@/lib/format";
import { UserRankBadge } from "@/components/admin/user-rank-badge";
import { UserRow } from "@/components/admin/users/user-row";
import { UserActions } from "@/components/admin/users/user-actions";
import type { Player } from "@/hooks/use-users";

export function UsersTable({ players }: { players: Player[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Игрок</th>
              <th className="px-4 py-3 font-medium">Ранг</th>
              <th className="px-4 py-3 font-medium">XP</th>
              <th className="px-4 py-3 text-right font-medium">Баланс</th>
              <th className="px-4 py-3 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <UserRow key={player.id} player={player} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {players.map((player) => (
          <div
            key={player.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{player.name ?? player.phone}</div>
                <div className="text-xs text-muted-foreground">
                  {player.phone}
                </div>
              </div>
              <UserRankBadge rank={player.rank} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Zap className="size-3.5 text-amber-400" />
                {player.xp.toLocaleString("ru-RU")} XP
              </span>
              <span className="font-semibold">{formatTenge(player.balance)}</span>
            </div>
            <div className="mt-3">
              <UserActions playerId={player.id} xp={player.xp} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
