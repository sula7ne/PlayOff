"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        setError("Неверный логин или пароль");
        return;
      }

      router.push("/admin-secure-panel");
      router.refresh();
    } catch {
      setError("Ошибка входа. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Gamepad2 className="size-10 text-accent" />
          <h1 className="mt-4 text-2xl font-bold">PlayOff Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Вход в админ-панель
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login">Логин</Label>
            <Input
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-6 w-full">
          {loading ? "Вход…" : "Войти"}
        </Button>
      </form>
    </div>
  );
}
