# React Usage in This Repository

## Overview

This repository is a **React-based** calendar and scheduling application. React 19 is used extensively throughout the codebase as the primary UI framework.

## React Dependencies

From `package.json`:

### Production Dependencies
- **react**: `^19.0.0` - Core React library
- **react-dom**: `^19.0.0` - React DOM rendering
- **react-router-dom**: `^6.22.3` - Client-side routing
- **lucide-react**: `^0.479.0` - React icon library

### Development Dependencies
- **@types/react**: `^19.0.0` - TypeScript types for React
- **@types/react-dom**: `^19.0.0` - TypeScript types for React DOM
- **@vitejs/plugin-react**: `^5.1.0` - Vite plugin for React support
- **@testing-library/react**: `^16.2.0` - React testing utilities
- **eslint-plugin-react-hooks**: `^5.1.0-rc.1` - ESLint rules for React Hooks
- **eslint-plugin-react-refresh**: `^0.4.6` - ESLint plugin for Fast Refresh

## React Entry Points

### Main Entry Point
**File**: `src/main.tsx`
```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
```

This file uses:
- `React.StrictMode` - Development mode strict checks
- `createRoot` - React 18+ concurrent rendering API
- Renders into `<div id="root">` from `index.html`

### Root Component
**File**: `src/App.tsx`

The main App component uses:
- `BrowserRouter` (Router) from react-router-dom
- `useEffect` hook from React
- Multiple React Router components (`Routes`, `Route`)
- Custom React components for the UI

## React Component Structure

### Total React Components
- **73 TypeScript React (.tsx) files** in the `src` directory
- **318+ instances** of React hooks usage (useState, useEffect, useCallback, useMemo)

### Component Organization

#### 1. **Pages** (`src/pages/`)
React page components rendered by React Router:
- `Calendar.tsx` - Main calendar view
- `CreateAppointment.tsx` - Appointment creation
- `AppointmentDetails.tsx` - Appointment details view
- `CreateAcceleration.tsx` - Acceleration creation
- `Accelerations.tsx` - Accelerations list
- `ModifyAccelerations.tsx` - Acceleration management
- `ModifyAccess.tsx` - Access control
- `ModifyAvailability.tsx` - Availability management
- `ModifyWorkflows.tsx` - Workflow configuration
- `ModifyTemplates.tsx` - Template management
- `ShiftSchedule.tsx` - Engineer shift scheduling
- `History.tsx` - Historical data view
- `WorkOrders.tsx` - Work order management
- `TIVStatus.tsx` - TIV status tracking
- `MACDs.tsx` - MACD management
- `HelpAndFAQ.tsx` - Help and FAQ page
- And more...

#### 2. **UI Components** (`src/components/ui/`)
Reusable React UI components:
- `Button.tsx` - Button component
- `Card.tsx` - Card container
- `Input.tsx` - Input field
- `Select.tsx` - Dropdown select
- `Modal.tsx` - Modal dialog
- `Dialog.tsx` - Dialog component
- `Alert.tsx` - Alert messages
- `Badge.tsx` - Status badges
- `Table.tsx` - Data table
- `Tabs.tsx` - Tab navigation
- `Tooltip.tsx` - Tooltips
- `LoadingSpinner.tsx` - Loading indicator
- And more...

#### 3. **Feature Components** (`src/components/`)
React components for specific features:
- `Navigation.tsx` - Navigation sidebar
- `UserMenu.tsx` - User menu component
- `ThemeProvider.tsx` - Theme context provider
- `ThemeToggle.tsx` - Dark/light theme toggle
- `ErrorBoundary.tsx` - Error boundary component
- `AuthGuard.tsx` - Authentication guard
- `ImpersonationBar.tsx` - User impersonation UI
- `CapacityManager.tsx` - Capacity management
- `SuggestionEngine.tsx` - AI suggestions
- And more...

#### 4. **Calendar Components** (`src/components/calendar/`)
- `DailyCalendar.tsx` - Daily calendar view
- `WeekView.tsx` - Weekly calendar view
- `MonthView.tsx` - Monthly calendar view
- `TimeSlotGrid.tsx` - Time slot grid

#### 5. **Appointment Components** (`src/components/appointment/`)
- `TimeSlotSelector.tsx` - Time slot selection
- `ProductTypeSelector.tsx` - Product type selection
- `ChangeTypeSelector.tsx` - Change type selection
- `AppointmentDetails.tsx` - Appointment details display

#### 6. **Acceleration Components** (`src/components/accelerations/`)
- `AccelerationTable.tsx` - Accelerations data table
- `EditModal.tsx` - Edit acceleration modal
- `DeleteModal.tsx` - Delete confirmation modal

## React Hooks Usage

### Custom Hooks (`src/hooks/`)
The application uses many custom React hooks:
- `useAppointmentForm.ts` - Form state management
- `useChangeTypes.ts` - Change type data
- `useTeams.ts` - Team data management
- `useBlockedDates.ts` - Blocked dates management
- `useAvailabilitySchedule.ts` - Availability scheduling
- `useAsync.ts` - Async operation handling
- `useTeamEngineers.ts` - Team engineer data
- `useSlotAvailability.ts` - Slot availability checking

### Feature-Specific Hooks
- `src/features/accelerations/hooks/useAccelerationList.ts`
- `src/features/accelerations/hooks/useAccelerationForm.ts`
- `src/features/appointments/hooks/useAppointmentDetails.ts`
- `src/features/availability/hooks/*` - Multiple availability-related hooks

### Standard React Hooks Used
Based on code analysis, the codebase extensively uses:
- `useState` - Component state management
- `useEffect` - Side effects and lifecycle
- `useCallback` - Memoized callbacks
- `useMemo` - Memoized values
- Custom hooks from libraries (Zustand, React Router)

## React Router Configuration

**File**: `src/App.tsx`

The application uses React Router v6 for client-side routing with the following routes:
- `/` - Calendar (main page)
- `/create-appointment` - Create appointment
- `/appointment/:id` - Appointment details
- `/accelerations` - Accelerations list
- `/modify-accelerations` - Modify accelerations
- `/modify-access` - Access management
- `/modify-availability` - Availability management
- `/modify-workflows` - Workflow configuration
- `/modify-templates` - Template management
- `/shift-schedule` - Shift scheduling
- `/history` - History view
- `/work-orders` - Work orders
- `/tiv-status` - TIV status
- `/macds` - MACDs management
- `/help-and-faq` - Help and FAQ

## React Context & State Management

### Theme Context
**File**: `src/components/ThemeProvider.tsx`

Uses React context pattern to provide theme state throughout the application.

### State Management
While the app uses **Zustand** (not React Context) for global state, it integrates seamlessly with React components through hooks like `useStore`.

## Build Configuration

### Vite Configuration
**File**: `vite.config.ts`

```typescript
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
    // Enable React Server Components
    include: "**/*.tsx",
  })],
});
```

Uses `@vitejs/plugin-react` to enable:
- Fast Refresh (Hot Module Replacement)
- JSX/TSX transformation
- React Server Components support

## Testing

### React Testing Library
**File**: `package.json` (devDependencies)

The project uses:
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `vitest` - Test runner (Vite-compatible)

### Test Setup
**File**: `src/setupTests.ts` - Test environment configuration

## TypeScript Integration

All React components are written in TypeScript with `.tsx` extension:
- Type-safe component props
- TypeScript interfaces for React component types
- `React.ReactNode`, `React.FC`, and other React types

## Summary

**React is the foundational framework for this entire application.**

Every user interface component, page, and interactive element is built with React. The application leverages modern React features including:

✅ React 19 (latest version)  
✅ Functional components with hooks  
✅ React Router for navigation  
✅ React Context for theming  
✅ Custom hooks for reusable logic  
✅ TypeScript for type safety  
✅ React Testing Library for tests  
✅ Vite with Fast Refresh for development  

The repository is essentially a **React single-page application (SPA)** for calendar and scheduling management.
