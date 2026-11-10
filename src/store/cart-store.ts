import { create } from "zustand";

export type CartPaymentMethod = "CASH" | "KASPI_QR";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  paymentMethod: CartPaymentMethod;
  linkedStationId: string | null;

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  setPaymentMethod: (method: CartPaymentMethod) => void;
  setLinkedStation: (stationId: string | null) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  paymentMethod: "CASH",
  linkedStationId: null,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }

      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  increment: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    })),

  decrement: (id) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    })),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setLinkedStation: (stationId) => set({ linkedStationId: stationId }),

  clearCart: () => set({ items: [], linkedStationId: null }),
}));

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
