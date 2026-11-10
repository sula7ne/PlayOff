import { getCartTotal, useCartStore } from "@/store/cart-store";
import { useCreateOrder } from "@/hooks/use-bar";
import { openShiftRequired } from "@/store/shift-modal-store";

export function usePosCartLogic() {
  const items = useCartStore((s) => s.items);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const clearCart = useCartStore((s) => s.clearCart);
  const createOrder = useCreateOrder();

  const total = getCartTotal(items);

  const checkout = () => {
    if (items.length === 0) {
      return;
    }

    createOrder.mutate(
      {
        paymentMethod,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      },
      {
        onSuccess: () => clearCart(),
        onError: (error) => {
          if ((error as { code?: string }).code === "SHIFT_REQUIRED") {
            openShiftRequired(() => checkout());
          }
        },
      },
    );
  };

  return {
    items,
    paymentMethod,
    total,
    increment,
    decrement,
    removeItem,
    setPaymentMethod,
    clearCart,
    checkout,
    isPending: createOrder.isPending,
    isError: createOrder.isError,
  };
}
