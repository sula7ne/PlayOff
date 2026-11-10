import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTenge, formatTime } from "@/lib/format";
import { PaymentBadge } from "@/components/admin/badges";
import type { Transaction } from "@/hooks/use-finance";

export function TransactionRow({
  transaction,
}: {
  transaction: Transaction;
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {transaction.category ?? "Транзакция"}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatTime(transaction.createdAt)}
        </div>
      </div>
      <PaymentBadge method={transaction.paymentMethod} />
      <span
        className={cn(
          "flex w-28 items-center justify-end gap-1 text-sm font-semibold tabular-nums",
          transaction.type === "INCOME" ? "text-emerald-400" : "text-red-400",
        )}
      >
        <TrendingUp className="size-3.5" />
        {transaction.type === "INCOME" ? "+" : "−"}
        {formatTenge(transaction.amount)}
      </span>
    </li>
  );
}
