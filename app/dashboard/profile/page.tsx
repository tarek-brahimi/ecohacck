"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Cake, ActivitySquare } from "lucide-react";
import { Activity, UserProfile } from "@/lib/types";
import {
  apiRequest,
  parseActivities,
  parseUserProfile,
} from "@/lib/api-client";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      const [profileData, activityData] = await Promise.all([
        apiRequest<UserProfile>("/api/users/me/profile"),
        apiRequest<Activity[]>("/api/activities"),
      ]);

      if (!isActive) {
        return;
      }

      setProfile(parseUserProfile(profileData));
      setActivities(parseActivities(activityData));
    };

    loadProfile().catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  const userEnrollments = profile?.joinedActivities || [];
  const enrolledActivities = activities.filter((activity) =>
    userEnrollments.includes(activity.id),
  );

  const ageGroupLabel =
    user?.ageGroup === "teen" ? "13-17 years" : "18-24 years";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your account information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary-foreground">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {user?.fullName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.ageGroup === "teen" ? "Teen" : "Young Adult"}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Points</span>
                  <span className="text-xl font-bold text-primary">
                    {user?.points}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Activities Joined
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {userEnrollments.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Member Since
                  </span>
                  <span className="text-sm text-foreground">
                    {user?.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Edit Profile
              </Button>
            </Card>
          </div>

          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Cake className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age Group</p>
                    <p className="text-foreground">{ageGroupLabel}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Interests */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Your Interests
              </h3>
              {user?.interests && user.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <div
                      key={interest}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No interests selected yet. Update your profile to add
                  interests.
                </p>
              )}
            </Card>

            {/* Recent Activities */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ActivitySquare className="w-5 h-5" />
                  Activities Joined
                </h3>
                <span className="text-sm text-muted-foreground">
                  {enrolledActivities.length}
                </span>
              </div>

              {enrolledActivities.length > 0 ? (
                <div className="space-y-2">
                  {enrolledActivities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition"
                    >
                      <p className="font-medium text-foreground text-sm">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.location}
                      </p>
                    </div>
                  ))}
                  {enrolledActivities.length > 5 && (
                    <p className="text-sm text-muted-foreground pt-2">
                      +{enrolledActivities.length - 5} more activities
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t joined any activities yet. Browse the
                  activity feed to get started!
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
