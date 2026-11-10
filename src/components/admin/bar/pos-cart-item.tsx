import { Minus, Plus, Trash2 } from "lucide-react";
import { formatTenge } from "@/lib/format";
import type { CartItem } from "@/store/cart-store";

export function PosCartItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="size-8 shrink-0 rounded-md object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">
            {formatTenge(item.price)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onDecrement}
          className="rounded-md border border-white/10 p-1 text-muted-foreground hover:bg-white/10"
        >
          <Minus className="size-3" />
        </button>
        <span className="w-6 text-center text-sm tabular-nums">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="rounded-md border border-white/10 p-1 text-muted-foreground hover:bg-white/10"
        >
          <Plus className="size-3" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1 text-muted-foreground hover:text-red-400"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}
