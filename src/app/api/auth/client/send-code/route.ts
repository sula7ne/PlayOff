import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidKzPhone, normalizePhone } from "@/lib/phone";

const CODE_TTL_MS = 3 * 60 * 1000;
const RESEND_INTERVAL_MS = 60 * 1000;

export async function POST(request: Request) {
  let body: { phone?: string };

  try {
    body = (await request.json()) as { phone?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");

  if (!phone || !isValidKzPhone(phone)) {
    return NextResponse.json(
      { error: "Некорректный номер телефона" },
      { status: 400 },
    );
  }

  const latest = await prisma.verificationCode.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });

  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_INTERVAL_MS) {
    return NextResponse.json(
      { error: "Подождите перед повторной отправкой" },
      { status: 429 },
    );
  }

  await prisma.verificationCode.deleteMany({ where: { phone } });

  const code = String(Math.floor(1000 + Math.random() * 9000));

  await prisma.verificationCode.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  return NextResponse.json({ success: true });
}
