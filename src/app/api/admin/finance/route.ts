import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const adminId = searchParams.get("adminId");

  const dateFilter =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : undefined;

  const adminFilter = adminId && adminId !== "all" ? { adminId } : undefined;

  const transactions = await prisma.financeTransaction.findMany({
    where: { ...dateFilter, ...adminFilter },
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true } } },
  });

  const income = transactions.filter((t) => t.type === "INCOME");
  const expense = transactions.filter((t) => t.type === "EXPENSE");

  const incomeTotal = income.reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = expense.reduce((sum, t) => sum + t.amount, 0);

  const kaspi =
    income
      .filter((t) => t.paymentMethod === "KASPI_QR")
      .reduce((sum, t) => sum + t.amount, 0) -
    expense
      .filter((t) => t.paymentMethod === "KASPI_QR")
      .reduce((sum, t) => sum + t.amount, 0);
  const cash =
    income
      .filter((t) => t.paymentMethod === "CASH")
      .reduce((sum, t) => sum + t.amount, 0) -
    expense
      .filter((t) => t.paymentMethod === "CASH")
      .reduce((sum, t) => sum + t.amount, 0);

  return NextResponse.json({
    summary: {
      total: incomeTotal - expenseTotal,
      kaspi,
      cash,
    },
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      paymentMethod: t.paymentMethod,
      category: t.category,
      createdAt: t.createdAt,
      adminName: t.admin?.name ?? null,
    })),
  });
}
