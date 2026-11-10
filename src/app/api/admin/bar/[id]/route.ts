import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { barItemUpdateSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = barItemUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { name, category, price, stock, imageUrl } = result.data;

  const data: {
    name?: string;
    category?: string | null;
    price?: number;
    stock?: number;
    imageUrl?: string | null;
  } = {};

  if (name !== undefined) {
    data.name = name;
  }

  if (category !== undefined) {
    data.category = category ?? null;
  }

  if (price !== undefined) {
    data.price = price;
  }

  if (stock !== undefined) {
    data.stock = stock;
  }

  if (imageUrl !== undefined) {
    data.imageUrl = imageUrl ?? null;
  }

  try {
    const item = await prisma.barItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
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
    await prisma.barItem.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
}
