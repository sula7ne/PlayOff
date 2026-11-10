import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.workShift.findFirst({
    where: { adminId: admin.id, status: "OPEN" },
  });

  if (existing) {
    return NextResponse.json({ error: "Смена уже открыта" }, { status: 409 });
  }

  const shift = await prisma.workShift.create({
    data: {
      adminId: admin.id,
      status: "OPEN",
      initialCash: 0,
    },
  });

  return NextResponse.json({ shift }, { status: 201 });
}
