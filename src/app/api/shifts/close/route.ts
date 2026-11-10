import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shift = await prisma.workShift.findFirst({
    where: { adminId: admin.id, status: "OPEN" },
  });

  if (!shift) {
    return NextResponse.json({ error: "Нет открытой смены" }, { status: 400 });
  }

  const transactions = await prisma.financeTransaction.findMany({
    where: { shiftId: shift.id, type: "INCOME" },
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const cash = transactions
    .filter((t) => t.paymentMethod === "CASH")
    .reduce((sum, t) => sum + t.amount, 0);
  const nonCash = totalRevenue - cash;
  const bar = transactions
    .filter((t) => (t.category ?? "").startsWith("Бар"))
    .reduce((sum, t) => sum + t.amount, 0);
  const station = transactions
    .filter((t) => (t.category ?? "") === "GAMING_SESSION")
    .reduce((sum, t) => sum + t.amount, 0);

  const closed = await prisma.workShift.update({
    where: { id: shift.id },
    data: {
      status: "CLOSED",
      endTime: new Date(),
      totalRevenue,
      finalCash: shift.initialCash + cash,
    },
  });

  return NextResponse.json({
    shift: closed,
    report: {
      totalRevenue,
      cash,
      nonCash,
      bar,
      station,
      initialCash: shift.initialCash,
      finalCash: closed.finalCash,
    },
  });
}
