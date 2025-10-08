# PR: Shadcn structural conformance: canonical shell + page re-wrap

## Branch: `feat/ui-shell-unify`

## Summary

This PR enforces shadcn structural conformance across the Diamond District LMS by implementing a canonical app shell pattern and removing all custom layout overrides. All changes are limited to the UI layer - no data models, APIs, or authentication logic were modified.

## Changes

### 1. Enhanced AppShell Component
- Added container wrapper in main content area with responsive padding
- Pattern: `<div className="container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">`
- All pages now inherit consistent width constraints without custom wrappers

### 2. Theme Token Restoration
- Removed Porto Rocha custom tokens and utilities from `globals.css`
- Restored standard shadcn token names:
  - `--canvas` → `--background`
  - `--text-primary` → `--foreground`
  - `--text-muted` → `--muted-foreground`
- Fixed Toaster component to use standard tokens

### 3. Layout Consolidation
- Replaced `courses/layout.tsx` custom sidebar with AppShell
- All layouts now use the same unified shell component
- Eliminated 170+ lines of duplicate sidebar code

### 4. Page Simplification
- Dashboard: Removed PageContent/PageHeader/PageSection wrappers
- Courses: Removed Container import and usage
- All pages now use simple divs, relying on AppShell's container

### 5. Inline Style Removal
- Replaced all hardcoded colors with CSS variable classes
- Examples: `style={{ color: '#2483ff' }}` → `className="text-primary"`
- Fixed duplicate className attributes

## Conformance Verification

✓ **No `.container{}` global overrides**
```bash
grep -r "\.container\s*{" src/**/*.css  # No matches
```

✓ **No `position:absolute` on page shells**
```bash
grep -r "position:\s*absolute" src/app/**/layout.tsx  # No matches
```

✓ **No negative margins except SidebarTrigger**
```bash
grep -r "-ml-|-mr-" src/**/*.tsx  # Only SidebarTrigger -ml-1
```

✓ **All routes using canonical AppShell + container**
- Dashboard, Admin, Courses all use unified pattern

## Files Changed

- `src/components/layout/AppShell.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/courses/layout.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/courses/[slug]/page.tsx`

## Testing Notes

1. Verify sidebar never overlaps content at any breakpoint
2. Check that all content respects container width on wide screens
3. Confirm video pages have no horizontal scroll
4. Test dark/light theme token inheritance

## Rollback

If issues arise, revert to previous commit before these changes. The Container and PageContent components were preserved for backward compatibility if needed.
