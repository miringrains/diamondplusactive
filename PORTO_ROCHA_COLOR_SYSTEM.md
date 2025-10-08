# Porto Rocha Color System v2

## Overview
This document defines the Porto Rocha-inspired color system for the Diamond District platform. The system emphasizes layered depth, clean contrast, and the signature electric cyan accent (#15AEE9).

## Core Philosophy
- **Cards don't sit on backgrounds — they emerge**: Each layer lifts subtly with depth, not noise
- **Electric cyan drives action**: Primary accent used only where it matters
- **Deep, absorbing canvas**: Background layers that create visual hierarchy
- **Clean, intentional contrast**: No muddy grays or ambiguous states

## Color Architecture

### ⬛ Base Layer System

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| Canvas Background | `--canvas` | `#101115` | Deepest background - absorbs light |
| Main Background | `--background` | `#1A1B22` | Main structural background |
| Card Surface | `--card` | `#22242B` | Modals, boxes, forms |
| Subtle Surface | `--card-subtle` | `#2B2D34` | Inner forms, dividers |
| Hover Layer | `--card-hover` | `#32343B` | Hover states for cards |

### 🟦 Accent System

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| Primary Accent | `--primary` | `#15AEE9` | Core action color |
| Accent Hover | `--primary-hover` | `#0D9DD6` | Deeper hover, no glow |
| Accent Muted | `--primary-muted` | `#1E7FAD` | Secondary indicators |
| Accent Surface | `--primary-surface` | `#163C4A` | Filled backgrounds |

### 🔤 Text Hierarchy

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| Primary Text | `--text-primary` | `#F5F7FA` | Main content |
| Secondary Text | `--text-secondary` | `#A9B2BE` | Labels, headers |
| Muted Text | `--text-muted` | `#6C7683` | Metadata, placeholders |
| Inverted Text | `--text-inverted` | `#0F1114` | On light surfaces |

### 🧱 Structural Elements

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| Border Color | `--border` | `#2C2F38` | Thin neutral dividers |
| Input Border | `--input` | `#3A3D45` | Field borders |
| Focus Ring | `--ring` | `#15AEE9` | Focus states |
| Scrollbar | `--scrollbar` | `#33353C` | Custom scrollbars |

### ✅ System Feedback

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| Success | `--success` | `#2FBF71` | Soft green |
| Warning | `--warning` | `#F4AE3B` | Toasted yellow |
| Error | `--destructive` | `#EB5757` | Clean red |

## Implementation Guidelines

### 1. Card Design
- Use `--card` (#22242B) background with 8-12px border radius
- Apply soft inner shadows for depth: `shadow-porto-md`
- Subtle 1px border with `--border` color for definition

### 2. Button Hierarchy
- **Primary buttons**: Background `--primary`, hover `--primary-hover`
- **Secondary buttons**: Transparent with border `--border`
- **Ghost buttons**: Transparent, hover shows `--card-hover`

### 3. Form Inputs
- Background: `--card-subtle`
- Border: `--input`
- Focus: 2px ring with `--ring` color
- Padding: Generous (12px horizontal minimum)

### 4. Elevation System
```css
.shadow-porto-sm { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4); }
.shadow-porto-md { box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.5); }
.shadow-porto-lg { box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.6); }
.shadow-porto-xl { box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.7); }
```

## Utility Classes

### Background Utilities
- `.bg-canvas` - Canvas background
- `.bg-card-subtle` - Subtle card background
- `.bg-card-hover` - Card hover state
- `.bg-primary-hover` - Primary hover color
- `.bg-primary-muted` - Muted primary
- `.bg-primary-surface` - Primary surface

### Text Utilities
- `.text-primary` - Primary text color
- `.text-secondary` - Secondary text color
- `.text-muted` - Muted text color
- `.text-inverted` - Inverted text color

### System Colors
- `.bg-success` / `.text-success`
- `.bg-warning` / `.text-warning`

## Video Player (Plyr) Theme
- Progress bar: `--primary` (#15AEE9)
- Controls: `--text-primary` on hover
- Background: `--canvas` in fullscreen
- Menu: `--card` background

## Best Practices

1. **Never use pure black (#000000)** - Use `--canvas` instead
2. **Primary color is precious** - Use sparingly for key actions
3. **Layer depth intentionally** - Each nested element should be lighter
4. **Maintain contrast** - WCAG AA minimum for all text
5. **Consistent spacing** - Use Tailwind spacing scale

## Migration Notes

From old system to Porto Rocha v2:
- `#1A1B22` (old background) → Still used as `--background`
- `#fbbf24` (old accent/gold) → Replaced with `#15AEE9` (cyan)
- Added new `--canvas` layer below background
- New hover states and muted variants
- Cleaner text hierarchy with 4 levels

## Future Considerations

- Light mode uses inverted values but maintains same hierarchy
- System is designed to support additional accent colors if needed
- Shadow system can be extended for more elevation levels
- Consider adding animation variables for consistent transitions