"use client";

import dynamic from "next/dynamic";
import { Activity } from "@/lib/types";

interface ActivityMapProps {
  activities: Activity[];
  selectedActivity: string | null;
  onSelectActivity: (id: string) => void;
  enrolledActivities: Set<string>;
}

const ActivityMapLeaflet = dynamic(
  () =>
    import("@/components/activity-map-leaflet").then(
      (module) => module.ActivityMapLeaflet,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] rounded-xl border border-border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  },
);

export function ActivityMap(props: ActivityMapProps) {
  return <ActivityMapLeaflet {...props} />;
}
