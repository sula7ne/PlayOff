import { AdminShell } from "@/components/admin/admin-shell";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Админ-панель - PlayOff",
};

export default function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-background bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,31,61,0.14),transparent_70%)] text-foreground">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
