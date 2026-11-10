const KZ_TIME_ZONE = "Asia/Almaty";

export function formatTenge(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ₸`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: KZ_TIME_ZONE,
  });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const dateKey = date.toLocaleDateString("ru-RU", { timeZone: KZ_TIME_ZONE });
  const nowKey = now.toLocaleDateString("ru-RU", { timeZone: KZ_TIME_ZONE });

  if (dateKey === nowKey) {
    return "Сегодня";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    timeZone: KZ_TIME_ZONE,
  });
}
