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

  const now = new Date();

  const stations = await prisma.station.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      bookings: {
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          endTime: { gt: now },
        },
        orderBy: { startTime: "asc" },
        select: { startTime: true, endTime: true, status: true },
      },
    },
  });

  return NextResponse.json({
    stations: stations.map((s) => ({
      id: s.id,
      name: s.name,
      isVip: s.isVip,
      status: s.status,
      posX: s.posX,
      posY: s.posY,
      images: s.images,
      games: s.games,
      upcomingBookings: s.bookings,
    })),
  });
}
