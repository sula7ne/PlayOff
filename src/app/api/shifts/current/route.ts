import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shift = await prisma.workShift.findFirst({
    where: { adminId: admin.id, status: "OPEN" },
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json({ shift });
}
