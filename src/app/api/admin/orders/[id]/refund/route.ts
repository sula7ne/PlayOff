import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  if (order.refundedAt) {
    return NextResponse.json({ error: "Заказ уже возвращён" }, { status: 400 });
  }

  const shift = await prisma.workShift.findFirst({
    where: { adminId: admin.id, status: "OPEN" },
    orderBy: { startTime: "desc" },
  });

  try {
    const refunded = await prisma.$transaction(
      async (tx) => {
        for (const item of order.items) {
          await tx.barItem.update({
            where: { id: item.barItemId },
            data: { stock: { increment: item.quantity } },
          });
        }

        const updated = await tx.order.update({
          where: { id },
          data: { refundedAt: new Date() },
        });

        await tx.financeTransaction.create({
          data: {
            amount: order.totalAmount,
            type: "EXPENSE",
            paymentMethod: order.paymentMethod,
            category: `Возврат · заказ №${order.number}`,
            orderId: order.id,
            adminId: admin.id,
            shiftId: shift?.id ?? null,
          },
        });

        return updated;
      },
      { timeout: 15000 },
    );

    return NextResponse.json({ order: refunded });
  } catch (error) {
    console.error("Order Refund Error:", error);
    return NextResponse.json(
      { error: "Не удалось вернуть заказ" },
      { status: 400 },
    );
  }
}
