"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ShiftRequiredModal } from "@/components/admin/shift-required-modal";
import { QueryProvider } from "@/components/query-provider";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin-secure-panel/login";

  if (isLogin) {
    return <QueryProvider>{children}</QueryProvider>;
  }

  return (
    <QueryProvider>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AdminTopbar />
            <main className="pb-20 md:pb-8">
              <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
                {children}
              </div>
            </main>
          </SidebarInset>
          <ShiftRequiredModal />
        </SidebarProvider>
      </TooltipProvider>
    </QueryProvider>
  );
}
