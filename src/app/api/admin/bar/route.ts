import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { barItemSchema } from "@/lib/validations";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await prisma.barItem.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ items });
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

  const result = barItemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { name, code, category, price, stock, imageUrl } = result.data;

  const item = await prisma.barItem.create({
    data: {
      name,
      code: code?.trim() || null,
      category: category ?? null,
      price,
      stock: stock ?? 0,
      imageUrl: imageUrl ?? null,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
