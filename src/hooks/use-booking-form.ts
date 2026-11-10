import { useState } from "react";
import { useStations } from "@/hooks/use-stations";
import { useCreateBooking } from "@/hooks/use-bookings";
import { openShiftRequired } from "@/store/shift-modal-store";
import { STANDARD_HOURLY_RATE } from "@/lib/pricing";

export const DURATIONS = [
  { value: "1", label: "1 час", hours: 1 },
  { value: "2", label: "2 часа", hours: 2 },
  { value: "3", label: "3 часа", hours: 3 },
] as const;

export function useBookingForm(onClose: () => void) {
  const { data: stations = [] } = useStations();
  const createBooking = useCreateBooking();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [stationId, setStationId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1");

  const hours = DURATIONS.find((d) => d.value === duration)?.hours ?? 1;
  const totalPrice = hours * STANDARD_HOURLY_RATE;

  const reset = () => {
    setName("");
    setPhone("");
    setStationId("");
    setStartTime("");
    setDuration("1");
  };

  const submit = () => {
    if (!name.trim() || !phone.trim() || !stationId || !startTime) {
      return;
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + hours * 3600 * 1000);

    createBooking.mutate(
      {
        phone: phone.trim(),
        name: name.trim(),
        stationId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        totalPrice,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (error) => {
          if ((error as { code?: string }).code === "SHIFT_REQUIRED") {
            openShiftRequired(() => submit());
          }
        },
      },
    );
  };

  return {
    stations,
    name,
    setName,
    phone,
    setPhone,
    stationId,
    setStationId,
    startTime,
    setStartTime,
    duration,
    setDuration,
    totalPrice,
    submit,
    isPending: createBooking.isPending,
    isError: createBooking.isError,
  };
}
