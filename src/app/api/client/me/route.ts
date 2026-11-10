import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { cancelExpiredPendingBookings } from "@/lib/booking-cleanup";

export async function GET() {
  const session = await requireUser();

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await cancelExpiredPendingBookings();

  const user = await prisma.user.findUnique({ where: { id: session.id } });

  const now = new Date();
  const activeBooking = await prisma.booking.findFirst({
    where: {
      userId: session.id,
      status: "CONFIRMED",
      startTime: { lte: now },
      endTime: { gte: now },
    },
    include: { station: true },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({
    user: {
      id: user?.id,
      telegramId: user?.telegramId,
      name: user?.name,
      phone: user?.phone,
      xp: user?.xp,
      balance: user?.balance,
      rank: user?.rank,
    },
    activeBooking,
  });
}
