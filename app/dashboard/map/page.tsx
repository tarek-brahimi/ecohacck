"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityMap } from "@/components/activity-map";
import { CalendarDays, MapPin, Navigation, Users, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Activity } from "@/lib/types";
import { apiRequest, parseActivities } from "@/lib/api-client";

export default function MapPage() {
  const { setTheme } = useTheme();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [enrolledActivities, setEnrolledActivities] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  useEffect(() => {
    let isActive = true;

    const loadMap = async () => {
      const [activityData, profileData] = await Promise.all([
        apiRequest<Activity[]>("/api/activities"),
        apiRequest<{ joinedActivities: string[] }>(
          "/api/users/me/profile",
        ).catch(() => ({ joinedActivities: [] })),
      ]);

      if (!isActive) {
        return;
      }

      setActivities(parseActivities(activityData));
      setEnrolledActivities(
        new Set((profileData.joinedActivities || []).map(String)),
      );
    };

    loadMap().catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  const selectedActivityData = selectedActivity
    ? activities.find((activity) => activity.id === selectedActivity) || null
    : null;

  const handleEnroll = async (activityId: string) => {
    setEnrolledActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });

    await apiRequest(`/api/activities/${activityId}/enroll`, {
      method: "POST",
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground">
      <div className="sticky top-0 z-[90] border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <MapPin className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                Activity Map
              </h1>
              <p className="text-sm text-zinc-400 sm:text-base">
                Find activities near you on the interactive map
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 sm:flex">
            <Navigation className="size-4 text-emerald-300" />
            <span>{activities.length} places</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="rounded-lg border-white/10 bg-zinc-950/80 p-3 shadow-2xl shadow-black/40 hover:translate-y-0 hover:border-emerald-400/30 sm:p-4">
              <ActivityMap
                activities={activities}
                selectedActivity={selectedActivity}
                onSelectActivity={setSelectedActivity}
                enrolledActivities={enrolledActivities}
              />
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selectedActivityData ? (
              <Card className="sticky top-28 space-y-5 rounded-lg border-white/10 bg-zinc-950/90 p-5 shadow-2xl shadow-black/40 hover:translate-y-0 hover:border-emerald-400/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {selectedActivityData.title}
                    </h3>
                    <span className="mt-2 inline-block rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium capitalize text-emerald-300">
                      {selectedActivityData.category}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedActivity(null)}
                    className="h-8 w-8 flex-shrink-0 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm leading-relaxed text-zinc-400">
                  {selectedActivityData.description}
                </p>

                <div className="space-y-4 border-t border-white/10 pt-4 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 text-emerald-300" />
                    <span className="text-zinc-200">
                      {selectedActivityData.location}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Difficulty
                      </p>
                      <p className="mt-1 font-medium capitalize text-zinc-100">
                        {selectedActivityData.difficultyLevel}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-zinc-500">
                        <Users className="size-3" />
                        Participants
                      </p>
                      <p className="mt-1 font-medium text-zinc-100">
                        {selectedActivityData.enrollmentCount}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                      <CalendarDays className="size-3" />
                      Date & Time
                    </p>
                    <p className="mt-1 font-medium text-zinc-100">
                      {selectedActivityData.date.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {selectedActivityData.date.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <Button
                  className="mt-2 w-full border-emerald-400/30 bg-emerald-400 text-black hover:text-black [&_.liquid-fill]:bg-emerald-300"
                  variant={
                    enrolledActivities.has(selectedActivityData.id)
                      ? "outline"
                      : "default"
                  }
                  onClick={() => handleEnroll(selectedActivityData.id)}
                >
                  {enrolledActivities.has(selectedActivityData.id)
                    ? "Enrolled"
                    : "+ Enroll Now"}
                </Button>
              </Card>
            ) : (
              <Card className="sticky top-28 space-y-4 rounded-lg border-white/10 bg-zinc-950/90 p-8 text-center shadow-2xl shadow-black/40 hover:translate-y-0 hover:border-emerald-400/30">
                <div className="mx-auto flex size-14 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                  <MapPin className="size-7" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Select an Activity
                </h3>
                <p className="text-sm text-zinc-400">
                  Click on a marker on the map to view activity details and
                  enroll.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
