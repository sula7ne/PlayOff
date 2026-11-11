export const STANDARD_HOURLY_RATE = 1200;
export const HAPPY_HOUR_RATE = 800;
export const VIP_HOURLY_RATE = 2500;

const KZ_OFFSET_MS = 6 * 60 * 60 * 1000;
const HAPPY_HOUR_END = 18;
const CLOSE_HOUR = 2;

function kz(date: Date): Date {
  return new Date(date.getTime() + KZ_OFFSET_MS);
}

export function getMaxHoursUntilClose(startTime: Date): number {
  const t = kz(startTime);
  const hours = t.getUTCHours();
  const minutes = t.getUTCMinutes();

  const minutesUntilClose =
    hours < CLOSE_HOUR
      ? (CLOSE_HOUR - hours) * 60 - minutes
      : (24 + CLOSE_HOUR - hours) * 60 - minutes;

  return Math.max(1, Math.floor(minutesUntilClose / 60));
}

export function getMaxPaidHours(startTime: Date): number {
  const totalAllowed = getMaxHoursUntilClose(startTime);
  const weekday = isWeekday(startTime);

  let paid = totalAllowed;
  while (paid > 1 && paid + (weekday ? Math.floor(paid / 2) : 0) > totalAllowed) {
    paid--;
  }

  return paid;
}

export function getMaxPaidHoursWithin(
  startTime: Date,
  maxDurationHours: number,
): number {
  const totalAllowed = Math.min(
    getMaxHoursUntilClose(startTime),
    maxDurationHours,
  );
  const weekday = isWeekday(startTime);

  let paid = Math.floor(totalAllowed);
  while (paid > 0 && paid + (weekday ? Math.floor(paid / 2) : 0) > totalAllowed) {
    paid--;
  }

  return paid;
}

export function isWeekday(date: Date): boolean {
  const day = kz(date).getUTCDay();
  return day >= 1 && day <= 5;
}

export function isHappyHour(date: Date): boolean {
  return kz(date).getUTCHours() < HAPPY_HOUR_END;
}

export function getHourlyRate(isVip: boolean, startTime: Date): number {
  if (isVip) return VIP_HOURLY_RATE;
  return isHappyHour(startTime) ? HAPPY_HOUR_RATE : STANDARD_HOURLY_RATE;
}

export function getFreeHours(paidHours: number, startTime: Date): number {
  if (!isWeekday(startTime)) return 0;
  return Math.floor(paidHours / 2);
}

export function computePackagePrice(
  isVip: boolean,
  paidHours: number,
  startTime: Date,
): { rate: number; freeHours: number; totalHours: number; price: number } {
  const rate = getHourlyRate(isVip, startTime);
  const freeHours = getFreeHours(paidHours, startTime);

  return {
    rate,
    freeHours,
    totalHours: paidHours + freeHours,
    price: rate * paidHours,
  };
}

export function computeOpenEndedPrice(
  isVip: boolean,
  startTime: Date,
  elapsedHours: number,
): { rate: number; freeHours: number; totalHours: number; price: number } {
  const rate = getHourlyRate(isVip, startTime);
  const totalHours = Math.max(1, Math.round(elapsedHours));
  const freeHours = isWeekday(startTime)
    ? Math.floor(totalHours / 3)
    : 0;
  const paidHours = totalHours - freeHours;

  return {
    rate,
    freeHours,
    totalHours,
    price: rate * paidHours,
  };
}

export function computePriceWithPromos(
  isVip: boolean,
  paidHours: number,
  applyHappyHour: boolean,
  applyPromo21: boolean,
): { rate: number; freeHours: number; totalHours: number; price: number } {
  const rate = isVip
    ? VIP_HOURLY_RATE
    : applyHappyHour
      ? HAPPY_HOUR_RATE
      : STANDARD_HOURLY_RATE;
  const freeHours = applyPromo21 ? Math.floor(paidHours / 2) : 0;

  return {
    rate,
    freeHours,
    totalHours: paidHours + freeHours,
    price: rate * paidHours,
  };
}

export function computePriceWithOverrides(
  isVip: boolean,
  paidHours: number | null,
  startTime: Date,
  elapsedHours: number,
  applyHappyHour: boolean | null,
  applyPromo21: boolean | null,
): { rate: number; freeHours: number; totalHours: number; price: number } {
  const happy = applyHappyHour ?? isHappyHour(startTime);
  const promo = applyPromo21 ?? isWeekday(startTime);
  const rate = isVip
    ? VIP_HOURLY_RATE
    : happy
      ? HAPPY_HOUR_RATE
      : STANDARD_HOURLY_RATE;

  if (paidHours !== null) {
    const freeHours = promo ? Math.floor(paidHours / 2) : 0;
    return {
      rate,
      freeHours,
      totalHours: paidHours + freeHours,
      price: rate * paidHours,
    };
  }

  const totalHours = Math.max(1, Math.round(elapsedHours));
  const freeHours = promo ? Math.floor(totalHours / 3) : 0;
  const payableHours = totalHours - freeHours;

  return {
    rate,
    freeHours,
    totalHours,
    price: rate * payableHours,
  };
}
