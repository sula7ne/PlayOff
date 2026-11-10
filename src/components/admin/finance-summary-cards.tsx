import type { ReactNode } from "react";
import { Banknote, QrCode, Wallet } from "lucide-react";
import { formatTenge } from "@/lib/format";
import type { FinanceSummary } from "@/hooks/use-finance";

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold tabular-nums">
        {formatTenge(value)}
      </div>
    </div>
  );
}

export function FinanceSummaryCards({
  summary,
}: {
  summary: FinanceSummary;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Stat
        icon={<Wallet className="size-4 text-accent" />}
        label="Выручка за смену"
        value={summary.total}
      />
      <Stat
        icon={<QrCode className="size-4 text-red-400" />}
        label="Kaspi QR"
        value={summary.kaspi}
      />
      <Stat
        icon={<Banknote className="size-4 text-emerald-400" />}
        label="Наличные"
        value={summary.cash}
      />
    </div>
  );
}
