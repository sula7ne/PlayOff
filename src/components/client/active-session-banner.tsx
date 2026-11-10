"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { ClientBooking } from "@/hooks/use-client";

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) {
    return `${h}ч ${m.toString().padStart(2, "0")}м`;
  }

  return `${m}м ${s.toString().padStart(2, "0")}с`;
}

export function ActiveSessionBanner({ booking }: { booking: ClientBooking }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = new Date(booking.endTime).getTime() - now;

  return (
    <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 p-3">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-accent" />
        <span className="text-sm font-semibold">
          {booking.station?.name ?? "—"}
        </span>
      </div>
      <span className="font-mono text-sm font-semibold tabular-nums text-accent">
        {formatRemaining(remaining)}
      </span>
    </div>
  );
}
