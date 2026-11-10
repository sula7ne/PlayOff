"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NAV_ITEMS, type NavItem } from "@/components/admin/nav-items";
import { LogoutButton } from "@/components/admin/logout-button";
import { useSession } from "@/hooks/use-session";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: sessionData } = useSession();

  const role = sessionData?.session?.role;
  const adminRole = role === "ADMIN" || role === "SUPER_ADMIN" ? role : null;

  const items = NAV_ITEMS.filter(
    (item) =>
      !item.roles || (adminRole ? item.roles.includes(adminRole) : false),
  );

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-zinc-800 bg-zinc-950 text-zinc-100"
    >
      <SidebarHeader className="flex h-16 flex-row items-center gap-2 border-b border-zinc-800 px-4">
        <Gamepad2 className="size-6 shrink-0 text-accent" />
        <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
          PlayOff
        </span>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.label}
                  render={<Link href={item.href} />}
                  className={cn(
                    "hover:text-zinc-100",
                    active
                      ? "data-active:bg-accent/15 data-active:text-accent data-active:hover:bg-accent/20 data-active:hover:text-accent"
                      : "hover:bg-zinc-800/50",
                  )}
                >
                  <Icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800">
        <SidebarMenu>
          <LogoutButton />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
