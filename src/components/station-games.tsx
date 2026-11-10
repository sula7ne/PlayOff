import { Badge } from "@/components/ui/badge";

export function StationGames({ games }: { games: string[] }) {
  if (games.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {games.map((game) => (
        <Badge key={game}>{game}</Badge>
      ))}
    </div>
  );
}
