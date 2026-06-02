/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

import { User, Activity, LeaderboardEntry } from '../data/models';

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate distance between two coordinates (in km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Sort activities by distance from user location
 */
export function sortActivitiesByDistance(
  activities: Activity[],
  userLat: number,
  userLng: number
): Activity[] {
  return [...activities].sort((a, b) => {
    const distA = calculateDistance(userLat, userLng, a.latitude, a.longitude);
    const distB = calculateDistance(userLat, userLng, b.latitude, b.longitude);
    return distA - distB;
  });
}

/**
 * Filter activities by category
 */
export function filterByCategory(activities: Activity[], category: string): Activity[] {
  return activities.filter((activity) => activity.category === category);
}

/**
 * Sort leaderboard entries by points
 */
export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Format activity date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
}

/**
 * Get age group label
 */
export function getAgeGroupLabel(ageGroup: string): string {
  const labels: Record<string, string> = {
    teen: '13-19 years',
    'young-adult': '20-30 years',
  };
  return labels[ageGroup] || ageGroup;
}

/**
 * Get difficulty color class
 */
export function getDifficultyColor(level: string): string {
  const colors: Record<string, string> = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500',
  };
  return colors[level] || 'text-gray-500';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
