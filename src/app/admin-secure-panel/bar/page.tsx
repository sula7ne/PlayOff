"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BarItemCard } from "@/components/admin/bar-item-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PosCart } from "@/components/admin/pos-cart";
import { CreateBarItemModal } from "@/components/admin/create-bar-item-modal";
import { EditBarItemModal } from "@/components/admin/edit-bar-item-modal";
import { BarCategoryFilter } from "@/components/admin/bar/bar-category-filter";
import { OrderHistory } from "@/components/admin/bar/order-history";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartStore } from "@/store/cart-store";
import { useBarItems, useDeleteBarItem, type BarItem } from "@/hooks/use-bar";
import { useSession } from "@/hooks/use-session";

export default function BarPage() {
  const addItem = useCartStore((s) => s.addItem);
  const { data: barItems = [], isLoading, isError } = useBarItems();
  const { data: sessionData } = useSession();
  const deleteItem = useDeleteBarItem();

  const isSuperAdmin = sessionData?.session?.role === "SUPER_ADMIN";

  const [category, setCategory] = useState<string>("Все");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BarItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<BarItem | null>(null);

  const visibleItems =
    category === "Все"
      ? barItems
      : barItems.filter((i) => i.category === category);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Бар и заказы</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ассортимент, остатки на складе и быстрый POS-заказ.
          </p>
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setItemDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
          >
            <Plus className="size-4" />
            Добавить товар
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <BarCategoryFilter value={category} onChange={setCategory} />

          {isLoading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
          )}
          {isError && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Не удалось загрузить ассортимент.
            </div>
          )}
          {!isLoading && !isError && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {visibleItems.map((item) => (
                <BarItemCard
                  key={item.id}
                  item={item}
                  canManage={isSuperAdmin}
                  onAdd={() =>
                    addItem({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl,
                    })
                  }
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => setDeletingItem(item)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <PosCart />
        </aside>
      </div>

      <OrderHistory />

      <CreateBarItemModal open={itemDialogOpen} onOpenChange={setItemDialogOpen} />

      <EditBarItemModal
        item={editingItem}
        open={editingItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
          }
        }}
      />

      <Dialog
        open={deletingItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить товар</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить «{deletingItem?.name}»?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={deleteItem.isPending}
              onClick={() => {
                if (deletingItem) {
                  deleteItem.mutate(deletingItem.id, {
                    onSuccess: () => setDeletingItem(null),
                  });
                }
              }}
            >
              {deleteItem.isPending ? "Удаление…" : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
