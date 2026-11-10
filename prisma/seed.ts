import "dotenv/config";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const superadminPasswordHash = await bcrypt.hash(
    "superadmin123",
    10,
  );

  await prisma.adminUser.upsert({
    where: { username: "superadmin" },
    update: { role: "SUPER_ADMIN", password: superadminPasswordHash },
    create: {
      username: "superadmin",
      name: "Super Admin",
      password: superadminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });

  const adminPasswordHash = await bcrypt.hash(
    "admin123",
    10,
  );

  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: { role: "ADMIN", password: adminPasswordHash },
    create: {
      username: "admin",
      name: "Администратор",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const clubCount = await prisma.club.count();

  if (clubCount === 0) {
    await prisma.club.create({
      data: {
        name: "PlayOff",
        address: "Камзина 18",
        phone: "+7 700 000 00 00",
      },
    });
  }

  const stations = [
    { name: "VIP 1", isVip: true, posX: 250, posY: 210 },
    { name: "№3", isVip: false, posX: 390, posY: 120 },
    { name: "№4", isVip: false, posX: 500, posY: 120 },
    { name: "№2", isVip: false, posX: 390, posY: 210 },
    { name: "№1", isVip: false, posX: 500, posY: 210 },
    { name: "№5", isVip: false, posX: 620, posY: 210 },
    { name: "VIP 2", isVip: true, posX: 240, posY: 380 },
    { name: "VIP 3", isVip: true, posX: 390, posY: 380 },
    { name: "VIP 4", isVip: true, posX: 580, posY: 380 },
    { name: "VIP 5", isVip: true, posX: 770, posY: 380 },
  ];

  for (const station of stations) {
    await prisma.station.upsert({
      where: { name: station.name },
      update: {
        isVip: station.isVip,
        posX: station.posX,
        posY: station.posY,
      },
      create: station,
    });
  }

  const seedBarItems = [
    { name: "Панини", category: "Кухня", price: 1800, stock: 15, imageUrl: "https://picsum.photos/seed/panini/400/400" },
    { name: "Донер", category: "Кухня", price: 1500, stock: 20, imageUrl: "https://picsum.photos/seed/doner/400/400" },
    { name: "Сендвич", category: "Кухня", price: 1300, stock: 20, imageUrl: "https://picsum.photos/seed/sendvich/400/400" },
    { name: "Хот-дог", category: "Кухня", price: 1200, stock: 25, imageUrl: "https://picsum.photos/seed/hotdog/400/400" },
    { name: "Lay's", category: "Снэки", price: 600, stock: 40, imageUrl: "https://picsum.photos/seed/lays/400/400" },
    { name: "Орешки", category: "Снэки", price: 500, stock: 35, imageUrl: "https://picsum.photos/seed/oreshki/400/400" },
    { name: "Сухарики", category: "Снэки", price: 350, stock: 50, imageUrl: "https://picsum.photos/seed/suhariki/400/400" },
    { name: "Red Bull", category: "Бар", price: 900, stock: 24, imageUrl: "https://picsum.photos/seed/redbull/400/400" },
    { name: "Cola 0.5", category: "Бар", price: 450, stock: 30, imageUrl: "https://picsum.photos/seed/cola/400/400" },
    { name: "Вода 0.5", category: "Бар", price: 250, stock: 60, imageUrl: "https://picsum.photos/seed/voda/400/400" },
  ];

  for (const item of seedBarItems) {
    const existing = await prisma.barItem.findFirst({
      where: { name: item.name },
    });

    if (existing) {
      await prisma.barItem.update({
        where: { id: existing.id },
        data: { imageUrl: item.imageUrl },
      });
    } else {
      await prisma.barItem.create({ data: item });
    }
  }

  const zeroPriceItems = await prisma.orderItem.findMany({
    where: { price: 0 },
    include: { barItem: true },
  });

  for (const oi of zeroPriceItems) {
    await prisma.orderItem.update({
      where: { id: oi.id },
      data: { price: oi.barItem.price },
    });
  }

  const orderCount = await prisma.order.count();

  if (orderCount === 0) {
    const barItems = await prisma.barItem.findMany();
    const byName = new Map(barItems.map((i) => [i.name, i]));

    const demoOrders = [
      {
        number: 1001,
        stationName: "№1",
        paymentMethod: "KASPI_QR" as const,
        items: [
          { name: "Панини", quantity: 1 },
          { name: "Cola 0.5", quantity: 2 },
        ],
      },
      {
        number: 1002,
        stationName: null,
        paymentMethod: "CASH" as const,
        items: [
          { name: "Lay's", quantity: 1 },
          { name: "Red Bull", quantity: 1 },
        ],
      },
      {
        number: 1003,
        stationName: "VIP 2",
        paymentMethod: "KASPI_QR" as const,
        items: [{ name: "Донер", quantity: 2 }],
      },
    ];

    for (const demo of demoOrders) {
      const station = demo.stationName
        ? await prisma.station.findFirst({
            where: { name: demo.stationName },
          })
        : null;

      let totalAmount = 0;
      const orderItems: {
        barItemId: string;
        quantity: number;
        price: number;
      }[] = [];

      for (const di of demo.items) {
        const barItem = byName.get(di.name);
        if (!barItem) continue;
        totalAmount += barItem.price * di.quantity;
        orderItems.push({
          barItemId: barItem.id,
          quantity: di.quantity,
          price: barItem.price,
        });
      }

      const order = await prisma.order.create({
        data: {
          number: demo.number,
          stationId: station?.id ?? null,
          totalAmount,
          paymentMethod: demo.paymentMethod,
          items: { create: orderItems },
        },
      });

      await prisma.financeTransaction.create({
        data: {
          amount: totalAmount,
          type: "INCOME",
          paymentMethod: demo.paymentMethod,
          category: `Бар · заказ №${order.number}`,
          orderId: order.id,
        },
      });
    }
  }

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
