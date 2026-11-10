import { InteractiveClubMap } from "@/components/admin/interactive-club-map";

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Карта станций
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Живой статус игровых зон клуба.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <InteractiveClubMap />
      </div>
    </div>
  );
}
