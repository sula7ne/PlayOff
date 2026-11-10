"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Gamepad2, Loader2, Send } from "lucide-react";
import { hapticImpact } from "@/lib/telegram";
import { BottomNav } from "@/components/client/bottom-nav";

type Profile = {
  id: string;
  telegramId: string | null;
  name: string | null;
  phone: string | null;
  xp: number;
  balance: number;
  rank: string;
};

const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const rawBotUrl =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/";
const BOT_URL = rawBotUrl.startsWith("http")
  ? rawBotUrl
  : `https://${rawBotUrl}`;
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(BOT_URL)}`;

export function ClientShell({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);

  const isTelegram =
    mounted &&
    (Boolean(window.Telegram?.WebApp?.initData) ||
      navigator.userAgent.toLowerCase().includes("telegram"));

  useEffect(() => {
    if (!isTelegram) return;

    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();

    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData ?? "" }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { error?: string; user?: Profile };
        if (!res.ok) throw new Error(data.error ?? "Auth failed");
        return data.user as Profile;
      })
      .then(setProfile)
      .catch(() => setError(true));
  }, [isTelegram]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isTelegram) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Gamepad2 className="size-10 text-accent" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Пожалуйста, откройте приложение через нашего Telegram-бота
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Бронирование станций и заказы из бара доступны только внутри
          Telegram.
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={QR_URL}
          alt="QR-код бота"
          className="mt-6 size-48 rounded-2xl border border-white/10 bg-white p-2"
        />

        <a
          href={BOT_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => hapticImpact("light")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
        >
          <Send className="size-4" />
          Открыть бота
        </a>
      </div>
    );
  }

  if (profile) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <main className="mx-auto w-full max-w-lg flex-1 pb-20">{children}</main>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <p className="text-sm text-red-400">
          Не удалось авторизоваться в Telegram.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="size-8 animate-spin text-accent" />
    </div>
  );
}
