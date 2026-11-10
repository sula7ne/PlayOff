export const PENDING_TTL_MS = 15 * 60 * 1000;

export function buildKaspiDeeplink(orderId: string, amount: number): string {
  const merchantId = process.env.KASPI_MERCHANT_ID ?? "";

  const params = new URLSearchParams({
    merchantId,
    orderId,
    amount: String(amount),
  });

  return `kaspi://pay?${params.toString()}`;
}
