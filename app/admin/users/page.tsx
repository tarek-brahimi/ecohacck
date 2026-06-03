"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { User } from "@/lib/types";
import { apiRequest, parseUser } from "@/lib/api-client";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [users, setUsers] = useState<Array<User & { activityCount?: number }>>(
    [],
  );
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    apiRequest<Array<User & { activityCount?: number }>>(
      "/api/users?includeStats=1",
    )
      .then((data) => {
        setUsers(
          data.map(parseUser).map((currentUser, index) => ({
            ...currentUser,
            activityCount: data[index]?.activityCount,
          })),
        );
      })
      .catch(() => setUsers([]));
  }, []);

  const handleRoleChange = async (userId: string, role: User["role"]) => {
    setRoleError("");
    setUpdatingUserId(userId);

    try {
      const updatedUser = await apiRequest<User>(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === userId
            ? { ...currentUser, ...parseUser(updatedUser) }
            : currentUser,
        ),
      );
    } catch (error) {
      setRoleError(
        error instanceof Error
          ? error.message
          : "Unable to update user role.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Users Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage user accounts and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="p-4 mb-6 space-y-4">
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-foreground placeholder-muted-foreground focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filter by:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="house-owner">House Owner</option>
            </select>
          </div>
        </Card>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {users.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">House Owners</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {users.filter((u) => u.role === "house-owner").length}
            </p>
          </Card>
        </div>

        {roleError ? (
          <p className="mb-4 text-sm text-destructive">{roleError}</p>
        ) : null}

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Age Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Activities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-primary/10 text-primary"
                              : user.role === "house-owner"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                        {user.ageGroup === "teen" ? "13-17" : "18-24"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary">
                        {user.points}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.activityCount ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.role === "admin" ? (
                          <span className="text-xs text-muted-foreground">
                            Admin account
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            disabled={updatingUserId === user.id}
                            onChange={(event) =>
                              handleRoleChange(
                                user.id,
                                event.target.value as User["role"],
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-border bg-background text-foreground text-sm cursor-pointer"
                          >
                            <option value="user">User</option>
                            <option value="house-owner">House Owner</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {users.length}
            </span>{" "}
            users
          </p>
        </div>
      </div>
    </div>
  );
}
