"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LocationMapPicker } from "@/components/location-map-picker";
import { Trash2, Plus, Search } from "lucide-react";
import { Activity, User } from "@/lib/types";
import {
  apiRequest,
  parseActivities,
  parseActivity,
  parseUser,
} from "@/lib/api-client";

const CATEGORY_OPTIONS: Activity["category"][] = [
  "sports",
  "arts",
  "tech",
  "social",
  "outdoor",
  "music",
  "other",
];

const DIFFICULTY_OPTIONS: Activity["difficultyLevel"][] = [
  "easy",
  "medium",
  "hard",
];

const STATUS_STYLES: Record<Activity["status"], string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  public: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

type ActivityFormState = {
  title: string;
  description: string;
  category: Activity["category"];
  location: string;
  latitude: string;
  longitude: string;
  date: string;
  imageUrl: string;
  difficultyLevel: Activity["difficultyLevel"];
  houseOwnerId: string;
};

const INITIAL_FORM_STATE: ActivityFormState = {
  title: "",
  description: "",
  category: "sports",
  location: "",
  latitude: "",
  longitude: "",
  date: "",
  imageUrl: "",
  difficultyLevel: "easy",
  houseOwnerId: "",
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [houseOwners, setHouseOwners] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState<ActivityFormState>(
    INITIAL_FORM_STATE,
  );

  useEffect(() => {
    let isActive = true;

    const loadAdminData = async () => {
      const [activityData, houseOwnerData] = await Promise.all([
        apiRequest<Activity[]>("/api/activities?status=all"),
        apiRequest<Array<User & { activityCount?: number }>>(
          "/api/users?role=house-owner",
        ),
      ]);

      if (!isActive) {
        return;
      }

      const parsedActivities = parseActivities(activityData);
      const parsedHouseOwners = houseOwnerData.map(parseUser);
      setActivities(parsedActivities);
      setHouseOwners(parsedHouseOwners);
      setFormState((currentState) => ({
        ...currentState,
        houseOwnerId:
          currentState.houseOwnerId || parsedHouseOwners[0]?.id || "",
      }));
    };

    loadAdminData().catch(() => {
      if (!isActive) {
        return;
      }
      setActivities([]);
      setHouseOwners([]);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredActivities = activities.filter((activity) => {
    const normalizedSearch = searchQuery.toLowerCase();
    const matchesSearch =
      activity.title.toLowerCase().includes(normalizedSearch) ||
      activity.location.toLowerCase().includes(normalizedSearch);
    const matchesCategory =
      !selectedCategory || activity.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || activity.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(activities.map((activity) => activity.category))];
  const houseOwnerById = new Map(
    houseOwners.map((houseOwner) => [houseOwner.id, houseOwner.fullName]),
  );

  const handleDelete = async (id: string) => {
    await apiRequest(`/api/activities/${id}`, { method: "DELETE" });
    setActivities((currentActivities) =>
      currentActivities.filter((activity) => activity.id !== id),
    );
  };

  const updateFormField = <T extends keyof ActivityFormState>(
    field: T,
    value: ActivityFormState[T],
  ) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  };

  const handleCreateActivity = async () => {
    setFormError("");

    if (
      !formState.title ||
      !formState.description ||
      !formState.location ||
      !formState.date ||
      !formState.imageUrl ||
      !formState.houseOwnerId
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    const latitude = Number(formState.latitude);
    const longitude = Number(formState.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setFormError("Latitude and longitude must be valid numbers.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdActivity = await apiRequest<Activity>("/api/activities", {
        method: "POST",
        body: JSON.stringify({
          title: formState.title,
          description: formState.description,
          category: formState.category,
          location: formState.location,
          latitude,
          longitude,
          date: new Date(formState.date).toISOString(),
          imageUrl: formState.imageUrl,
          difficultyLevel: formState.difficultyLevel,
          houseOwnerId: formState.houseOwnerId,
        }),
      });

      setActivities((currentActivities) =>
        [...currentActivities, parseActivity(createdActivity)].sort(
          (a, b) => a.date.getTime() - b.date.getTime(),
        ),
      );
      setFormState({
        ...INITIAL_FORM_STATE,
        houseOwnerId: houseOwners[0]?.id || "",
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create activity. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Activities Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Create activities for houses and monitor approval status
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-5 h-5" />
                  New Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Activity</DialogTitle>
                  <DialogDescription>
                    New activities start as pending and become public only after
                    the assigned house owner approves them.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="activity-title">Title</Label>
                    <Input
                      id="activity-title"
                      value={formState.title}
                      onChange={(event) =>
                        updateFormField("title", event.target.value)
                      }
                      placeholder="Activity title"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="activity-description">Description</Label>
                    <Textarea
                      id="activity-description"
                      value={formState.description}
                      onChange={(event) =>
                        updateFormField("description", event.target.value)
                      }
                      placeholder="What will participants do?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-category">Category</Label>
                    <select
                      id="activity-category"
                      value={formState.category}
                      onChange={(event) =>
                        updateFormField(
                          "category",
                          event.target.value as Activity["category"],
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-difficulty">Difficulty</Label>
                    <select
                      id="activity-difficulty"
                      value={formState.difficultyLevel}
                      onChange={(event) =>
                        updateFormField(
                          "difficultyLevel",
                          event.target.value as Activity["difficultyLevel"],
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    >
                      {DIFFICULTY_OPTIONS.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() +
                            difficulty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="activity-location">Location</Label>
                    <Input
                      id="activity-location"
                      value={formState.location}
                      onChange={(event) =>
                        updateFormField("location", event.target.value)
                      }
                      placeholder="Address or place name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Map location</Label>
                    <LocationMapPicker
                      latitude={
                        formState.latitude === ""
                          ? null
                          : Number(formState.latitude)
                      }
                      longitude={
                        formState.longitude === ""
                          ? null
                          : Number(formState.longitude)
                      }
                      onChange={(latitude, longitude) => {
                        updateFormField("latitude", String(latitude));
                        updateFormField("longitude", String(longitude));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-latitude">Latitude</Label>
                    <Input
                      id="activity-latitude"
                      type="number"
                      step="any"
                      value={formState.latitude}
                      onChange={(event) =>
                        updateFormField("latitude", event.target.value)
                      }
                      placeholder="24.7136"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-longitude">Longitude</Label>
                    <Input
                      id="activity-longitude"
                      type="number"
                      step="any"
                      value={formState.longitude}
                      onChange={(event) =>
                        updateFormField("longitude", event.target.value)
                      }
                      placeholder="46.6753"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-date">Date & time</Label>
                    <Input
                      id="activity-date"
                      type="datetime-local"
                      value={formState.date}
                      onChange={(event) =>
                        updateFormField("date", event.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-house-owner">House</Label>
                    <select
                      id="activity-house-owner"
                      value={formState.houseOwnerId}
                      onChange={(event) =>
                        updateFormField("houseOwnerId", event.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    >
                      <option value="" disabled>
                        Select house owner
                      </option>
                      {houseOwners.map((houseOwner) => (
                        <option key={houseOwner.id} value={houseOwner.id}>
                          {houseOwner.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="activity-image-url">Image URL</Label>
                    <Input
                      id="activity-image-url"
                      value={formState.imageUrl}
                      onChange={(event) =>
                        updateFormField("imageUrl", event.target.value)
                      }
                      placeholder="https://example.com/activity-image.jpg"
                    />
                  </div>
                </div>

                {!houseOwners.length ? (
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    No house owners yet. Assign a user the House Owner role in
                    Admin → Users, then create activities.
                  </p>
                ) : null}

                {formError ? (
                  <p className="text-sm text-destructive">{formError}</p>
                ) : null}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateActivity}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Pending Activity"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-4 mb-6 space-y-4">
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

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filter by:</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="public">Public</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    House
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-muted/50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {activity.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                        {activity.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground truncate">
                        {activity.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {houseOwnerById.get(activity.houseOwnerId) || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[activity.status]}`}
                        >
                          {activity.status.charAt(0).toUpperCase() +
                            activity.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.difficultyLevel === "easy"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : activity.difficultyLevel === "medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {activity.difficultyLevel.charAt(0).toUpperCase() +
                            activity.difficultyLevel.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {activity.enrollmentCount}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No activities found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredActivities.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {activities.length}
            </span>{" "}
            activities
          </p>
        </div>
      </div>
    </div>
  );
}
