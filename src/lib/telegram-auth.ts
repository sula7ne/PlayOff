import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramInitDataUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

export type TelegramInitData = {
  user: TelegramInitDataUser;
  authDate: number;
};

export function validateTelegramInitData(
  initData: string,
  botToken: string,
): TelegramInitData | null {
  const params = new Map<string, string>();

  for (const pair of initData.split("&")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    params.set(pair.slice(0, idx), pair.slice(idx + 1));
  }

  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculated = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const expected = Buffer.from(calculated, "hex");
  const received = Buffer.from(hash, "hex");

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  const userRaw = params.get("user");
  if (!userRaw) return null;

  let user: TelegramInitDataUser;

  try {
    user = JSON.parse(decodeURIComponent(userRaw)) as TelegramInitDataUser;
  } catch {
    return null;
  }

  if (!user || typeof user.id !== "number") {
    return null;
  }

  const authDate = Number(params.get("auth_date") ?? 0);

  return { user, authDate };
}
