import { cn } from "@/lib/utils";
import type { CartPaymentMethod } from "@/store/cart-store";

const PAYMENTS: { value: CartPaymentMethod; label: string }[] = [
  { value: "CASH", label: "Наличные" },
  { value: "KASPI_QR", label: "Kaspi QR" },
];

export function PosPaymentSelector({
  value,
  onChange,
}: {
  value: CartPaymentMethod;
  onChange: (value: CartPaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 p-1">
      {PAYMENTS.map((payment) => (
        <button
          key={payment.value}
          type="button"
          onClick={() => onChange(payment.value)}
          className={cn(
            "rounded-lg px-1 py-1.5 text-xs font-medium transition-colors",
            value === payment.value
              ? "bg-accent text-white"
              : "text-muted-foreground hover:bg-white/10",
          )}
        >
          {payment.label}
        </button>
      ))}
    </div>
  );
}
