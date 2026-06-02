/**
 * Application Constants
 * Centralized configuration and constant values
 */

// Activity categories
export const ACTIVITY_CATEGORIES = [
  'sports',
  'arts',
  'tech',
  'social',
  'outdoor',
  'music',
  'other',
] as const;

// Age groups
export const AGE_GROUPS = ['teen', 'young-adult'] as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

// User roles
export const USER_ROLES = ['user', 'admin'] as const;

// Points system
export const POINTS_CONFIG = {
  ACTIVITY_PARTICIPATION: 10,
  ACTIVITY_COMPLETION: 25,
  FIRST_ACTIVITY: 50,
  REFERRAL: 100,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  ACTIVITIES: '/api/activities',
  LEADERBOARD: '/api/leaderboard',
  CHAT: '/api/chat',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_ID: 'wakti_user_id',
  AUTH_TOKEN: 'wakti_auth_token',
  PREFERENCES: 'wakti_preferences',
} as const;

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 12,
  DEFAULT_CENTER: { lat: 0, lng: 0 } as { lat: number; lng: number },
} as const;
