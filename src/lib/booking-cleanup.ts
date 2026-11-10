import { prisma } from "@/lib/prisma";

export async function cancelExpiredPendingBookings(): Promise<void> {
  await prisma.booking.updateMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
    data: { status: "CANCELLED" },
  });
}
