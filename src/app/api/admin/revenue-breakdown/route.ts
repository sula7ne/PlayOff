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
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  const dateFilter =
    fromDate || toDate
      ? {
          createdAt: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          },
        }
      : undefined;

  const adminFilter = adminId && adminId !== "all" ? { adminId } : undefined;

  const transactions = await prisma.financeTransaction.findMany({
    where: { type: "INCOME", ...dateFilter, ...adminFilter },
    include: {
      booking: { include: { station: true } },
      order: { include: { items: { include: { barItem: true } } } },
      gamingSession: { include: { station: true } },
    },
  });

  let vipTotal = 0;
  let standardTotal = 0;
  let barTotal = 0;
  const barByCategory = new Map<string, number>();
  const barByProduct = new Map<string, { category: string; value: number }>();

  for (const t of transactions) {
    const category = t.category ?? "";

    if (category.startsWith("Бар")) {
      barTotal += t.amount;

      if (t.order) {
        for (const item of t.order.items) {
          const amount = item.price * item.quantity;
          const cat = item.barItem.category ?? "Прочее";
          barByCategory.set(cat, (barByCategory.get(cat) ?? 0) + amount);

          const existing = barByProduct.get(item.barItem.name);
          if (existing) {
            existing.value += amount;
          } else {
            barByProduct.set(item.barItem.name, {
              category: cat,
              value: amount,
            });
          }
        }
      }
    } else if (category === "GAMING_SESSION") {
      if (t.gamingSession?.station?.isVip) {
        vipTotal += t.amount;
      } else {
        standardTotal += t.amount;
      }
    } else if (category.startsWith("Бронь")) {
      if (t.booking?.station?.isVip) {
        vipTotal += t.amount;
      } else {
        standardTotal += t.amount;
      }
    } else {
      standardTotal += t.amount;
    }
  }

  const playstation = vipTotal + standardTotal;

  return NextResponse.json({
    playstation,
    bar: barTotal,
    playstationDetails: [
      { name: "VIP залы", value: vipTotal },
      { name: "Standard залы", value: standardTotal },
    ],
    barCategories: Array.from(barByCategory.entries()).map(([name, value]) => ({
      name,
      value,
    })),
    barProducts: Array.from(barByProduct.entries()).map(
      ([name, { category, value }]) => ({ name, category, value }),
    ),
  });
}
