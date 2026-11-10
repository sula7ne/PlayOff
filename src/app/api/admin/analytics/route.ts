import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";

const KZ_OFFSET = 6 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function generateHourKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const kzStart = new Date(start.getTime() + KZ_OFFSET);
  const kzEnd = new Date(end.getTime() + KZ_OFFSET);

  const cursor = new Date(
    Date.UTC(
      kzStart.getUTCFullYear(),
      kzStart.getUTCMonth(),
      kzStart.getUTCDate(),
      kzStart.getUTCHours(),
    ),
  );
  const endHour = new Date(
    Date.UTC(
      kzEnd.getUTCFullYear(),
      kzEnd.getUTCMonth(),
      kzEnd.getUTCDate(),
      kzEnd.getUTCHours(),
    ),
  );

  while (cursor.getTime() <= endHour.getTime()) {
    keys.push(cursor.toISOString().slice(0, 13));
    cursor.setUTCHours(cursor.getUTCHours() + 1);
  }

  return keys;
}

export async function GET(request: Request) {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  const end = toDate ?? new Date();
  const isSingleDay =
    fromDate !== null && end.getTime() - fromDate.getTime() <= DAY_MS;
  const granularity: "hour" | "day" = isSingleDay ? "hour" : "day";

  const dateFilter =
    fromDate || toDate
      ? {
          createdAt: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          },
        }
      : undefined;

  const transactions = await prisma.financeTransaction.findMany({
    where: { type: "INCOME", ...dateFilter },
    orderBy: { createdAt: "asc" },
  });

  const buckets = new Map<string, { console: number; bar: number }>();

  for (const t of transactions) {
    const kz = new Date(t.createdAt.getTime() + KZ_OFFSET);
    const key =
      granularity === "hour"
        ? kz.toISOString().slice(0, 13)
        : kz.toISOString().slice(0, 10);

    const entry = buckets.get(key) ?? { console: 0, bar: 0 };

    if ((t.category ?? "").startsWith("Бар")) {
      entry.bar += t.amount;
    } else {
      entry.console += t.amount;
    }

    buckets.set(key, entry);
  }

  const data =
    granularity === "hour" && fromDate
      ? generateHourKeys(fromDate, end).map((key) => ({
          key,
          ...(buckets.get(key) ?? { console: 0, bar: 0 }),
        }))
      : Array.from(buckets.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => ({ key, ...value }));

  return NextResponse.json({ data, granularity });
}
