"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShiftWidget } from "@/components/admin/shift-widget";
import { useSession } from "@/hooks/use-session";

export function AdminTopbar() {
  const { data: sessionData } = useSession();

  const role = sessionData?.session?.role;
  const canManageShift = role === "ADMIN" || role === "SUPER_ADMIN";

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
      <SidebarTrigger />
      <div className="flex items-center">{canManageShift && <ShiftWidget />}</div>
    </header>
  );
}
