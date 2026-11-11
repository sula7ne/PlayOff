import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildKaspiDeeplink } from "@/lib/kaspi";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId: session.id },
    include: { station: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Бронь не найдена" }, { status: 404 });
  }

  if (booking.status !== "PENDING") {
    return NextResponse.json(
      { error: "Бронь нельзя оплатить" },
      { status: 409 },
    );
  }

  const deeplink = buildKaspiDeeplink(
    booking.kaspiPaymentId ?? booking.id,
    booking.totalPrice,
  );

  return NextResponse.json({
    deeplink,
    name: booking.station?.name ?? "",
    expiresAt: booking.expiresAt,
    amount: booking.totalPrice,
  });
}
