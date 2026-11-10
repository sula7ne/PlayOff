import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { signSessionToken } from "@/lib/jwt";
import { setClientCookie } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { phone?: string; code?: string };

  try {
    body = (await request.json()) as { phone?: string; code?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  const code = body.code?.trim() ?? "";

  if (!phone || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const record = await prisma.verificationCode.findFirst({
    where: { phone, code },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.verificationCode.delete({ where: { id: record.id } });
    }

    return NextResponse.json(
      {
        error: "Срок действия кода истек или код недействителен. Запросите новый.",
      },
      { status: 400 },
    );
  }

  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    user = await prisma.user.create({ data: { phone } });
  }

  const token = await signSessionToken({
    id: user.id,
    login: phone,
    role: "USER",
  });

  await setClientCookie(token);
  await prisma.verificationCode.delete({ where: { id: record.id } });

  return NextResponse.json({ success: true });
}
