"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ActivityCard } from "@/components/activity-card";
import { ActivityMap } from "@/components/activity-map";
import { RecommendationCard } from "@/components/recommendation-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity } from "@/lib/types";
import type { NearbyActivity } from "@/lib/recommender-backend";
import { apiRequest, parseActivities } from "@/lib/api-client";
import { Search, Filter, X, Sparkles } from "lucide-react";

// Fallback location (Algiers city center) when the browser can't/won't share
// the user's position. Matches the backend seed data region.
const FALLBACK_LOCATION = { lat: 36.76, lng: 3.05 };

export default function FeedPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewingId, setIsReviewingId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [enrolledActivities, setEnrolledActivities] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [recommendations, setRecommendations] = useState<NearbyActivity[]>([]);
  const [recsLoading, setRecsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadFeed = async () => {
      try {
        const pendingRequest: Promise<Activity[]> =
          user?.role === "house-owner"
            ? apiRequest<Activity[]>("/api/activities?status=pending")
            : Promise.resolve([]);

        const [activityData, profileData, pendingData] = await Promise.all([
          apiRequest<Activity[]>("/api/activities"),
          apiRequest<{ joinedActivities: string[] }>("/api/users/me/profile").catch(
            () => ({ joinedActivities: [] }),
          ),
          pendingRequest.catch(() => []),
        ]);

        if (!isActive) {
          return;
        }

        setActivities(parseActivities(activityData));
        setPendingActivities(parseActivities(pendingData));
        setEnrolledActivities(
          new Set((profileData.joinedActivities || []).map(String)),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadFeed().catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [user?.role]);

  useEffect(() => {
    let isActive = true;

    const loadRecommendations = async (lat: number, lng: number) => {
      try {
        const { recommendations: recs } = await apiRequest<{
          recommendations: NearbyActivity[];
        }>(`/api/recommendations?lat=${lat}&lng=${lng}`);
        if (isActive) {
          setRecommendations(recs || []);
        }
      } catch {
        if (isActive) {
          setRecommendations([]);
        }
      } finally {
        if (isActive) {
          setRecsLoading(false);
        }
      }
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          loadRecommendations(position.coords.latitude, position.coords.longitude),
        () => loadRecommendations(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng),
        { timeout: 8000 },
      );
    } else {
      loadRecommendations(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng);
    }

    return () => {
      isActive = false;
    };
  }, []);

  const categories = [
    "sports",
    "arts",
    "tech",
    "social",
    "outdoor",
    "music",
    "other",
  ];
  const difficulties = ["easy", "medium", "hard"];

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || activity.category === selectedCategory;
      const matchesDifficulty =
        !selectedDifficulty || activity.difficultyLevel === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [activities, searchQuery, selectedCategory, selectedDifficulty]);

  const selectedActivityData = useMemo(
    () =>
      selectedActivity
        ? activities.find((activity) => activity.id === selectedActivity) || null
        : null,
    [activities, selectedActivity],
  );

  const handleEnroll = async (activityId: string) => {
    const currentlyEnrolled = enrolledActivities.has(activityId);

    setEnrolledActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });

    try {
      await apiRequest(`/api/activities/${activityId}/enroll`, {
        method: "POST",
      });
    } catch {
      setEnrolledActivities((prev) => {
        const newSet = new Set(prev);
        if (currentlyEnrolled) {
          newSet.add(activityId);
        } else {
          newSet.delete(activityId);
        }
        return newSet;
      });
    }
  };

  const handlePendingDecision = async (
    activityId: string,
    status: "public" | "rejected",
  ) => {
    setReviewError("");
    setIsReviewingId(activityId);
    try {
      await apiRequest(`/api/activities/${activityId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      const [publicActivities, pendingActivitiesData] = await Promise.all([
        apiRequest<Activity[]>("/api/activities"),
        apiRequest<Activity[]>("/api/activities?status=pending"),
      ]);

      setActivities(parseActivities(publicActivities));
      setPendingActivities(parseActivities(pendingActivitiesData));
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Unable to update activity status.",
      );
    } finally {
      setIsReviewingId(null);
    }
  };

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedDifficulty;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Activity Feed
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover approved activities and browse them on the map
            </p>
          </div>

          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-0 bg-transparent text-foreground placeholder-muted-foreground focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {user?.role === "house-owner" ? (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Pending activities for your house
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Approve an activity to publish it in the public feed and map.
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {pendingActivities.length} pending
              </span>
            </div>

            {reviewError ? (
              <p className="text-sm text-destructive">{reviewError}</p>
            ) : null}

            {pendingActivities.length ? (
              <div className="space-y-3">
                {pendingActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-lg border border-border p-4 bg-background"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.location} •{" "}
                          {activity.date.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isReviewingId === activity.id}
                          onClick={() =>
                            handlePendingDecision(activity.id, "rejected")
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          disabled={isReviewingId === activity.id}
                          onClick={() =>
                            handlePendingDecision(activity.id, "public")
                          }
                        >
                          {isReviewingId === activity.id
                            ? "Saving..."
                            : "Approve & Publish"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No pending activities right now.
              </p>
            )}
          </Card>
        ) : null}

        <Card className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Recommended near you
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Activities close to you, ranked by proximity and freshness.
                </p>
              </div>
            </div>
          </div>

          {recsLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading recommendations...
            </p>
          ) : recommendations.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 6).map((rec) => (
                <RecommendationCard key={rec.id} activity={rec} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No nearby recommendations yet.
            </p>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Activities map
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Grey interactive map with all approved activities by latitude and
                longitude.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {activities.length} published activities
            </p>
          </div>

          <ActivityMap
            activities={activities}
            selectedActivity={selectedActivity}
            onSelectActivity={setSelectedActivity}
            enrolledActivities={enrolledActivities}
          />

          {selectedActivityData ? (
            <div className="rounded-lg border border-border p-3 bg-muted/40 text-sm">
              <p className="font-medium text-foreground">
                {selectedActivityData.title}
              </p>
              <p className="text-muted-foreground">
                {selectedActivityData.location} •{" "}
                {selectedActivityData.date.toLocaleDateString()}
              </p>
            </div>
          ) : null}
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer hover:border-primary transition"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(event) => setSelectedDifficulty(event.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer hover:border-primary transition"
              >
                <option value="">All Difficulties</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>

              {hasActiveFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedDifficulty("");
                  }}
                  className="gap-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              ) : null}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredActivities.length} of {activities.length} activities
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">
            Loading activities...
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEnroll={handleEnroll}
                isEnrolled={enrolledActivities.has(activity.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No activities found
            </h3>
            <p className="text-muted-foreground max-w-md">
              Try adjusting your filters or search query to find activities that
              match your interests.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedDifficulty("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
