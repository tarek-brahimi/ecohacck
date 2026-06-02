# Data Structure Overview

## Core Data Models

```
┌─────────────────────────────────────────────────────────────┐
│                        USER DATA                            │
├─────────────────────────────────────────────────────────────┤
│ id: string (unique identifier)                              │
│ email: string (unique)                                      │
│ fullName: string                                            │
│ ageGroup: 'teen' | 'young-adult'                           │
│ interests: ActivityCategory[] (sports, arts, tech, ...)    │
│ points: number (gamification score)                         │
│ role: 'user' | 'admin'                                      │
│ createdAt: Date                                             │
│                                                              │
│ Extended:                                                    │
│ ├─ UserProfile (extends User)                              │
│ │  ├─ bio?: string                                         │
│ │  ├─ avatar?: string                                      │
│ │  └─ joinedActivities: string[] (activity IDs)            │
│ └─ UserRole: 'user' | 'admin'                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     ACTIVITY DATA                           │
├─────────────────────────────────────────────────────────────┤
│ id: string (unique identifier)                              │
│ title: string                                               │
│ description: string                                         │
│ category: ActivityCategory (sports|arts|tech|social|...)   │
│ location: string (address)                                  │
│ latitude: number                                            │
│ longitude: number                                           │
│ date: Date                                                  │
│ imageUrl: string                                            │
│ difficultyLevel: 'easy' | 'medium' | 'hard'               │
│ organizerId: string (User ID)                              │
│ enrollmentCount: number                                     │
│ createdAt: Date                                             │
│                                                              │
│ Related:                                                     │
│ ├─ ActivityEnrollment                                       │
│ │  ├─ id: string                                           │
│ │  ├─ userId: string                                       │
│ │  ├─ activityId: string                                   │
│ │  └─ enrolledAt: Date                                     │
│ └─ ActivityCategory: 'sports' | 'arts' | 'tech' | ...     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   LEADERBOARD DATA                          │
├─────────────────────────────────────────────────────────────┤
│ userId: string                                              │
│ userName: string                                            │
│ points: number (total points earned)                        │
│ rank: number (1-based ranking)                              │
│ activities: number (activities participated in)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CHAT DATA                              │
├─────────────────────────────────────────────────────────────┤
│ id: string                                                  │
│ role: 'user' | 'assistant'                                 │
│ content: string (message text)                              │
│ createdAt: Date                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Relationships

```
USER
├── has many → ACTIVITY_ENROLLMENT
│             └── references → ACTIVITY
├── has many → ACTIVITY (as organizer)
└── appears in → LEADERBOARD_ENTRY

ACTIVITY
├── has many ← ACTIVITY_ENROLLMENT
├── created by ← USER
└── searchable by → ACTIVITY_CATEGORY

ACTIVITY_ENROLLMENT
├── references → USER
└── references → ACTIVITY

LEADERBOARD_ENTRY
└── aggregates data from → USER & ACTIVITY_ENROLLMENT
```

## Database Schema

### Users Table
```
id (PK)
email (UNIQUE, INDEXED)
fullName
ageGroup
interests (JSON array)
points
role
bio
avatar
createdAt
updatedAt
```

### Activities Table
```
id (PK)
title
description
category (INDEXED)
location
latitude
longitude
date (INDEXED)
imageUrl
difficultyLevel
organizerId (FK → Users)
enrollmentCount
createdAt
updatedAt
```

### ActivityEnrollments Table
```
id (PK)
userId (FK → Users, INDEXED)
activityId (FK → Activities, INDEXED)
enrolledAt
completedAt (nullable)
rating (nullable)
```

### ChatMessages Table
```
id (PK)
userId (FK → Users)
role
content
createdAt
```

## API Response Structure

```typescript
// Success Response
{
  success: true,
  data: T,        // Generic data type
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  message?: string
}

// Paginated Response
{
  items: T[],
  total: number,
  page: number,
  pageSize: number
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENTS                               │
│  (Display layer - handles UI rendering)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    HOOKS/CONTEXTS                           │
│  (State management - useAuth, useToast, custom hooks)       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES                                  │
│  (Business logic - UserService, ActivityService)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    MODELS                                   │
│  (Type definitions - ensure type safety)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│  (Server layer - database, business logic)                  │
└─────────────────────────────────────────────────────────────┘
```

## State Management Strategy

### Global State (via Contexts)
- **AuthContext**: Current user, authentication status
- **Current user**: Loaded on app startup

### Local State (via Hooks)
- **Component-specific data**: Forms, UI toggles
- **Toast notifications**: useToast hook
- **Activity lists**: Could use custom hook

### Server State (via Services)
- **Fetched from API**: Activities, leaderboard, chat
- **Cached when needed**: Local storage for user preferences

## Key Features

### 1. User Management
- Registration & Login
- Profile management
- Role-based access (user/admin)
- Points/gamification system

### 2. Activity Management
- Create, read, update, delete activities
- Search by category, location, difficulty
- Enrollment tracking
- Organizer management

### 3. Gamification
- Points system for participation
- Leaderboard rankings
- Achievement tracking

### 4. Location-Based
- Activity coordinates (lat/lng)
- Distance calculation
- Map integration

### 5. Chat/AI
- Chat message storage
- User/AI role differentiation

## Performance Considerations

1. **Indexing**: Email, category, location, date on activities
2. **Pagination**: Limit results for large datasets
3. **Caching**: User profile, leaderboard in local storage
4. **Image Optimization**: Use CDN for activity images
5. **API Calls**: Debounce search, lazy load lists

## Security

1. **Authentication**: Token-based (JWT recommended)
2. **Authorization**: Role-based access control
3. **Data Validation**: Server-side validation in services
4. **Input Sanitization**: Clean user inputs
5. **HTTPS**: Always use encrypted connections

## Scalability

1. **Horizontal**: Multiple API servers
2. **Database**: Sharding by userId or category
3. **Caching**: Redis for frequently accessed data
4. **CDN**: For static assets and images
5. **Microservices**: Separate services for complex operations
