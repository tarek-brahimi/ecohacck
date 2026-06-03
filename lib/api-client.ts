import type { Activity, LeaderboardEntry, User, UserProfile } from '@/lib/types';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export async function apiRequest<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | T | null;

  if (!response.ok) {
    const errorMessage = payload && typeof payload === 'object' && 'error' in payload && payload.error
      ? payload.error
      : 'Request failed';
    throw new Error(errorMessage);
  }

  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export function parseUser(user: User | { createdAt: string | Date; [key: string]: unknown }): User {
  return {
    ...(user as User),
    createdAt: new Date(user.createdAt),
  };
}

export function parseUserProfile(profile: UserProfile | { createdAt: string | Date; [key: string]: unknown }): UserProfile {
  return {
    ...parseUser(profile as User),
    bio: typeof profile.bio === 'string' ? profile.bio : null,
    avatar: typeof profile.avatar === 'string' ? profile.avatar : null,
    joinedActivities: Array.isArray(profile.joinedActivities) ? profile.joinedActivities.map(String) : [],
  };
}

export function parseActivity(activity: Activity | { date: string | Date; createdAt: string | Date; approvedAt?: string | Date | null; [key: string]: unknown }): Activity {
  const approvedAt = activity.approvedAt;
  return {
    ...(activity as Activity),
    date: new Date(activity.date),
    createdAt: new Date(activity.createdAt),
    approvedAt: approvedAt ? new Date(approvedAt) : null,
  };
}

export function parseActivities(activities: Activity[]) {
  return activities.map(parseActivity);
}

export function parseLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry {
  return entry;
}