import { useState } from "react";
import { useUpdateStationStatus } from "@/hooks/use-stations";
import { openShiftRequired } from "@/store/shift-modal-store";
import {
  computePriceWithPromos,
  getMaxPaidHours,
  isHappyHour,
  isWeekday,
} from "@/lib/pricing";
import type { StationStatus } from "@/types/station";

export function useSessionModal(
  stationId: string | null,
  isVip: boolean,
  onClose: () => void,
) {
  const [paidHours, setPaidHours] = useState(1);
  const [isOpenEnded, setIsOpenEnded] = useState(false);
  const [applyHappyHour, setApplyHappyHour] = useState<boolean>(
    () => typeof window !== "undefined" && !isVip && isHappyHour(new Date()),
  );
  const [applyPromo21, setApplyPromo21] = useState<boolean>(
    () => typeof window !== "undefined" && isWeekday(new Date()),
  );
  const updateStationStatus = useUpdateStationStatus();

  const maxHours =
    typeof window !== "undefined" ? getMaxPaidHours(new Date()) : 24;

  const setPaidHoursClamped = (value: number) => {
    setPaidHours(Math.min(Math.max(0, value), maxHours));
  };

  const { rate, freeHours, totalHours, price } = computePriceWithPromos(
    isVip,
    paidHours,
    applyHappyHour && !isVip,
    applyPromo21,
  );

  const changeStatus = (status: StationStatus) => {
    if (!stationId) {
      return;
    }

    updateStationStatus.mutate(
      {
        id: stationId,
        status,
        durationHours:
          status === "BUSY" ? (isOpenEnded ? null : paidHours) : undefined,
        applyHappyHour: status === "BUSY" ? applyHappyHour : undefined,
        applyPromo21: status === "BUSY" ? applyPromo21 : undefined,
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          if ((error as { code?: string }).code === "SHIFT_REQUIRED") {
            openShiftRequired(() => changeStatus(status));
          }
        },
      },
    );
  };

  return {
    isVip,
    paidHours,
    setPaidHours: setPaidHoursClamped,
    maxHours,
    isOpenEnded,
    setIsOpenEnded,
    applyHappyHour,
    setApplyHappyHour,
    applyPromo21,
    setApplyPromo21,
    rate,
    freeHours,
    totalHours,
    price,
    changeStatus,
  };
}
