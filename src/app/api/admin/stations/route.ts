import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { stationCreateSchema } from "@/lib/validations";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stations = await prisma.station.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ stations });
}

export async function POST(request: Request) {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = stationCreateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { name, isVip, posX, posY, images, games } = result.data;

  try {
    const station = await prisma.station.create({
      data: {
        name,
        isVip: isVip ?? false,
        posX: posX ?? 0,
        posY: posY ?? 0,
        images: images ?? [],
        games: games ?? [],
      },
    });

    return NextResponse.json({ station }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 400 },
    );
  }
}
