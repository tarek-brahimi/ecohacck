"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, Users, ActivitySquare, TrendingUp } from "lucide-react";
import { Activity, LeaderboardEntry, User } from "@/lib/types";
import {
  apiRequest,
  parseActivities,
  parseLeaderboardEntry,
  parseUser,
} from "@/lib/api-client";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<Array<User & { activityCount?: number }>>(
    [],
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    Promise.all([
      apiRequest<Activity[]>("/api/activities?status=all"),
      apiRequest<Array<User & { activityCount?: number }>>(
        "/api/users?includeStats=1",
      ),
      apiRequest<LeaderboardEntry[]>("/api/leaderboard"),
    ])
      .then(([activityData, userData, leaderboardData]) => {
        setActivities(parseActivities(activityData));
        setUsers(
          userData
            .map(parseUser)
            .map((currentUser, index) => ({
              ...currentUser,
              activityCount: userData[index]?.activityCount,
            }))
            .filter((currentUser) => currentUser.role === "user"),
        );
        setLeaderboard(leaderboardData.map(parseLeaderboardEntry));
      })
      .catch(() => undefined);
  }, []);

  // Calculate stats
  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
  const avgPoints =
    users.length > 0 ? Math.round(totalPoints / users.length) : 0;

  const activityStats = {
    total: activities.length,
    byCategory: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
  };

  activities.forEach((activity) => {
    activityStats.byCategory[activity.category] =
      (activityStats.byCategory[activity.category] || 0) + 1;
    activityStats.byDifficulty[activity.difficultyLevel] =
      (activityStats.byDifficulty[activity.difficultyLevel] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage activities, users, and platform analytics
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Activities
              </p>
              <ActivitySquare className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {activityStats.total}
            </p>
            <p className="text-xs text-muted-foreground">Platform-wide</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Active Users
              </p>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Excluding admins</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </p>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {activities.reduce(
                (sum, activity) => sum + activity.enrollmentCount,
                0,
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              All activities combined
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Points/User
              </p>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{avgPoints}</p>
            <p className="text-xs text-muted-foreground">Per active user</p>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activities Overview */}
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Activities by Category
              </h2>
              <Link href="/admin/activities">
                <Button size="sm" variant="outline">
                  Manage All
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {Object.entries(activityStats.byCategory).map(
                ([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition"
                  >
                    <span className="font-medium text-foreground capitalize">
                      {category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {count}
                    </span>
                  </div>
                ),
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground mb-3">
                By Difficulty
              </h3>
              <div className="space-y-2">
                {Object.entries(activityStats.byDifficulty).map(
                  ([difficulty, count]) => (
                    <div
                      key={difficulty}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground capitalize">
                        {difficulty}
                      </span>
                      <span className="font-medium text-foreground">
                        {count}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Quick Actions
            </h2>

            <div className="space-y-2">
              <Link href="/admin/activities" className="block">
                <Button className="w-full" variant="outline">
                  <ActivitySquare className="w-4 h-4 mr-2" />
                  Manage Activities
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground mb-3 text-sm">
                Top Users
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 3).map((entry, idx) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                  >
                    <span className="text-muted-foreground">
                      #{idx + 1} {entry.userName}
                    </span>
                    <span className="font-semibold text-primary">
                      {entry.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="mt-8 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Recent Activities
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">
                    Title
                  </th>
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">
                    Category
                  </th>
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">
                    Enrollments
                  </th>
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activities.slice(0, 5).map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      {activity.title}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground capitalize">
                      {activity.category}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {activity.enrollmentCount}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {activity.date.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
