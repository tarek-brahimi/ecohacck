import { Activity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Users, Calendar, Zap } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onEnroll?: (activityId: string) => void;
  isEnrolled?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const CATEGORY_ICONS: Record<string, string> = {
  sports: '⚽',
  arts: '🎨',
  tech: '💻',
  social: '👥',
  outdoor: '🏕️',
  music: '🎵',
  other: '✨',
};

export function ActivityCard({ activity, onEnroll, isEnrolled }: ActivityCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
        <div className="text-6xl opacity-50">{CATEGORY_ICONS[activity.category] || '✨'}</div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{activity.title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${DIFFICULTY_COLORS[activity.difficultyLevel]}`}>
            {activity.difficultyLevel.charAt(0).toUpperCase() + activity.difficultyLevel.slice(1)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{activity.description}</p>

        {/* Meta Info */}
        <div className="space-y-2 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{activity.date.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{activity.enrollmentCount} enrolled</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          size="sm"
          className="w-full mt-auto"
          variant={isEnrolled ? 'outline' : 'default'}
          onClick={() => onEnroll?.(activity.id)}
        >
          {isEnrolled ? 'Enrolled' : 'Enroll Now'}
        </Button>
      </div>
    </Card>
  );
}
