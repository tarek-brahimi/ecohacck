/**
 * Data Models - Central export point for all type definitions
 */

export type UserRole = 'user' | 'admin';
export type AgeGroup = 'teen' | 'young-adult';
export type ActivityCategory = 'sports' | 'arts' | 'tech' | 'social' | 'outdoor' | 'music' | 'other';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// ==================== USER MODELS ====================
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
  bio?: string;
  avatar?: string;
  joinedActivities: string[];
}

// ==================== ACTIVITY MODELS ====================
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

// ==================== LEADERBOARD MODELS ====================
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  rank: number;
  activities: number;
}

// ==================== CHAT MODELS ====================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

// ==================== API RESPONSE MODELS ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
