import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { adminSchema } from "@/lib/validations";

export async function GET() {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admins = await prisma.adminUser.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ admins });
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

  const result = adminSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.format() }, { status: 400 });
  }

  const { username, name, password, role } = result.data;

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const created = await prisma.adminUser.create({
      data: { username, name, password: passwordHash, role },
    });

    return NextResponse.json({ admin: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Пользователь с таким логином уже существует" },
      { status: 409 },
    );
  }
}
