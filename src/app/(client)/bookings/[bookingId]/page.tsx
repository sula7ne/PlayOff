import { BookingDetailView } from "@/components/client/booking-detail-view";

export const instant = false;

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingDetailView bookingId={bookingId} />;
}
