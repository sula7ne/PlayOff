"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrentShift } from "@/hooks/use-shift";

export function LogoutButton() {
  const router = useRouter();
  const { data } = useCurrentShift();

  const [warningOpen, setWarningOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const shiftOpen = Boolean(data?.shift);

  const doLogout = async () => {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin-secure-panel/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (shiftOpen) {
      setWarningOpen(true);
    } else {
      void doLogout();
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Выйти"
          onClick={handleClick}
          className="text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut />
          <span>Выйти</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Открытая смена</DialogTitle>
            <DialogDescription>
              У вас есть открытая смена. Вы уверены, что хотите выйти без
              закрытия смены?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => {
                setWarningOpen(false);
                void doLogout();
              }}
            >
              Выйти без закрытия
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
