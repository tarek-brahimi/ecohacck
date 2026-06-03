export type UserRole = 'user' | 'admin' | 'house-owner';
export type AgeGroup = 'teen' | 'young-adult';
export type ActivityCategory = 'sports' | 'arts' | 'tech' | 'social' | 'outdoor' | 'music' | 'other';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ActivityStatus = 'pending' | 'public' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  ageGroup: AgeGroup;
  interests: ActivityCategory[];
  points: number;
  role: UserRole;
  createdAt: Date;
}

export interface UserProfile extends User {
  bio?: string | null;
  avatar?: string | null;
  joinedActivities: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  location: string;
  latitude: number;
  longitude: number;
  date: Date;
  imageUrl: string;
  difficultyLevel: DifficultyLevel;
  organizerId: string;
  houseOwnerId: string;
  status: ActivityStatus;
  enrollmentCount: number;
  createdAt: Date;
  approvedAt?: Date | null;
}

export interface ActivityEnrollment {
  id: string;
  userId: string;
  activityId: string;
  enrolledAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  rank: number;
  activities: number;
}
