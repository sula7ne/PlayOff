"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Popcorn, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticImpact } from "@/lib/telegram";

const ITEMS = [
  { key: "map", label: "Станции", icon: Gamepad2, href: "/" },
  { key: "bar", label: "Бар", icon: Popcorn, href: "/bar" },
  { key: "profile", label: "Профиль", icon: User, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-lg">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => hapticImpact("selection")}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                active ? "text-accent" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "fill-accent/20")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
