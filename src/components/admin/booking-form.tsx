"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DURATIONS, useBookingForm } from "@/hooks/use-booking-form";

export function BookingForm({
  form,
}: {
  form: ReturnType<typeof useBookingForm>;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="bk-name">Имя клиента</Label>
        <Input id="bk-name" value={form.name} onChange={(e) => form.setName(e.target.value)} placeholder="Имя" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bk-phone">Телефон</Label>
        <Input id="bk-phone" value={form.phone} onChange={(e) => form.setPhone(e.target.value)} placeholder="+7 700 000 00 00" />
      </div>
      <div className="space-y-1.5">
        <Label>Станция</Label>
        <Select value={form.stationId} onValueChange={(value) => form.setStationId(String(value ?? ""))}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value) => {
                const s = form.stations.find((x) => x.id === value);
                return s ? s.name : "Выберите станцию";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {form.stations.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="bk-start">Начало</Label>
          <Input id="bk-start" type="datetime-local" value={form.startTime} onChange={(e) => form.setStartTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Длительность</Label>
          <Select value={form.duration} onValueChange={(value) => form.setDuration(String(value ?? "1"))}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
        <span className="text-muted-foreground">К оплате (Kaspi QR)</span>
        <span className="font-semibold">{form.totalPrice} ₸</span>
      </div>
      {form.isError && <p className="text-sm text-red-400">Не удалось создать бронирование.</p>}
    </div>
  );
}
