export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "success"
  | "warning"
  | "error";

export function triggerHaptic(type: HapticType): void {
  try {
    const tg = window.Telegram?.WebApp;
    if (!tg?.HapticFeedback) return;

    if (tg.isVersionAtLeast && !tg.isVersionAtLeast("6.1")) {
      return;
    }

    if (type === "success" || type === "warning" || type === "error") {
      if (typeof tg.HapticFeedback.notificationOccurred === "function") {
        tg.HapticFeedback.notificationOccurred(type);
      }
    } else if (type === "selection") {
      if (typeof tg.HapticFeedback.selectionChanged === "function") {
        tg.HapticFeedback.selectionChanged();
      }
    } else if (typeof tg.HapticFeedback.impactOccurred === "function") {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch {
    // Haptic feedback is optional — ignore failures silently.
  }
}

export function hapticImpact(
  style: "light" | "medium" | "heavy" | "selection" = "light",
): void {
  triggerHaptic(style);
}

export function hapticSuccess(): void {
  triggerHaptic("success");
}

export function hapticError(): void {
  triggerHaptic("error");
}
