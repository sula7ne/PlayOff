import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { cancelExpiredPendingBookings } from "@/lib/booking-cleanup";
import {
  buildKaspiDeeplink,
  PENDING_TTL_MS,
} from "@/lib/kaspi";
import { computePackagePrice, getMaxPaidHours } from "@/lib/pricing";
import { clientBookingSchema } from "@/lib/validations";

export async function GET() {
  const session = await requireUser();

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await cancelExpiredPendingBookings();

  const bookings = await prisma.booking.findMany({
    where: { userId: session.id },
    include: { station: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

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

  const result = clientBookingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { stationId, startTime, hours } = result.data;

  const station = await prisma.station.findUnique({ where: { id: stationId } });

  if (!station) {
    return NextResponse.json({ error: "Станция не найдена" }, { status: 404 });
  }

  if (station.status !== "FREE") {
    return NextResponse.json({ error: "Станция занята" }, { status: 409 });
  }

  const start = new Date(startTime);
  const maxHours = getMaxPaidHours(start);

  if (hours > maxHours) {
    return NextResponse.json(
      { error: `Максимум ${maxHours} ч (клуб работает до 02:00)` },
      { status: 400 },
    );
  }

  const pricing = computePackagePrice(station.isVip, hours, start);
  const end = new Date(start.getTime() + pricing.totalHours * 3600 * 1000);
  const totalPrice = pricing.price;

  const kaspiPaymentId = randomUUID();
  const expiresAt = new Date(Date.now() + PENDING_TTL_MS);

  const booking = await prisma.booking.create({
    data: {
      userId: session.id,
      stationId,
      startTime: start,
      endTime: end,
      status: "PENDING",
      paymentMethod: "KASPI_QR",
      totalPrice,
      expiresAt,
      kaspiPaymentId,
    },
    include: { station: true },
  });

  const deeplink = buildKaspiDeeplink(kaspiPaymentId, totalPrice);

  return NextResponse.json({ booking, deeplink }, { status: 201 });
}
