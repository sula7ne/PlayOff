import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const transaction = await prisma.financeTransaction.findUnique({
    where: { id },
    include: {
      admin: { select: { name: true } },
      gamingSession: {
        include: {
          station: { select: { name: true, isVip: true } },
        },
      },
      order: {
        include: {
          station: { select: { name: true } },
          items: {
            include: {
              barItem: { select: { name: true, price: true } },
            },
          },
        },
      },
      booking: {
        include: {
          station: { select: { name: true, isVip: true } },
          user: { select: { name: true, phone: true } },
        },
      },
    },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Транзакция не найдена" },
      { status: 404 },
    );
  }

  const { admin: adminRelation, ...rest } = transaction;

  return NextResponse.json({
    transaction: {
      ...rest,
      adminName: adminRelation?.name ?? null,
    },
  });
}
