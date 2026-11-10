import { Receipt } from "lucide-react";
import { TransactionRow } from "@/components/admin/finance/transaction-row";
import type { Transaction } from "@/hooks/use-finance";

export function TransactionsTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <Receipt className="size-4 text-accent" />
        <h2 className="text-sm font-semibold">Транзакции за выбранный период</h2>
      </div>
      <ul className="divide-y divide-white/5">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </ul>
    </div>
  );
}
