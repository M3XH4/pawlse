# 🏷️ TypeScript

PAWLSE is strictly typed across the entire frontend architecture using **TypeScript 5.7+**.

---

## 📂 Type Definitions Map (`resources/js/types/`)

```
resources/js/types/
├── admin.ts         # Admin metric interfaces, rescue case DTOs, donation items
├── auth.ts          # User model, Auth object, Two-Factor & OTP types
├── dashboard.ts     # Metric cards, status badges, activity timeline items
├── global.d.ts      # Global window extensions (route helper, ziggy/wayfinder)
├── index.ts         # Central export barrel & SharedData interface
├── navigation.ts    # Sidebar NavItem and breadcrumb interfaces
├── ui.ts            # UI component props, theme options, filter types
└── vite-env.d.ts    # Vite environment variable types
```

---

## 🔍 Core Type Contracts

### 1. `SharedData` (`resources/js/types/index.ts`)
Defines the global props provided to every Inertia page:
```typescript
export interface SharedData {
    name: string;
    auth: {
        user: User | null;
    };
    can_switch_to_volunteer: boolean;
    sidebarOpen: boolean;
    dashboardRole: 'user' | 'volunteer' | 'admin' | 'super-admin' | null;
    dashboardNotifications: DashboardNotification[];
    dashboardNotificationActions: {
        markAllReadUrl: string;
        clearAllUrl: string;
    } | null;
    unreadNotificationCount: number;
    dashboardChrome: {
        greeting: string;
        dateLabel: string;
    } | null;
    [key: string]: unknown;
}
```

### 2. `User` Interface (`resources/js/types/auth.ts`)
```typescript
export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    avatar?: string;
    avatar_path?: string | null;
    email_verified_at: string | null;
    two_factor_enabled: boolean;
    roles?: { id: number; name: string }[];
    created_at: string;
    updated_at: string;
}
```

### 3. Laravel Wayfinder Route Typing (`resources/js/actions/`)
Laravel Wayfinder generates TypeScript functions matching backend controllers:
```typescript
import { storeRescue } from '@/actions/App/Http/Controllers/PetReportController';
// Type-safe URL generation and parameter checking
```

---

## 🧪 Type Checking

Run the TypeScript compiler without emitting JS to verify complete type safety across the project:
```bash
npm run types:check
```

---

## 🔗 Related Documentation
- [[React Structure]]
- [[Inertia Architecture]]
- [[Pages]]
- [[Development Workflow]]
