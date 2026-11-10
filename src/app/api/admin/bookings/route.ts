import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { bookingSchema } from "@/lib/validations";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({
    include: {
      user: true,
      station: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = bookingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { phone, name, stationId, startTime, endTime, totalPrice } =
    result.data;

  const shift = await prisma.workShift.findFirst({
    where: { adminId: admin.id, status: "OPEN" },
    orderBy: { startTime: "desc" },
  });

  if (!shift) {
    return NextResponse.json({ error: "SHIFT_REQUIRED" }, { status: 400 });
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { phone } });

      if (!user) {
        user = await tx.user.create({ data: { phone, name: name ?? null } });
      }

      const station = await tx.station.findUnique({ where: { id: stationId } });

      const created = await tx.booking.create({
        data: {
          userId: user.id,
          stationId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: "CONFIRMED",
          paymentMethod: "KASPI_QR",
          totalPrice: totalPrice ?? 0,
        },
        include: { user: true, station: true },
      });

      const shift = await tx.workShift.findFirst({
        where: { adminId: admin.id, status: "OPEN" },
        orderBy: { startTime: "desc" },
      });

      await tx.financeTransaction.create({
        data: {
          amount: created.totalPrice,
          type: "INCOME",
          paymentMethod: "KASPI_QR",
          category: `Бронь · ${station?.name ?? "?"}`,
          bookingId: created.id,
          adminId: admin.id,
          shiftId: shift?.id ?? null,
        },
      });

      return created;
    }, { timeout: 15000 });

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 400 },
    );
  }
}
