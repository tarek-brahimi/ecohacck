"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ActivityCard } from "@/components/activity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity } from "@/lib/types";
import {
  apiRequest,
  parseActivities,
  parseUserProfile,
} from "@/lib/api-client";
import { Search, Filter, X } from "lucide-react";

export default function FeedPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledActivities, setEnrolledActivities] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  useEffect(() => {
    let isActive = true;

    const loadFeed = async () => {
      try {
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
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadFeed();

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

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedDifficulty;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Activity Feed
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover activities that match your interests
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-foreground placeholder-muted-foreground focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer hover:border-primary transition"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer hover:border-primary transition"
              >
                <option value="">All Difficulties</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
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
              )}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredActivities.length} of {activities.length}{" "}
            activities
          </p>
        </div>

        {/* Activity Grid */}
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
            <div className="text-6xl mb-4">🔍</div>
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
