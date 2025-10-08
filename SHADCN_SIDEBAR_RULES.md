# Shadcn Sidebar Implementation Rules

## Current Issues Analysis

### 1. Sidebar Component Behavior
- The Shadcn sidebar component has built-in layout mechanisms that we're fighting against
- The `collapsible` prop fundamentally changes how the sidebar behaves on ALL screen sizes
- Our custom CSS is conflicting with Shadcn's internal positioning and spacing logic

### 2. Layout Structure Problems
- We have duplicate containers (`container mx-auto`) at multiple levels
- AppShell provides padding that individual pages also try to add
- The sidebar's "gap div" mechanism isn't working because we're overriding it with CSS

### 3. Current State
- Desktop: Content slides under sidebar because the sidebar is `position: fixed`
- Mobile: Works when using `collapsible="offcanvas"` but breaks desktop
- CSS: Multiple conflicting rules trying to force margins/padding

## MUST DO - Operational Rules

### 1. Sidebar Configuration
- ✅ **MUST** use `collapsible="icon"` for desktop-appropriate behavior
- ✅ **MUST** let Shadcn's built-in gap div handle desktop spacing
- ✅ **MUST** use CSS to override mobile behavior separately

### 2. Layout Structure
- ✅ **MUST** have only ONE container wrapper (in AppShell)
- ✅ **MUST** remove `container mx-auto` from individual pages
- ✅ **MUST** use `SidebarProvider` > `Sidebar` + `SidebarInset` as siblings

### 3. CSS Approach
- ✅ **MUST** work WITH Shadcn's classes, not against them
- ✅ **MUST** use media queries to separate desktop/mobile behavior
- ✅ **MUST** target specific data attributes that Shadcn provides

### 4. Responsive Design
- ✅ **MUST** use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- ✅ **MUST** make headers/buttons stack on mobile with `flex-col sm:flex-row`
- ✅ **MUST** add `w-full sm:w-auto` to buttons in responsive layouts

## NEVER DO - Anti-patterns

### 1. Sidebar Configuration
- ❌ **NEVER** use `collapsible="none"` - it breaks mobile completely
- ❌ **NEVER** use `collapsible="offcanvas"` alone - it breaks desktop spacing
- ❌ **NEVER** mix variant props without understanding their impact

### 2. CSS Overrides
- ❌ **NEVER** use `!important` on structural properties (position, display)
- ❌ **NEVER** override Shadcn's internal width variables directly
- ❌ **NEVER** fight the component's built-in behavior with conflicting CSS

### 3. Layout Structure
- ❌ **NEVER** wrap SidebarInset in additional containers
- ❌ **NEVER** add `container mx-auto` to pages using AppShell
- ❌ **NEVER** use fixed pixel widths for responsive layouts

### 4. Component Usage
- ❌ **NEVER** modify the sidebar component file directly
- ❌ **NEVER** break the expected parent-child relationships
- ❌ **NEVER** assume a prop only affects one screen size

## Correct Implementation

### 1. AppShell Structure
```tsx
<SidebarProvider defaultOpen={true}>
  <Sidebar collapsible="icon" className="app-chrome">
    {/* Sidebar content */}
  </Sidebar>
  
  <SidebarInset>
    <header className="...md:hidden"> {/* Mobile only header */}
      <SidebarTrigger />
    </header>
    
    <div className="px-4 md:px-6 lg:px-8 py-6">
      {children}
    </div>
  </SidebarInset>
</SidebarProvider>
```

### 2. CSS for Mobile Override
```css
/* Let desktop use Shadcn's default behavior */
/* Override only for mobile */
@media (max-width: 767px) {
  [data-sidebar] {
    position: fixed !important;
    transform: translateX(-100%);
  }
  
  [data-state="open"][data-sidebar] {
    transform: translateX(0);
  }
}
```

### 3. Responsive Content
```tsx
/* Headers */
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

/* Buttons */
<Button className="w-full sm:w-auto">

/* Breadcrumbs */
<nav className="flex flex-wrap items-center gap-1.5">
```

## Implementation Checklist

1. [ ] Remove all custom desktop CSS that forces margins/padding
2. [ ] Use `collapsible="icon"` in Sidebar component
3. [ ] Add mobile-only CSS overrides for offcanvas behavior
4. [ ] Remove duplicate containers from all pages
5. [ ] Update all headers/buttons to use responsive classes
6. [ ] Test on both desktop and mobile to ensure proper behavior
7. [ ] Verify sidebar gap div is working on desktop
8. [ ] Ensure mobile sidebar slides out properly

## Expected Behavior

### Desktop (≥768px)
- Sidebar is always visible on the left
- Sidebar takes up 16rem (256px) of space
- Content starts after the sidebar (no overlap)
- No collapse functionality
- No top header bar

### Mobile (<768px)
- Sidebar is hidden by default
- Top header bar with hamburger menu
- Sidebar slides out from left when triggered
- Sidebar overlays content (doesn't push)
- Close button inside sidebar

## Root Cause Summary

The fundamental issue is that we're trying to force Shadcn's sidebar to behave differently than designed. The component already has mechanisms for:
1. Creating space for the sidebar on desktop (gap div)
2. Handling responsive behavior (via collapsible modes)
3. Managing positioning and transitions

Our custom CSS is interfering with these built-in mechanisms, causing the desktop content to ignore the sidebar's presence.
