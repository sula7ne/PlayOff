import { parse, validate } from "@telegram-apps/init-data-node";

export type TelegramInitDataUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type TelegramInitData = {
  user: TelegramInitDataUser;
  auth_date: number;
  hash: string;
};

export function validateTelegramInitData(
  initDataRaw: string,
  botToken: string,
): TelegramInitData | null {
  try {
    // Поддержка mock-авторизации в dev-режиме для тестов в обычном браузере
    // if (
    //   process.env.NODE_ENV === "development" &&
    //   initDataRaw.startsWith("mock_")
    // ) {
    //   return {
    //     auth_date: Math.floor(Date.now() / 1000),
    //     hash: "mock",
    //     user: { id: 673822809, first_name: "Sultan", username: "sula7ne" },
    //   };
    // }

    validate(initDataRaw, botToken, {
      expiresIn: 86400, 
    });

    const parsedData = parse(initDataRaw);

    if (!parsedData.user || typeof parsedData.user.id !== "number") {
      return null;
    }

    return {
      user: parsedData.user as TelegramInitDataUser,
      auth_date: Number(parsedData.authDate || Math.floor(Date.now() / 1000)),
      hash: parsedData.hash,
    };
  } catch (err) {
    console.warn("Telegram initData validation failed:", err);
    return null;
  }
}