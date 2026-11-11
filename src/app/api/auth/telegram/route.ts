import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setClientCookie } from "@/lib/auth";
import { signSessionToken } from "@/lib/jwt";
import { validateTelegramInitData } from "@/lib/telegram-auth";

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { error: "Telegram is not configured" },
      { status: 500 },
    );
  }

  let body: { initData?: string };

  try {
    body = (await request.json()) as { initData?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const initData = body.initData;

  if (!initData) {
    return NextResponse.json({ error: "Missing initData" }, { status: 400 });
  }

  const data = validateTelegramInitData(initData, botToken);

  if (!data) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const telegramId = String(data.user.id);
  const name =
    [data.user.first_name, data.user.last_name].filter(Boolean).join(" ") ||
    data.user.username ||
    null;

  let user = await prisma.user.findUnique({ where: { telegramId } });

  if (!user) {
    user = await prisma.user.create({ data: { telegramId, name } });
  } else if (name && user.name !== name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });
  }

  const token = await signSessionToken({
    id: user.id,
    login: user.phone ?? `tg:${telegramId}`,
    role: "USER",
  });

  await setClientCookie(token);

  return NextResponse.json({
    user: {
      id: user.id,
      telegramId: user.telegramId,
      name: user.name,
      phone: user.phone,
      xp: user.xp,
      balance: user.balance,
      rank: user.rank,
    },
  });
}
