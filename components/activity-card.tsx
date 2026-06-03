import { Activity } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Calendar,
  Dumbbell,
  Laptop,
  MapPin,
  Music,
  Palette,
  Sparkles,
  Trees,
  Users,
  type LucideIcon,
} from 'lucide-react'

interface ActivityCardProps {
  activity: Activity
  onEnroll?: (activityId: string) => void
  isEnrolled?: boolean
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  medium: 'border-orange-400/20 bg-orange-500/10 text-orange-300',
  hard: 'border-rose-400/20 bg-rose-500/10 text-rose-300',
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  sports: Dumbbell,
  arts: Palette,
  tech: Laptop,
  social: Users,
  outdoor: Trees,
  music: Music,
  other: Sparkles,
}

export function ActivityCard({
  activity,
  onEnroll,
  isEnrolled,
}: ActivityCardProps) {
  const CategoryIcon = CATEGORY_ICONS[activity.category] || Sparkles

  return (
    <Card className="flex h-full overflow-hidden border-white/10 bg-zinc-950/80 py-0 shadow-black/20 transition-colors duration-300 hover:border-emerald-400/25 hover:shadow-lg">
      <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.18),rgba(24,24,27,0.35)_42%,rgba(9,9,11,1)_78%)]">
        <div className="flex size-20 items-center justify-center rounded-lg border border-emerald-400/20 bg-black/30 text-emerald-300 shadow-2xl shadow-emerald-950/30">
          <CategoryIcon className="size-10" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 font-semibold text-zinc-100">
            {activity.title}
          </h3>
          <span
            className={`whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${
              DIFFICULTY_COLORS[activity.difficultyLevel] ||
              DIFFICULTY_COLORS.medium
            }`}
          >
            {activity.difficultyLevel.charAt(0).toUpperCase() +
              activity.difficultyLevel.slice(1)}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 flex-1 text-sm text-zinc-400">
          {activity.description}
        </p>

        <div className="mb-4 space-y-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-300" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-300" />
            <span>{activity.date.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-300" />
            <span>{activity.enrollmentCount} enrolled</span>
          </div>
        </div>

        <Button
          size="sm"
          className="mt-auto w-full"
          variant={isEnrolled ? 'outline' : 'default'}
          onClick={() => onEnroll?.(activity.id)}
        >
          {isEnrolled ? 'Enrolled' : 'Enroll Now'}
        </Button>
      </div>
    </Card>
  )
}
