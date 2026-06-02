'use client';

import { User, Activity, ActivityEnrollment, LeaderboardEntry } from './types';

// Mock Users
export const mockUsers: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    email: 'alex@example.com',
    fullName: 'Alex Johnson',
    ageGroup: 'teen',
    interests: ['sports', 'tech', 'social'],
    points: 450,
    role: 'user',
    createdAt: new Date('2024-01-15'),
  },
  'user-2': {
    id: 'user-2',
    email: 'jordan@example.com',
    fullName: 'Jordan Lee',
    ageGroup: 'young-adult',
    interests: ['arts', 'music', 'outdoor'],
    points: 520,
    role: 'user',
    createdAt: new Date('2024-02-10'),
  },
  'user-3': {
    id: 'user-3',
    email: 'taylor@example.com',
    fullName: 'Taylor Smith',
    ageGroup: 'teen',
    interests: ['music', 'tech', 'social'],
    points: 380,
    role: 'user',
    createdAt: new Date('2024-03-05'),
  },
  'admin-1': {
    id: 'admin-1',
    email: 'admin@example.com',
    fullName: 'Admin User',
    ageGroup: 'young-adult',
    interests: ['tech'],
    points: 1000,
    role: 'admin',
    createdAt: new Date('2023-12-01'),
  },
};

// Mock Activities
export const mockActivities: Record<string, Activity> = {
  'activity-1': {
    id: 'activity-1',
    title: 'Basketball Tournament',
    description: 'Join our competitive 3v3 basketball tournament in the park. All skill levels welcome!',
    category: 'sports',
    location: 'Central Park, New York',
    latitude: 40.7829,
    longitude: -73.9654,
    date: new Date('2024-06-15T14:00:00'),
    imageUrl: '/api/placeholder?text=Basketball',
    difficultyLevel: 'medium',
    organizerId: 'user-1',
    enrollmentCount: 12,
    createdAt: new Date('2024-06-01'),
  },
  'activity-2': {
    id: 'activity-2',
    title: 'Digital Art Workshop',
    description: 'Learn digital illustration techniques using Procreate and Photoshop. Beginners welcome!',
    category: 'arts',
    location: 'Creative Hub, San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    date: new Date('2024-06-18T10:00:00'),
    imageUrl: '/api/placeholder?text=Digital%20Art',
    difficultyLevel: 'easy',
    organizerId: 'user-2',
    enrollmentCount: 8,
    createdAt: new Date('2024-06-02'),
  },
  'activity-3': {
    id: 'activity-3',
    title: 'Web Development Bootcamp',
    description: 'Intensive 2-week bootcamp covering React, Next.js, and modern web development.',
    category: 'tech',
    location: 'Tech Campus, Austin',
    latitude: 30.2672,
    longitude: -97.7431,
    date: new Date('2024-06-20T09:00:00'),
    imageUrl: '/api/placeholder?text=Web%20Dev',
    difficultyLevel: 'hard',
    organizerId: 'admin-1',
    enrollmentCount: 25,
    createdAt: new Date('2024-06-01'),
  },
  'activity-4': {
    id: 'activity-4',
    title: 'Jazz Night Jam Session',
    description: 'Casual jazz jam session for musicians of all levels. Bring your instrument!',
    category: 'music',
    location: 'Blue Note, New York',
    latitude: 40.7308,
    longitude: -74.0084,
    date: new Date('2024-06-16T19:00:00'),
    imageUrl: '/api/placeholder?text=Jazz',
    difficultyLevel: 'medium',
    organizerId: 'user-2',
    enrollmentCount: 5,
    createdAt: new Date('2024-06-03'),
  },
  'activity-5': {
    id: 'activity-5',
    title: 'Mountain Hiking Trail',
    description: 'Explore scenic mountain trails. 10-mile moderate difficulty hike with lunch provided.',
    category: 'outdoor',
    location: 'Rocky Mountains, Colorado',
    latitude: 39.7392,
    longitude: -104.9903,
    date: new Date('2024-06-17T08:00:00'),
    imageUrl: '/api/placeholder?text=Hiking',
    difficultyLevel: 'medium',
    organizerId: 'user-1',
    enrollmentCount: 18,
    createdAt: new Date('2024-06-02'),
  },
  'activity-6': {
    id: 'activity-6',
    title: 'Beginner Yoga Class',
    description: 'Relaxing yoga class perfect for beginners. Learn foundational poses and breathing techniques.',
    category: 'social',
    location: 'Wellness Center, Portland',
    latitude: 45.5152,
    longitude: -122.6784,
    date: new Date('2024-06-19T18:00:00'),
    imageUrl: '/api/placeholder?text=Yoga',
    difficultyLevel: 'easy',
    organizerId: 'user-3',
    enrollmentCount: 15,
    createdAt: new Date('2024-06-04'),
  },
};

// Mock Enrollments
export const mockEnrollments: ActivityEnrollment[] = [
  { id: 'enroll-1', userId: 'user-1', activityId: 'activity-1', enrolledAt: new Date('2024-06-05') },
  { id: 'enroll-2', userId: 'user-1', activityId: 'activity-3', enrolledAt: new Date('2024-06-06') },
  { id: 'enroll-3', userId: 'user-2', activityId: 'activity-2', enrolledAt: new Date('2024-06-03') },
  { id: 'enroll-4', userId: 'user-2', activityId: 'activity-4', enrolledAt: new Date('2024-06-07') },
  { id: 'enroll-5', userId: 'user-3', activityId: 'activity-5', enrolledAt: new Date('2024-06-08') },
  { id: 'enroll-6', userId: 'user-3', activityId: 'activity-6', enrolledAt: new Date('2024-06-09') },
];

// Mock Leaderboard (derived from users)
export const getLeaderboard = (): LeaderboardEntry[] => {
  const entries = Object.values(mockUsers)
    .filter(user => user.role === 'user')
    .sort((a, b) => b.points - a.points)
    .map((user, index) => ({
      userId: user.id,
      userName: user.fullName,
      points: user.points,
      rank: index + 1,
      activities: mockEnrollments.filter(e => e.userId === user.id).length,
    }));
  return entries;
};

// Helper to get mock current user (simulating login)
export const getMockCurrentUser = (userId?: string): User | null => {
  if (!userId) return null;
  return mockUsers[userId] || null;
};
