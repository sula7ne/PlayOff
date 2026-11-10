import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { userSchema } from "@/lib/validations";
import type { UserRank } from "@/generated/prisma/enums";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();

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

  const result = userSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { xp, balance, rank } = result.data;

  const data: {
    xp?: number;
    balance?: number;
    rank?: UserRank;
  } = {};

  if (xp !== undefined) {
    data.xp = xp;
  }

  if (balance !== undefined) {
    data.balance = balance;
  }

  if (rank) {
    data.rank = rank;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
