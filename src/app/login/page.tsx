"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const RESEND_SECONDS = 60;

function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) {
    return "";
  }

  let d = digits;

  if (d.startsWith("8")) {
    d = "7" + d.slice(1);
  }

  if (!d.startsWith("7")) {
    d = "7" + d;
  }

  d = d.slice(0, 11);

  let res = "+7";
  if (d.length > 1) res += ` (${d.slice(1, 4)}`;
  if (d.length > 4) res += `) ${d.slice(4, 7)}`;
  if (d.length > 7) res += `-${d.slice(7, 9)}`;
  if (d.length > 9) res += `-${d.slice(9, 11)}`;

  return res;
}

export default function ClientLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const phoneComplete = phone.replace(/\D/g, "").length === 11;

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const id = setInterval(() => setCooldown((c) => c - 1), 1000);

    return () => clearInterval(id);
  }, [cooldown]);

  const sendCode = async () => {
    setError("");
    setSending(true);

    try {
      const res = await fetch("/api/auth/client/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Ошибка отправки");
        return;
      }

      setStep("code");
      setCode("");
      setCooldown(RESEND_SECONDS);
    } catch {
      setError("Ошибка отправки");
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async (value: string) => {
    setError("");
    setVerifying(true);

    try {
      const res = await fetch("/api/auth/client/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: value }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Ошибка верификации");
        setCode("");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Ошибка верификации");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,31,61,0.14),transparent_70%)] text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Gamepad2 className="size-10 text-accent" />
          <h1 className="mt-4 text-2xl font-bold">PlayOff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "phone" ? "Вход по номеру телефона" : "Введите код подтверждения"}
          </p>
        </div>

        {step === "phone" ? (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void sendCode();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7 (7XX) XXX-XX-XX"
                inputMode="tel"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" disabled={sending || !phoneComplete} className="w-full">
              {sending && <Loader2 className="size-4 animate-spin" />}
              Получить код
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Код отправлен на</p>
              <p className="font-semibold">{phone}</p>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setError("");
                  setCode("");
                }}
                className="mt-1 text-sm text-accent hover:underline"
              >
                Изменить номер
              </button>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={code}
                onChange={setCode}
                onComplete={verifyCode}
                disabled={verifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {verifying && (
              <div className="flex justify-center">
                <Loader2 className="size-5 animate-spin text-accent" />
              </div>
            )}

            {error && <p className="text-center text-sm text-red-400">{error}</p>}

            <button
              type="button"
              onClick={() => void sendCode()}
              disabled={cooldown > 0 || sending}
              className="w-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {cooldown > 0 ? `Отправить код повторно (${cooldown}с)` : "Отправить код повторно"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
