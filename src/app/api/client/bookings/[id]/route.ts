import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

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

  return NextResponse.json({ booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.booking.findFirst({
    where: { id, userId: session.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Бронь не найдена" }, { status: 404 });
  }

  if (existing.status !== "PENDING") {
    return NextResponse.json(
      { error: "Бронь нельзя отменить" },
      { status: 409 },
    );
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { station: true },
  });

  return NextResponse.json({ booking });
}
