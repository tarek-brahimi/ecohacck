# Project Structure Documentation

## Overview
This document outlines the reorganized structure of the Wakti application. The project has been reorganized into a clean, scalable data-driven architecture.

---

## Directory Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (Button, Card, Input, etc.)
│   ├── activity-card.tsx # Activity display component
│   └── index.ts         # Component exports
│
├── contexts/            # React contexts for state management
│   ├── auth-context.tsx # Authentication context and provider
│   └── index.ts         # Context exports
│
├── data/                # Data layer (models, services, constants)
│   ├── models/
│   │   └── index.ts     # Type definitions (User, Activity, etc.)
│   ├── services/
│   │   ├── user.service.ts      # User-related API calls
│   │   ├── activity.service.ts  # Activity-related API calls
│   │   └── index.ts             # Service exports
│   ├── constants.ts     # App constants and configuration
│   └── mock-data.ts     # Mock/test data
│
├── hooks/               # Custom React hooks
│   ├── useToast.ts      # Toast notification hook
│   ├── index.ts         # Hook exports
│   └── use-toast.ts     # Legacy hook (deprecated)
│
├── utils/               # Utility functions
│   ├── helpers.ts       # Common helper functions
│   └── index.ts         # Utility exports
│
app/                     # Next.js app directory
├── admin/               # Admin pages
├── dashboard/           # User dashboard pages
├── login/               # Login page
├── signup/              # Signup page
├── layout.tsx           # Root layout
├── page.tsx             # Landing page
└── globals.css          # Global styles

public/                  # Static assets
├── icons/              # Icon files
├── apple-icon.png
└── placeholder-user.jpg
```

---

## Data Layer Organization

### Models (`src/data/models/index.ts`)
Centralized TypeScript interfaces for:
- **User Models**: `User`, `UserProfile`
- **Activity Models**: `Activity`, `ActivityEnrollment`
- **Leaderboard Models**: `LeaderboardEntry`
- **Chat Models**: `ChatMessage`
- **API Models**: `ApiResponse`, `PaginatedResponse`

### Services (`src/data/services/`)
Class-based services for API operations:
- **UserService**: Login, signup, profile management
- **ActivityService**: CRUD operations for activities, enrollments

### Constants (`src/data/constants.ts`)
Centralized configuration including:
- Activity categories, age groups, difficulty levels
- Points system configuration
- API endpoints
- Local storage keys
- Map configuration

---

## Key Improvements

### ✅ What Was Removed
- **44 unused UI components** (accordion, avatar, badge, breadcrumb, calendar, carousel, chart, etc.)
- **Theme provider** (not utilized)
- **Unused hooks** (use-mobile)
- **Placeholder images** (placeholder-logo.png, placeholder-logo.svg, placeholder.jpg, placeholder.svg)

### ✅ What Was Cleaned
- Organized all components into `src/` directory
- Consolidated type definitions in `data/models`
- Created dedicated service layer for API calls
- Structured constants in one location
- Added comprehensive utility functions

### ✅ What Was Added
- **Service classes** for data operations
- **API response models** for consistent API handling
- **Utility functions** for common operations (distance calculation, sorting, filtering)
- **Custom hooks** for state management
- **Constants configuration** for centralized settings

---

## Usage Examples

### Using Models
```typescript
import { User, Activity } from '@/src/data/models';

const user: User = {
  id: '123',
  email: 'user@example.com',
  fullName: 'John Doe',
  // ... other fields
};
```

### Using Services
```typescript
import { UserService, ActivityService } from '@/src/data/services';

// Get user profile
const result = await UserService.getProfile(userId);
if (result.success) {
  console.log(result.data);
}

// Get activities
const activities = await ActivityService.getActivities({ category: 'sports' });
```

### Using Constants
```typescript
import { ACTIVITY_CATEGORIES, POINTS_CONFIG } from '@/src/data/constants';

const categories = ACTIVITY_CATEGORIES; // ['sports', 'arts', 'tech', ...]
const bonus = POINTS_CONFIG.FIRST_ACTIVITY; // 50
```

### Using Utilities
```typescript
import { 
  formatDate, 
  calculateDistance, 
  sortActivitiesByDistance 
} from '@/src/utils';

const formatted = formatDate(new Date());
const distance = calculateDistance(lat1, lon1, lat2, lon2);
const sorted = sortActivitiesByDistance(activities, userLat, userLng);
```

### Using Custom Hooks
```typescript
import { useToast } from '@/src/hooks';

const { success, error } = useToast();

success('Activity joined!', 'You are now enrolled');
error('Failed to join', 'Please try again');
```

### Using Auth Context
```typescript
import { useAuth } from '@/src/contexts';

const { user, isAuthenticated, logout } = useAuth();
```

---

## Next Steps for Development

1. **Implement API Integration**
   - Replace TODO comments in services with actual API calls
   - Connect UserService and ActivityService to backend

2. **Add Additional Services**
   - LeaderboardService
   - ChatService
   - EnrollmentService

3. **Expand Utilities**
   - Add validation utilities
   - Add formatting utilities for specific data types

4. **Add More Custom Hooks**
   - useActivities (fetch and manage activities)
   - useLeaderboard (fetch leaderboard data)
   - useUser (fetch and manage user data)

5. **Testing**
   - Add unit tests for services
   - Add integration tests for components
   - Add e2e tests for user flows

---

## Component Usage Summary

**Currently Used UI Components:**
- Button
- Card
- Input
- Checkbox
- Dialog
- Label
- Separator
- Sheet
- Skeleton
- Toast / Toaster
- Textarea
- Toggle
- Tooltip

All other UI components have been removed to reduce bundle size and complexity.

---

## Configuration Files
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration
- `components.json` - shadcn/ui configuration
- `package.json` - Dependencies and scripts

---

## Backend Integration Ready
The service layer is designed for easy backend integration. Simply replace the `TODO` comments with actual API calls:

```typescript
static async login(email: string, password: string): Promise<ApiResponse<User>> {
  try {
    // TODO: Replace with actual API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## Author Notes
- All paths use `@/src/` prefix (configure in `tsconfig.json` if needed)
- Follow the established patterns when adding new services or utilities
- Keep models in sync with backend schema
- Update constants when business rules change
