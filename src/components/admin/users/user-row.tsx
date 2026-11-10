import { Zap } from "lucide-react";
import { formatTenge } from "@/lib/format";
import { UserRankBadge } from "@/components/admin/user-rank-badge";
import { UserActions } from "@/components/admin/users/user-actions";
import type { Player } from "@/hooks/use-users";

export function UserRow({ player }: { player: Player }) {
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">
          {player.name ?? player.phone}
        </div>
        <div className="text-xs text-muted-foreground">{player.phone}</div>
      </td>
      <td className="px-4 py-3">
        <UserRankBadge rank={player.rank} />
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 font-medium tabular-nums">
          <Zap className="size-3.5 text-amber-400" />
          {player.xp.toLocaleString("ru-RU")}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums">
        {formatTenge(player.balance)}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <UserActions playerId={player.id} xp={player.xp} />
        </div>
      </td>
    </tr>
  );
}
