"use client";

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
import { useBarItemForm } from "@/hooks/use-bar-item-form";
import { ImageUploader } from "@/components/admin/image-uploader";

export function CreateBarItemModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useBarItemForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить товар</DialogTitle>
          <DialogDescription>Новый товар в ассортименте бара.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ImageUploader value={form.imageUrl} onChange={form.setImageUrl} />
          <div className="space-y-1.5">
            <Label htmlFor="bi-name">Название</Label>
            <Input id="bi-name" value={form.name} onChange={(e) => form.setName(e.target.value)} placeholder="Red Bull" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bi-code">Код (штрих-код)</Label>
            <Input id="bi-code" value={form.code} inputMode="numeric" maxLength={48} onChange={(e) => form.setCode(e.target.value.replace(/\D/g, ""))} placeholder="4601234567890" />
          </div>
          <div className="space-y-1.5">
            <Label>Категория</Label>
            <Select value={form.category} onValueChange={(value) => form.setCategory(String(value ?? BAR_CATEGORIES[0]))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BAR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bi-price">Цена (₸)</Label>
              <Input id="bi-price" type="number" value={form.price} onChange={(e) => form.setPrice(e.target.value)} placeholder="900" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bi-stock">Остаток</Label>
              <Input id="bi-stock" type="number" value={form.stock} onChange={(e) => form.setStock(e.target.value)} placeholder="24" />
            </div>
          </div>
          {form.isError && <p className="text-sm text-red-400">Не удалось добавить товар.</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={form.submit} disabled={form.isPending}>
            {form.isPending ? "Добавление…" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
