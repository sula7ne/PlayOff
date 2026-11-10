export type StationStatus = "FREE" | "BUSY" | "RESERVED" | "MAINTENANCE";

export type Station = {
  id: string;
  name: string;
  isVip: boolean;
  status: StationStatus;
  busySinceMs: number | null;
  posX: number;
  posY: number;
  images: string[];
  games: string[];
};
