import { Card } from '@/components/ui/card';
import { MapPin, Sparkles } from 'lucide-react';
import type { NearbyActivity } from '@/lib/recommender-backend';

interface RecommendationCardProps {
  activity: NearbyActivity;
}

// Display-only card: the backend recommendation payload has no description /
// image / stable cross-app id, so this surfaces only what /activities/nearby
// returns (title, category, distance, relevance).
export function RecommendationCard({ activity }: RecommendationCardProps) {
  const relevance =
    !activity.cold_start && typeof activity.similarity === 'number'
      ? `${Math.round(activity.similarity * 100)}% match`
      : 'Nearby pick';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{activity.title}</h3>
        <span className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap bg-primary/10 text-primary flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {relevance}
        </span>
      </div>

      {activity.category ? (
        <p className="text-xs text-muted-foreground mb-3 capitalize">{activity.category}</p>
      ) : null}

      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>{activity.distance_km.toFixed(1)} km away</span>
      </div>
    </Card>
  );
}
