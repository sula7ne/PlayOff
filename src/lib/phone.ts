export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("7")) {
    return `+7${digits}`;
  }

  return null;
}

export function isValidKzPhone(phone: string): boolean {
  return /^\+77\d{9}$/.test(phone);
}
