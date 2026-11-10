import { z } from "zod";

export const stationSchema = z.object({
  status: z.enum(["FREE", "BUSY", "RESERVED"]).optional(),
  durationHours: z.number().int().min(1).max(4).nullable().optional(),
  applyHappyHour: z.boolean().nullable().optional(),
  applyPromo21: z.boolean().nullable().optional(),
});

export const stationCreateSchema = z.object({
  name: z.string().min(1),
  isVip: z.boolean().optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  images: z.array(z.string()).optional(),
  games: z.array(z.string()).optional(),
});

export const stationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["FREE", "MAINTENANCE"]).optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  images: z.array(z.string()).optional(),
  games: z.array(z.string()).optional(),
});

export const bookingSchema = z.object({
  phone: z.string().min(1),
  name: z.string().optional(),
  stationId: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  totalPrice: z.number().int().positive().optional(),
});

export const clientBookingSchema = z.object({
  stationId: z.string().min(1),
  startTime: z.string().min(1),
  hours: z.number().int().min(1).max(4),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

export const barItemSchema = z.object({
  name: z.string().min(1),
  code: z
    .string()
    .trim()
    .regex(/^\d*$/, "Код должен содержать только цифры")
    .max(48, "Максимум 48 цифр")
    .nullable()
    .optional(),
  category: z.string().optional(),
  price: z.number().int().positive(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const barItemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  code: z
    .string()
    .trim()
    .regex(/^\d*$/, "Код должен содержать только цифры")
    .max(48, "Максимум 48 цифр")
    .nullable()
    .optional(),
  category: z.string().optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const orderSchema = z.object({
  stationId: z.string().nullable().optional(),
  paymentMethod: z.enum(["CASH", "KASPI_QR"]).default("CASH"),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const userSchema = z.object({
  xp: z.number().int().nonnegative().optional(),
  balance: z.number().int().optional(),
  rank: z
    .enum([
      "HERALD",
      "GUARDIAN",
      "CRUSADER",
      "ARCHON",
      "LEGEND",
      "ANCIENT",
      "DIVINE",
      "TITAN",
    ])
    .optional(),
});

export const adminSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(4),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export const adminUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
});
