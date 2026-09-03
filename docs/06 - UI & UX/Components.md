# 🧩 UI Components & Patterns

This document details the visual components, design patterns, and interactive micro-interactions used across PAWLSE.

---

## 🎨 UI Component Catalog

### 1. Buttons & Action Triggers
- **Primary CTA**: High-contrast orange or role-themed gradient with active scaling (`active:scale-95`).
- **Secondary / Outline**: Clean border with subtle hover background fill.
- **Destructive**: Rose-tinted background for delete/reject confirmations.
- **Loading State**: Embedded spinner (`lucide-react Loader2` / `spinner.tsx`) with disabled state.

### 2. Cards & Containers
- **Border Radius**: `rounded-2xl` (`1rem` / `16px`).
- **Elevation**: Subtle border with hover elevation (`transform: translateY(-6px)` and expanded shadow).
- **Stat Cards**: Dynamic icon badges, percentage changes, and bold value counters.

### 3. Forms & Inputs
- **Text Inputs & Textareas**: `rounded-xl` with smooth border transitions and focused ring glow (`ring-primary/50`).
- **6-Slot OTP Input (`input-otp.tsx`)**: High-accessibility numeric code input with auto-advance.
- **Select & Dropdowns**: Radix UI Select with custom scrollable option lists.

### 4. Navigation & Layout Elements
- **Public Header**: Sticky navigation bar with mobile hamburger drawer and emergency SOS button.
- **Dashboard Sidebar**: Collapsible drawer with active indicator tabs, icon badges, and cookie-persisted state.
- **Breadcrumbs**: Hierarchical route crumbs for deep admin sections.

### 5. Dialogs, Modals & Sheets
- **Backdrop**: Smooth backdrop blur (`backdrop-blur-sm bg-black/40`).
- **Animation**: Fluid entrance via Motion (zoom and fade).
- **Adoption Wizard Modal**: Multi-step application stepper with progress bar and document dropzones.

### 6. Badges & Status Indicators
- **Status Tags**: Color-coded pill tags:
  - `Verified` / `Approved` / `Rescued` / `Good`: Emerald Green
  - `Pending` / `Under Review` / `Assigned`: Amber / Sky Blue
  - `Rejected` / `Critical` / `Expired`: Rose / Red
  - `Duplicate` / `Cancelled`: Slate / Gray

---

## 🔗 Related Documentation
- [[Design System]]
- [[Colors & Themes]]
- [[Typography]]
- [[Responsive Design]]
