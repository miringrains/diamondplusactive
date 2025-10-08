# Shadcn Structural Audit Report

## PHASE 1 - AUDIT

### A) Layout & Wrapper Mapping

#### Layouts with Sidebars:

1. **`(dashboard)/layout.tsx`**
   - Root Structure: Uses `AppShell` component
   - Container: None in layout itself (delegated to pages)
   - Z-index/Position: None at layout level
   - Custom widths: None

2. **`admin/layout.tsx`**
   - Root Structure: Uses `AppShell` component  
   - Container: None in layout itself (delegated to pages)
   - Z-index/Position: None at layout level
   - Custom widths: None

3. **`courses/layout.tsx`** ⚠️ VIOLATION
   - Root Structure: Custom sidebar implementation, duplicates AppShell logic
   - Container: None
   - Z-index/Position: None in layout
   - Custom widths: Uses `bg-[#fcfcfd]` hardcoded color

4. **`(auth)/layout.tsx`**
   - No sidebar (auth pages)

5. **Root `layout.tsx`**
   - Base HTML structure only
   - Custom CSS variables in Toaster: `--bg-surface`, `--text-primary`, `--border-default` ⚠️

#### Page Container Usage:

- **Dashboard page**: Uses `PageContent` wrapper (which conditionally uses Container)
- **Courses detail page**: Uses `Container` directly with custom padding
- **Video lesson page**: Uses `PageContent` with `hasCourseSidebar` prop
- **Admin pages**: Mixed usage, some use PageContent, others raw divs

### B) Shadcn Contract Violations

#### 1. Token Violations in `globals.css`:

**Non-standard tokens added:**
- `--canvas` (should use `--background`)
- `--card-subtle`, `--card-hover` (not in shadcn)
- `--text-primary`, `--text-secondary`, `--text-muted` (should use `--foreground`, `--muted-foreground`)
- `--primary-hover`, `--primary-muted`, `--primary-surface` (not standard)
- `--success`, `--warning` (shadcn uses only `--destructive`)
- Custom sidebar tokens with non-standard naming

**Standard tokens modified:**
- `--background`: Changed from default
- `--primary`: Custom color `#15AEE9`
- `--border`: Custom color `#2C2F38`
- Added Porto Rocha custom utilities layer

#### 2. Container Overrides:

- Custom `Container` component at `components/layout/Container.tsx` with:
  - `max-w-screen-2xl` (not standard shadcn container)
  - Custom responsive padding scale
- No global `.container{}` CSS overrides found ✓
- `PageContent` wrapper adds custom padding and conditional logic

#### 3. Duplicate Shells:

- **AppShell** + **courses/layout.tsx** both implement sidebars
- Courses layout duplicates sidebar logic instead of using AppShell
- Multiple wrapper components: PageContent, Container, raw divs

#### 4. Rogue CSS & Positioning:

**In AppShell:**
- Header uses `sticky top-0 z-10` 
- SidebarTrigger uses `-ml-1` negative margin
- Main content lacks container wrapper

**In Components:**
- Sidebar component uses `fixed inset-y-0 z-10` positioning
- Course cards use `absolute` positioning for overlays
- Mixed z-index values: `z-10`, `z-20`, `z-50`

**Custom inline styles:**
- `backgroundColor: '#1a1e25'` in course cards
- `style={{ color: '#2483ff' }}` throughout
- Hardcoded colors bypassing tokens

### C) Fix Plan

#### 1. Canonical Shell Location:
- **Keep**: `components/layout/AppShell.tsx` as the single source of truth
- **Enhance**: Add container wrapper inside main content area

#### 2. Files to Delete/Replace:
- **Delete**: Custom sidebar implementation in `courses/layout.tsx`
- **Replace**: All inline color styles with token classes
- **Remove**: PageContent wrapper (merge logic into AppShell)
- **Consolidate**: Container component into shadcn's container pattern

#### 3. Pages to Re-wrap:
- All dashboard pages to use AppShell's built-in container
- Admin pages to remove custom wrappers
- Course pages to remove Container import
- Video lesson pages to simplify structure

#### 4. Responsive Behavior:
- Can rely on shadcn's sidebar responsive behavior ✓
- Remove custom media query logic in PageContent
- Use shadcn's Sheet component for mobile sidebar

## PHASE 2 - REFACTOR PLAN

### 1. Canonical App Shell Pattern:

```tsx
// Enhanced AppShell.tsx
<SidebarProvider>
  <div className="flex min-h-screen w-full">
    <Sidebar>{/* ... */}</Sidebar>
    <SidebarInset className="flex flex-col">
      <header className="sticky top-0 z-10 border-b">
        <div className="container flex h-14 items-center px-4">
          <SidebarTrigger />
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>
```

### 2. Theme Alignment:

- Restore shadcn token names in globals.css
- Remove Porto Rocha custom tokens
- Map custom tokens to shadcn equivalents:
  - `--canvas` → `--background`
  - `--text-primary` → `--foreground`
  - `--text-muted` → `--muted-foreground`
  - Remove `--success`, `--warning` (use only `--destructive`)

### 3. Page Re-wrap Tasks:

1. Update AppShell to include container in main
2. Remove Container component imports from all pages
3. Replace courses/layout.tsx to use AppShell
4. Remove PageContent wrapper usage
5. Update all inline styles to use CSS variables
6. Standardize z-index values (10, 20, 30, 40, 50)

### 4. Conformance Checks:

- No `.container{}` overrides
- No `position:absolute` on shells
- No negative margins except SidebarTrigger
- All routes using AppShell + built-in container
