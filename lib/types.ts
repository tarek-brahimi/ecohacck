export type UserRole = 'user' | 'admin';
export type AgeGroup = 'teen' | 'young-adult';
export type ActivityCategory = 'sports' | 'arts' | 'tech' | 'social' | 'outdoor' | 'music' | 'other';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

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
  enrollmentCount: number;
  createdAt: Date;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}
