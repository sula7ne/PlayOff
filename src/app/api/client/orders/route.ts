import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { orderSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await requireUser();

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = orderSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Неверный формат данных", details: result.error.format() },
      { status: 400 },
    );
  }

  const { stationId, paymentMethod, items } = result.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItems: {
        barItemId: string;
        quantity: number;
        price: number;
      }[] = [];

      for (const item of items) {
        const barItem = await tx.barItem.findUnique({ where: { id: item.id } });

        if (!barItem) {
          throw new Error(`Item ${item.id} not found`);
        }

        totalAmount += barItem.price * item.quantity;
        orderItems.push({
          barItemId: item.id,
          quantity: item.quantity,
          price: barItem.price,
        });
      }

      const lastOrder = await tx.order.findFirst({
        orderBy: { number: "desc" },
      });
      const number = Math.max(1000, lastOrder?.number ?? 1000) + 1;

      const created = await tx.order.create({
        data: {
          number,
          userId: session.id,
          stationId: stationId ?? null,
          totalAmount,
          paymentMethod,
          items: { create: orderItems },
        },
        include: { items: { include: { barItem: true } }, station: true },
      });

      for (const item of items) {
        await tx.barItem.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const shift = await tx.workShift.findFirst({
        where: { status: "OPEN" },
        orderBy: { startTime: "desc" },
      });

      await tx.financeTransaction.create({
        data: {
          amount: totalAmount,
          type: "INCOME",
          paymentMethod,
          category: `Бар · заказ №${created.number}`,
          orderId: created.id,
          adminId: shift?.adminId ?? null,
          shiftId: shift?.id ?? null,
        },
      });

      return created;
    }, { timeout: 15000 });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Client Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 400 },
    );
  }
}
