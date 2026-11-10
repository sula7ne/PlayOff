import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRank } from "@/hooks/use-users";

const RANK_META: Record<UserRank, { label: string; className: string }> = {
  HERALD: {
    label: "Herald",
    className: "bg-stone-500/15 text-stone-300 ring-stone-500/30",
  },
  GUARDIAN: {
    label: "Guardian",
    className: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  },
  CRUSADER: {
    label: "Crusader",
    className: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  },
  ARCHON: {
    label: "Archon",
    className: "bg-violet-500/15 text-violet-400 ring-violet-500/30",
  },
  LEGEND: {
    label: "Legend",
    className: "bg-fuchsia-500/15 text-fuchsia-400 ring-fuchsia-500/30",
  },
  ANCIENT: {
    label: "Ancient",
    className: "bg-red-500/15 text-red-400 ring-red-500/30",
  },
  DIVINE: {
    label: "Divine",
    className: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  },
  TITAN: {
    label: "Titan",
    className: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/30",
  },
};

export function UserRankBadge({ rank }: { rank: UserRank }) {
  const meta = RANK_META[rank];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        meta.className,
      )}
    >
      <Trophy className="size-3" />
      {meta.label}
    </span>
  );
}
