import { PaymentView } from "@/components/client/payment-view";

export const instant = false;

export default async function PayBookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <PaymentView bookingId={bookingId} />;
}
