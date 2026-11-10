import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSessionToken } from "@/lib/jwt";
import { setAdminCookie } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { login?: string; password?: string };

  try {
    body = (await request.json()) as { login?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const username = (body.login ?? "").trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Введите логин и пароль" },
      { status: 400 },
    );
  }

  const adminUser = await prisma.adminUser.findUnique({ where: { username } });

  if (!adminUser) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 },
    );
  }

  const passwordMatches = await bcrypt.compare(password, adminUser.password);

  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 },
    );
  }

  const token = await signSessionToken({
    id: adminUser.id,
    login: adminUser.username,
    role: adminUser.role,
  });

  await setAdminCookie(token);

  return NextResponse.json({ ok: true });
}
