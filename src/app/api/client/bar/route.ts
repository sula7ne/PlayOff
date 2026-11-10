import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const session = await requireUser();

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await prisma.barItem.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ items });
}
