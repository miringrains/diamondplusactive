# Diamond District Design Tokens Proposal

## Overview

This document proposes a unified, scalable design token system for Diamond District. The goal is to create a single source of truth for all design decisions, improving consistency and maintainability while supporting both light and dark themes.

## Core Principles

1. **Semantic Naming**: Tokens describe purpose, not appearance
2. **Scalable Structure**: Organized by category with clear hierarchy  
3. **Theme Agnostic**: Base tokens that adapt to light/dark themes
4. **Future-Proof**: Room for growth without breaking changes
5. **Developer Friendly**: Easy to use and understand

## Proposed Token Structure

### 1. Color Palette

#### Base Colors (Primitives)
```css
:root {
  /* Neutral Scale - Porto Rocha Grays */
  --color-neutral-50: #F5F7FA;
  --color-neutral-100: #E5E7EB;
  --color-neutral-200: #D1D5DB;
  --color-neutral-300: #A9B2BE;
  --color-neutral-400: #6C7683;
  --color-neutral-500: #4B5563;
  --color-neutral-600: #3A3D45;
  --color-neutral-700: #2C2F38;
  --color-neutral-800: #2B2D34;
  --color-neutral-850: #22242B;
  --color-neutral-900: #1A1B22;
  --color-neutral-950: #101115;
  
  /* Brand Colors - Electric Cyan */
  --color-brand-100: #E5F8FF;
  --color-brand-200: #7FD8F5;
  --color-brand-300: #4DC8ED;
  --color-brand-400: #17ADE9;
  --color-brand-500: #15AEE9; /* Primary */
  --color-brand-600: #0D9DD6;
  --color-brand-700: #0B87BF;
  --color-brand-800: #1E7FAD;
  --color-brand-900: #163C4A;
  
  /* Semantic Colors */
  --color-success-500: #2FBF71;
  --color-success-600: #26A05E;
  --color-warning-500: #F4AE3B;
  --color-warning-600: #E09E2B;
  --color-error-500: #EB5757;
  --color-error-600: #DC4444;
}
```

#### Semantic Color Aliases
```css
:root {
  /* Backgrounds */
  --color-bg-canvas: var(--color-neutral-950);
  --color-bg-base: var(--color-neutral-900);
  --color-bg-surface: var(--color-neutral-850);
  --color-bg-surface-raised: var(--color-neutral-800);
  --color-bg-surface-overlay: var(--color-neutral-800);
  
  /* Foregrounds */
  --color-fg-base: var(--color-neutral-50);
  --color-fg-muted: var(--color-neutral-300);
  --color-fg-subtle: var(--color-neutral-400);
  --color-fg-on-brand: var(--color-neutral-950);
  
  /* Borders */
  --color-border-base: var(--color-neutral-700);
  --color-border-muted: var(--color-neutral-800);
  --color-border-subtle: var(--color-neutral-850);
  
  /* Interactive States */
  --color-brand-base: var(--color-brand-500);
  --color-brand-hover: var(--color-brand-600);
  --color-brand-active: var(--color-brand-700);
  --color-brand-muted: var(--color-brand-800);
  --color-brand-surface: var(--color-brand-900);
  
  /* Focus/Selection */
  --color-focus-ring: var(--color-brand-500);
  --color-selection-bg: var(--color-brand-500);
  --color-selection-fg: var(--color-fg-on-brand);
}

/* Light Theme Overrides */
.light {
  --color-bg-canvas: var(--color-neutral-50);
  --color-bg-base: #FFFFFF;
  --color-bg-surface: #FFFFFF;
  --color-bg-surface-raised: var(--color-neutral-50);
  --color-bg-surface-overlay: #FFFFFF;
  
  --color-fg-base: var(--color-neutral-950);
  --color-fg-muted: var(--color-neutral-400);
  --color-fg-subtle: var(--color-neutral-300);
  --color-fg-on-brand: #FFFFFF;
  
  --color-border-base: var(--color-neutral-200);
  --color-border-muted: var(--color-neutral-100);
  --color-border-subtle: var(--color-neutral-50);
  
  --color-brand-base: var(--color-brand-600);
  --color-brand-hover: var(--color-brand-700);
  --color-brand-active: var(--color-brand-800);
  --color-brand-surface: var(--color-brand-100);
}
```

### 2. Typography Scale

```css
:root {
  /* Font Families */
  --font-family-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  
  /* Font Sizes - T-shirt sizing */
  --font-size-2xs: 0.625rem;   /* 10px */
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2.25rem;    /* 36px */
  --font-size-5xl: 3rem;       /* 48px */
  --font-size-6xl: 3.75rem;    /* 60px */
  --font-size-7xl: 4.5rem;     /* 72px */
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-none: 1;
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* Letter Spacing */
  --letter-spacing-tighter: -0.05em;
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;
}
```

### 3. Spacing Scale

```css
:root {
  /* Base unit: 4px */
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1.5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2.5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3.5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-11: 2.75rem;    /* 44px */
  --space-12: 3rem;       /* 48px */
  --space-14: 3.5rem;     /* 56px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-28: 7rem;       /* 112px */
  --space-32: 8rem;       /* 128px */
  --space-36: 9rem;       /* 144px */
  --space-40: 10rem;      /* 160px */
  --space-44: 11rem;      /* 176px */
  --space-48: 12rem;      /* 192px */
  --space-52: 13rem;      /* 208px */
  --space-56: 14rem;      /* 224px */
  --space-60: 15rem;      /* 240px */
  --space-64: 16rem;      /* 256px */
  --space-72: 18rem;      /* 288px */
  --space-80: 20rem;      /* 320px */
  --space-96: 24rem;      /* 384px */
}
```

### 4. Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.375rem;    /* 6px */
  --radius-base: 0.5rem;    /* 8px */
  --radius-md: 0.625rem;    /* 10px - Default */
  --radius-lg: 0.75rem;     /* 12px */
  --radius-xl: 1rem;        /* 16px */
  --radius-2xl: 1.5rem;     /* 24px */
  --radius-full: 9999px;
}
```

### 5. Shadows

```css
:root {
  /* Elevation Scale */
  --shadow-none: none;
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  
  /* Porto Rocha Dark Shadows */
  --shadow-porto-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
  --shadow-porto-base: 0 4px 8px -2px rgba(0, 0, 0, 0.5);
  --shadow-porto-md: 0 10px 20px -5px rgba(0, 0, 0, 0.6);
  --shadow-porto-lg: 0 20px 30px -10px rgba(0, 0, 0, 0.7);
  
  /* Focus Shadow */
  --shadow-focus: 0 0 0 3px var(--color-brand-base);
}
```

### 6. Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-notification: 80;
  --z-fullscreen: 90;
  --z-max: 100;
}
```

### 7. Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### 8. Motion Tokens

```css
:root {
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-moderate: 300ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
  
  /* Easings */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Prefers Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    --duration-fast: 0ms;
    --duration-base: 0ms;
    --duration-moderate: 0ms;
    --duration-slow: 0ms;
    --duration-slower: 0ms;
  }
}
```

## Token Mapping Table

| Current Value | Token Category | Proposed Token | Notes |
|---------------|----------------|----------------|-------|
| `#101115` | Color | `--color-bg-canvas` | Deepest background |
| `#1A1B22` | Color | `--color-bg-base` | Main background |
| `#22242B` | Color | `--color-bg-surface` | Card background |
| `#15AEE9` | Color | `--color-brand-base` | Primary action color |
| `#3b82f6` | Color | `--color-brand-base` | Consolidate to one primary |
| `#17ADE9` | Color | `--color-brand-base` | Consolidate to one primary |
| `text-sm` | Typography | `--font-size-sm` | 14px |
| `font-medium` | Typography | `--font-weight-medium` | 500 |
| `gap-4` | Spacing | `--space-4` | 16px |
| `p-4` | Spacing | `--space-4` | 16px |
| `rounded-md` | Radius | `--radius-md` | 10px |
| `shadow-xs` | Shadow | `--shadow-xs` | Subtle shadow |
| `z-50` | Z-Index | `--z-modal` | Modal layer |
| `duration-200` | Motion | `--duration-base` | 200ms |

## Implementation Strategy

### Phase 1: Foundation
1. Add all tokens to globals.css
2. Create utility classes for common patterns
3. Document token usage guidelines

### Phase 2: Migration
1. Replace hardcoded values with tokens
2. Update component variants to use tokens
3. Test both light and dark themes

### Phase 3: Enforcement
1. Add linting rules for token usage
2. Create design token documentation
3. Build token visualization tool

## Benefits

1. **Consistency**: Single source of truth for all design decisions
2. **Maintainability**: Change once, update everywhere
3. **Scalability**: Easy to add new tokens or themes
4. **Developer Experience**: Clear, semantic naming
5. **Performance**: CSS variables enable runtime theming
6. **Accessibility**: Centralized contrast ratios and focus states

## Next Steps

1. Review and approve token structure
2. Implement tokens in globals.css
3. Create migration guide for developers
4. Build automated token documentation
5. Establish token governance process
