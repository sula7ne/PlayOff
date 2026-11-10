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

  const stations = await prisma.station.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ stations });
}
