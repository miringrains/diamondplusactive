# UI Shell Unification

## Overview

This document summarizes the UI shell unification changes made to fix layout defects including inconsistent content width, overlapping sidebars, broken grids, and video page overflow.

## Changes Made

### 1. New Shared Components

#### Container Component (`/components/layout/Container.tsx`)
- Provides consistent width management across the app
- Responsive padding: `px-4 sm:px-6 lg:px-8`
- Max width constraint: `max-w-screen-2xl`
- Centers content with `mx-auto`

Usage:
```tsx
<Container>
  <h1>Page content</h1>
</Container>
```

#### AppShell Component (`/components/layout/AppShell.tsx`)
- Unified application shell with fixed sidebar and content area
- Handles responsive behavior consistently
- Fixed width sidebar (w-64 expanded, w-14 collapsed)
- Independent sidebar scroll with proper z-index
- No content overlap at any breakpoint

#### SidebarNav Component (`/components/nav/SidebarNav.tsx`)
- Reusable sidebar navigation with static configuration
- Active state management based on current route
- Filters menu items based on user role (admin vs regular user)
- Consistent styling and tooltips

### 2. Layout Refactoring

#### Dashboard Layout (`/app/(dashboard)/layout.tsx`)
- Simplified to use AppShell component
- Removed duplicate sidebar implementation
- Consistent user info display

#### Admin Layout (`/app/admin/layout.tsx`)
- Unified with dashboard layout using AppShell
- Same navigation structure with admin-specific items
- Proper role-based access control

### 3. Content Width Fixes

#### PageContent Component Updates
- Now uses Container component internally for consistent width
- Special handling for video pages with `hasCourseSidebar` prop
- Removed conflicting sidebar offset calculations

#### Course Pages
- Updated to use Container component
- Fixed course grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Consistent gap spacing: `gap-6`
- Removed inline max-widths and fixed heights

### 4. Video Lesson Page
- Maintains aspect-video ratio to prevent layout shift
- Proper sidebar handling without overlap
- Responsive grid layout for video and notes
- Fixed width course sidebar (320px) on desktop

## Design Decisions

### Container Width
- Max width: `max-w-screen-2xl` (1536px)
- Provides optimal reading width while utilizing modern displays
- Consistent padding scales: 16px → 24px → 32px

### Grid System
- Standardized on 4-column grid for course cards
- Responsive breakpoints: 1 → 2 → 3 → 4 columns
- Uniform gap of 24px (gap-6)

### Sidebar Behavior
- Fixed width to prevent content reflow
- Independent scroll area
- Higher z-index than content
- Collapsible to icon mode on smaller screens

## Usage Guidelines

### For New Pages
1. Always wrap page content in Container component
2. Use PageContent for dashboard pages (it includes Container)
3. Follow the grid pattern for card layouts
4. Don't add custom max-widths or padding

### For Existing Pages
- Replace custom width wrappers with Container
- Remove inline styles for spacing/width
- Use consistent grid classes

## Migration Checklist

- [x] Created shared layout components
- [x] Updated dashboard and admin layouts
- [x] Fixed course grid layouts
- [x] Normalized container widths
- [x] Fixed video page layout
- [x] Removed overlapping sidebar issues

## Future Improvements

1. Consider extracting more common patterns (e.g., card grids)
2. Add Storybook documentation for layout components
3. Create responsive preview tool for testing layouts
4. Audit remaining pages for consistency
