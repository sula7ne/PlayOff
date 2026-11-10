"use client";

import { Zap } from "lucide-react";
import { useUpdateUser } from "@/hooks/use-users";

export function UserActions({
  playerId,
  xp,
}: {
  playerId: string;
  xp: number;
}) {
  const updateUser = useUpdateUser();

  return (
    <button
      type="button"
      onClick={() => updateUser.mutate({ id: playerId, xp: xp + 500 })}
      disabled={updateUser.isPending}
      className="inline-flex items-center gap-1 rounded-lg bg-accent/15 px-2.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
    >
      <Zap className="size-3.5" />
      +500 XP
    </button>
  );
}
