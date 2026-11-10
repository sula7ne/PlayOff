"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BAR_CATEGORIES } from "@/lib/constants";
import { useUpdateBarItem, type BarItem } from "@/hooks/use-bar";
import { ImageUploader } from "@/components/admin/image-uploader";

function EditForm({
  item,
  onClose,
}: {
  item: BarItem;
  onClose: () => void;
}) {
  const updateItem = useUpdateBarItem();

  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<string>(
    item.category ?? BAR_CATEGORIES[0],
  );
  const [price, setPrice] = useState(() => String(item.price));
  const [stock, setStock] = useState(() => String(item.stock));
  const [imageUrl, setImageUrl] = useState<string | null>(item.imageUrl);

  const handleSubmit = () => {
    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (!name.trim() || Number.isNaN(priceNum) || Number.isNaN(stockNum)) {
      return;
    }

    updateItem.mutate(
      {
        id: item.id,
        name: name.trim(),
        category,
        price: priceNum,
        stock: stockNum,
        imageUrl,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Изменить товар</DialogTitle>
        <DialogDescription>Параметры товара и фотография.</DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <ImageUploader value={imageUrl} onChange={setImageUrl} />

        <div className="space-y-1.5">
          <Label htmlFor="edit-name">Название</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Категория</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(String(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BAR_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-price">Цена (₸)</Label>
            <Input
              id="edit-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-stock">Остаток</Label>
            <Input
              id="edit-stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>
      </div>

      {updateItem.isError && (
        <p className="text-sm text-red-400">Не удалось сохранить товар.</p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} disabled={updateItem.isPending}>
          {updateItem.isPending ? "Сохранение…" : "Сохранить"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditBarItemModal({
  item,
  open,
  onOpenChange,
}: {
  item: BarItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {item && (
          <EditForm
            key={item.id}
            item={item}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
