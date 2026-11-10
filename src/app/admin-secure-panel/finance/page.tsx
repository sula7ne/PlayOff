"use client";

import { useState } from "react";
import { FinanceSummaryCards } from "@/components/admin/finance-summary-cards";
import { TransactionsTable } from "@/components/admin/transactions-table";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { RevenueBreakdownChart } from "@/components/admin/revenue-breakdown-chart";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/admin/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "@/hooks/use-finance";
import { useAdmins } from "@/hooks/use-admins";
import { toIso } from "@/lib/period";

export default function FinancePage() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [adminId, setAdminId] = useState("all");

  const { data: admins = [] } = useAdmins();

  const fromIso = toIso(range.from);
  const toIsoStr = toIso(range.to);

  const { data, isLoading, isError } = useFinance(fromIso, toIsoStr, adminId);

  const summary = data?.summary ?? { total: 0, kaspi: 0, cash: 0 };
  const transactions = data?.transactions ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Финансы и касса</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Выручка и аналитика по выбранному периоду.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <DateRangePicker range={range} onChange={setRange} />
        <div className="space-y-1.5">
          <span className="block text-xs text-muted-foreground text-right">Сотрудник</span>
          <Select
            value={adminId}
            onValueChange={(value) => setAdminId(value ?? "all")}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue>
                {(value: string | null) => {
                  if (value && value !== "all") {
                    const admin = admins.find((a) => a.id === value);
                    if (admin) return admin.name || admin.username;
                  }
                  return "Все админы";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все админы</SelectItem>
              {admins.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name || a.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Не удалось загрузить финансы.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <FinanceSummaryCards summary={summary} />

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RevenueChart from={fromIso} to={toIsoStr} adminId={adminId} />
            <RevenueBreakdownChart
              from={fromIso}
              to={toIsoStr}
              adminId={adminId}
            />
          </div>

          <TransactionsTable transactions={transactions} />
        </>
      )}
    </div>
  );
}
