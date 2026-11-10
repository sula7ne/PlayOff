import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const apiKey = process.env.KASPI_PAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Kaspi not configured" }, { status: 500 });
  }

  const providedKey = request.headers.get("x-kaspi-api-key");

  if (!providedKey || providedKey !== apiKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { orderId?: string; status?: string; amount?: number };

  try {
    body = (await request.json()) as {
      orderId?: string;
      status?: string;
      amount?: number;
    };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { orderId, status } = body;

  if (!orderId || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: { kaspiPaymentId: orderId },
    include: { station: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (status === "PAID") {
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Booking is not pending" },
        { status: 409 },
      );
    }

    const shift = await prisma.workShift.findFirst({
      where: { status: "OPEN" },
      orderBy: { startTime: "desc" },
    });

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED", expiresAt: null },
      });

      await tx.financeTransaction.create({
        data: {
          amount: booking.totalPrice,
          type: "INCOME",
          paymentMethod: "KASPI_QR",
          category: `Бронь · ${booking.station?.name ?? "?"}`,
          bookingId: booking.id,
          adminId: shift?.adminId ?? null,
          shiftId: shift?.id ?? null,
        },
      });
    }, { timeout: 15000 });

    return NextResponse.json({ ok: true });
  }

  if (status === "FAILED") {
    if (booking.status === "PENDING") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown status" }, { status: 400 });
}
