import {
  CalendarCheck,
  CupSoda,
  Gamepad2,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: ("ADMIN" | "SUPER_ADMIN")[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin-secure-panel",
    label: "Карта станций",
    icon: Gamepad2,
    exact: true,
  },
  {
    href: "/admin-secure-panel/bookings",
    label: "Бронирования",
    icon: CalendarCheck,
  },
  {
    href: "/admin-secure-panel/bar",
    label: "Бар и заказы",
    icon: CupSoda,
  },
  {
    href: "/admin-secure-panel/finance",
    label: "Финансы",
    icon: Wallet,
    roles: ["SUPER_ADMIN"],
  },
  { href: "/admin-secure-panel/users", label: "Клиенты", icon: Users },
  {
    href: "/admin-secure-panel/admins",
    label: "Админы",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
  },
];
