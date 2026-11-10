import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { stationSchema, stationUpdateSchema } from "@/lib/validations";
import { computePriceWithOverrides } from "@/lib/pricing";
import type { StationStatus } from "@/generated/prisma/enums";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const isParamUpdate =
    typeof body === "object" &&
    body !== null &&
    ("name" in body || "images" in body || "games" in body);

  if (isParamUpdate) {
    return handleParamUpdate(id, body);
  }

  return handleStatusChange(id, body);
}

async function handleStatusChange(id: string, body: unknown) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = stationSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { status, durationHours, applyHappyHour, applyPromo21 } = result.data;

  const data: {
    status?: StationStatus;
    busySince?: Date | null;
  } = {};

  if (status) {
    data.status = status;
    data.busySince = status === "BUSY" ? new Date() : null;
  }

  if (status === "BUSY") {
    const shift = await prisma.workShift.findFirst({
      where: { adminId: admin.id, status: "OPEN" },
      orderBy: { startTime: "desc" },
    });

    if (!shift) {
      return NextResponse.json({ error: "SHIFT_REQUIRED" }, { status: 400 });
    }

    const activeSession = await prisma.gamingSession.findFirst({
      where: { stationId: id, endTime: null },
    });

    if (activeSession) {
      return NextResponse.json(
        { error: "Сессия уже запущена" },
        { status: 409 },
      );
    }
  }

  try {
    const station = await prisma.$transaction(async (tx) => {
      const updated = await tx.station.update({
        where: { id },
        data,
      });

      if (status === "BUSY") {
        const shift = await tx.workShift.findFirst({
          where: { adminId: admin.id, status: "OPEN" },
          orderBy: { startTime: "desc" },
        });

        const existing = await tx.gamingSession.findFirst({
          where: { stationId: id, endTime: null },
        });

        if (existing) {
          throw new Error("SESSION_ACTIVE");
        }

        const session = await tx.gamingSession.create({
          data: {
            stationId: id,
            adminId: admin.id,
            shiftId: shift?.id ?? null,
            durationHours: durationHours ?? null,
            applyHappyHour: applyHappyHour ?? null,
            applyPromo21: applyPromo21 ?? null,
          },
        });

        if (session.durationHours !== null) {
          const { price: amount } = computePriceWithOverrides(
            updated.isVip,
            session.durationHours,
            session.startTime,
            0,
            session.applyHappyHour,
            session.applyPromo21,
          );

          await tx.financeTransaction.create({
            data: {
              amount,
              type: "INCOME",
              paymentMethod: "CASH",
              category: "GAMING_SESSION",
              adminId: admin.id,
              shiftId: session.shiftId,
              gamingSessionId: session.id,
            },
          });
        }
      }

      if (status === "FREE" || status === "RESERVED") {
        const session = await tx.gamingSession.findFirst({
          where: { stationId: id, endTime: null },
          orderBy: { startTime: "desc" },
        });

        if (session) {
          const endTime = new Date();
          const elapsedHours =
            (endTime.getTime() - session.startTime.getTime()) / 3600000;

          const { price: amount } = computePriceWithOverrides(
            updated.isVip,
            session.durationHours,
            session.startTime,
            elapsedHours,
            session.applyHappyHour,
            session.applyPromo21,
          );

          await tx.gamingSession.update({
            where: { id: session.id },
            data: { endTime, totalPrice: amount },
          });

          const existing = await tx.financeTransaction.findFirst({
            where: { gamingSessionId: session.id },
          });

          if (!existing) {
            await tx.financeTransaction.create({
              data: {
                amount,
                type: "INCOME",
                paymentMethod: "CASH",
                category: "GAMING_SESSION",
                adminId: admin.id,
                shiftId: session.shiftId,
                gamingSessionId: session.id,
              },
            });
          }
        }
      }

      return updated;
    }, { timeout: 15000 });

    return NextResponse.json({ station });
  } catch (error) {
    if (error instanceof Error && error.message === "SESSION_ACTIVE") {
      return NextResponse.json(
        { error: "Сессия уже запущена" },
        { status: 409 },
      );
    }
    console.error("Station status change error:", error);
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }
}

async function handleParamUpdate(id: string, body: unknown) {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = stationUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { name, status, posX, posY, images, games } = result.data;

  const data: {
    name?: string;
    status?: StationStatus;
    busySince?: Date | null;
    posX?: number;
    posY?: number;
    images?: string[];
    games?: string[];
  } = {};

  if (name !== undefined) {
    data.name = name;
  }

  if (posX !== undefined) {
    data.posX = posX;
  }

  if (posY !== undefined) {
    data.posY = posY;
  }

  if (images !== undefined) {
    data.images = images;
  }

  if (games !== undefined) {
    data.games = games;
  }

  if (status !== undefined) {
    data.status = status;
    data.busySince = null;
  }

  try {
    const station = await prisma.station.update({
      where: { id },
      data,
    });

    return NextResponse.json({ station });
  } catch {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.station.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }
}
