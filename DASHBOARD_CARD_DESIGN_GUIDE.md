# Dashboard Card Component Design Guide

**Version:** 1.0  
**Last Updated:** November 25, 2025  
**Applies To:** All role-based dashboard components (Principal, Teacher, Student, Parent, Admin)

---

## Table of Contents
1. [Overview](#overview)
2. [Component States](#component-states)
3. [Design Specifications](#design-specifications)
4. [Color Palette](#color-palette)
5. [Typography](#typography)
6. [Spacing & Layout](#spacing--layout)
7. [Animation Guidelines](#animation-guidelines)
8. [Implementation Checklist](#implementation-checklist)
9. [Code Examples](#code-examples)
10. [Accessibility](#accessibility)

---

## Overview

This guide establishes the unified design system for all dashboard card components across the EduTrack application. Every card component must implement **four distinct states**: Loading, Error, Empty, and Default.

### Design Principles
- **Consistency**: All states follow the same structural pattern
- **Visual Hierarchy**: Clear distinction between states through color coding
- **User Feedback**: Immediate visual feedback for all interactions
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsiveness**: Mobile-first, scales to desktop

---

## Component States

### 1. Loading State

**Purpose:** Indicates data is being fetched from the server.

**Visual Characteristics:**
- Animated shimmer gradient overlay
- Dashed border illustration with pulsing icon
- Animated bouncing dots for loading indication
- Decorative dots with staggered pulse animation
- Skeleton placeholders in footer

**Color Theme:** Primary/Blue tones
- Background: `bg-gradient-to-br from-white to-blue-50/30`
- Border: `border-dashed border-primary/30`
- Dots: `bg-primary/40` with pulse animation

**Structure:**
```tsx
<Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-blue-50/30 overflow-hidden relative">
  {/* Animated gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent animate-shimmer" />
  
  <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 relative z-10">
    {/* Icon + Title */}
  </CardHeader>
  
  <CardContent className="px-4 sm:px-6 pb-4 relative z-10">
    <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
      {/* Dashed border illustration */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 backdrop-blur-sm">
          <Icon className="h-10 w-10 text-primary animate-pulse" strokeWidth={2} />
        </div>
      </div>
      
      {/* Loading text with bouncing dots */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 justify-center">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
          <p className="text-sm font-semibold text-foreground">Loading [entity] data</p>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
        </div>
        <p className="text-xs text-muted-foreground max-w-[220px]">Fetching latest information...</p>
      </div>
      
      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:0.2s]" />
        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  </CardContent>
  
  <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-blue-50/30 relative z-10">
    {/* Skeleton placeholders */}
  </CardFooter>
</Card>
```

---

### 2. Error State

**Purpose:** Indicates a failure to load data with retry option.

**Visual Characteristics:**
- Red-themed gradient background
- Dashed border illustration with error icon
- Clear error message
- Retry button (if `onRetry` provided)
- Decorative dots in red

**Color Theme:** Red/Error tones
- Background: `bg-gradient-to-br from-white to-red-50/20`
- Border: `border-dashed border-red-300`
- Dots: `bg-red-300`
- Icon container: `from-red-100 to-red-50`

**Structure:**
```tsx
<Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-red-50/20 overflow-hidden">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
    <div className="flex flex-row items-center gap-2">
      <div className="p-2 rounded-xl bg-red-100">
        <AlertCircle strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
      </div>
      <CardTitle className="text-sm sm:text-base font-bold text-red-900">[Component Name]</CardTitle>
    </div>
  </CardHeader>
  
  <CardContent className="px-4 sm:px-6 pb-4">
    <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
      {/* Error illustration */}
      <div className="relative">
        <div className="absolute inset-0 bg-red-200/50 rounded-full blur-2xl" />
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 border-2 border-dashed border-red-300">
          <AlertCircle className="h-10 w-10 text-red-600" strokeWidth={2} />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-semibold text-red-900">Failed to load [entity]</p>
        <p className="text-xs text-red-700/70 max-w-[220px]">{error}</p>
      </div>
      
      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-2">
        <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
        <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
        <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
      </div>
      
      {/* Retry button */}
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="mt-2 h-9 text-sm font-medium border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-all duration-200"
        >
          <RotateCw className="mr-2 h-4 w-4" /> 
          Retry Loading
        </Button>
      )}
    </div>
  </CardContent>
  
  <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-red-50/30">
    <div className="flex items-baseline gap-2">
      <span className="text-xs sm:text-sm font-medium text-muted-foreground">[Label]:</span>
      <span className="text-2xl font-bold text-slate-900">---</span>
    </div>
    <p className="text-xs text-muted-foreground/70 mt-1">Data unavailable</p>
  </CardFooter>
</Card>
```

---

### 3. Empty State

**Purpose:** Indicates no data exists yet (e.g., 0 records).

**Visual Characteristics:**
- Slate-themed gradient background
- Dashed border illustration with neutral icon
- Helpful guidance message
- Decorative dots in slate
- Call-to-action (optional)

**Color Theme:** Slate/Neutral tones
- Background: `bg-gradient-to-br from-white to-slate-50/50`
- Border: `border-dashed border-slate-300`
- Dots: `bg-slate-300`
- Icon container: `from-slate-100 to-slate-50`

**Structure:**
```tsx
<Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
    <div className="flex flex-row items-center gap-2">
      <div className="p-2 rounded-xl bg-slate-100">
        <Icon strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
      </div>
      <CardTitle className="text-sm sm:text-base font-bold text-slate-900">[Component Name]</CardTitle>
    </div>
  </CardHeader>
  
  <CardContent className="px-4 sm:px-6 pb-4">
    <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
      {/* Empty state illustration */}
      <div className="relative">
        <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-2xl" />
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
          <Icon className="h-10 w-10 text-slate-400" strokeWidth={2} />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">No [entity] yet</p>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          [Helpful guidance message]
        </p>
      </div>
      
      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-2">
        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      </div>
    </div>
  </CardContent>
  
  <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-slate-50/50">
    <div className="flex items-baseline gap-2">
      <span className="text-xs sm:text-sm font-medium text-muted-foreground">[Label]:</span>
      <span className="text-2xl font-bold text-slate-900">0</span>
    </div>
    <p className="text-xs text-muted-foreground/70 mt-1">Ready to add [entity]</p>
  </CardFooter>
</Card>
```

---

### 4. Default State (With Data)

**Purpose:** Displays actual data with rich visualizations.

**Visual Characteristics:**
- Primary-themed gradient background
- Gradient text for main statistics
- Status badges (Active, Excellent, etc.)
- Color-coded stat cards
- Interactive hover effects
- Lists with icons and metadata
- Consistent footer with border-top

**Color Theme:** Primary/Brand tones
- Background: `bg-gradient-to-br from-white via-white to-primary/5`
- Hover: `hover:shadow-md transition-all duration-300`
- Footer: `border-t bg-slate-50/30`

**Structure:**
```tsx
<Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white via-white to-primary/5 overflow-hidden hover:shadow-md transition-all duration-300 group">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
    <div className="flex flex-row items-center gap-2">
      <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
        <Icon strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      </div>
      <CardTitle className="text-sm sm:text-base font-bold text-primary">[Component Name]</CardTitle>
    </div>
    {/* Optional status badge */}
    {condition && (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
        <Sparkles className="h-3 w-3" strokeWidth={2.5} />
        <span className="text-xs font-semibold">Active</span>
      </div>
    )}
  </CardHeader>
  
  <CardContent className="px-4 sm:px-6 pb-4">
    {/* Main stat with gradient */}
    <div className="mb-4">
      <div className="flex items-baseline gap-2">
        <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {mainValue}
        </div>
        {/* Optional indicator */}
      </div>
      <p className="text-xs text-muted-foreground mt-1">[Description]</p>
    </div>

    {/* Optional: Stats grid, lists, charts */}
    {hasAdditionalData && (
      <div className="space-y-4">
        {/* Color-coded stat cards */}
        {/* Lists with hover effects */}
        {/* Distribution charts */}
      </div>
    )}
  </CardContent>
  
  <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-slate-50/30">
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">[Label]</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-bold text-primary">{value}</span>
          <span className="text-xs font-medium text-muted-foreground">[unit]</span>
        </div>
      </div>
      <div className="p-2 rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
      </div>
    </div>
  </CardFooter>
</Card>
```

---

## Design Specifications

### Card Container
- **Border Radius:** `rounded-2xl` (1rem)
- **Shadow:** `shadow-sm` (default), `hover:shadow-md` (on hover)
- **Border:** `border-none` (no visible border)
- **Overflow:** `overflow-hidden` (for gradient effects)

### Content Height
- **Fixed Height:** `h-[180px]` for content area
- **Ensures:** Consistent card heights across all states

### Icon Sizes
- **Header Icon:** `h-4 w-4 sm:h-5 sm:w-5`
- **Main Illustration Icon:** `h-10 w-10`
- **Footer Icon:** `h-5 w-5`
- **List Item Icon:** `h-3 w-3`

### Decorative Dots
- **Size:** `h-1.5 w-1.5`
- **Shape:** `rounded-full`
- **Spacing:** `gap-1.5`
- **Count:** Always 3 dots

---

## Color Palette

### State-Specific Colors

#### Loading State (Blue/Primary)
```css
Background: from-white to-blue-50/30
Overlay: via-blue-100/20
Border: border-primary/30
Icon: text-primary
Dots: bg-primary/40
Footer: bg-blue-50/30
```

#### Error State (Red)
```css
Background: from-white to-red-50/20
Border: border-red-300
Icon Container: from-red-100 to-red-50
Icon: text-red-600
Text: text-red-900, text-red-700/70
Dots: bg-red-300
Button: border-red-200 text-red-700
Footer: bg-red-50/30
```

#### Empty State (Slate)
```css
Background: from-white to-slate-50/50
Border: border-slate-300
Icon Container: from-slate-100 to-slate-50
Icon: text-slate-400, text-slate-600
Text: text-slate-700, text-slate-900
Dots: bg-slate-300
Footer: bg-slate-50/50
```

#### Default State (Primary)
```css
Background: from-white via-white to-primary/5
Icon Container: from-primary/10 to-primary/5
Hover: from-primary/20 to-primary/10
Text Gradient: from-primary to-primary/60
Footer: bg-slate-50/30
```

### Stat Card Colors
- **Blue:** `from-blue-50 to-blue-100/50 border-blue-200/50`
- **Green:** `from-green-50 to-green-100/50 border-green-200/50`
- **Purple:** `from-purple-50 to-purple-100/50 border-purple-200/50`
- **Orange:** `from-orange-50 to-orange-100/50 border-orange-200/50`
- **Red:** `from-red-50 to-red-100/50 border-red-200/50`
- **Yellow:** `from-yellow-50 to-yellow-100/50 border-yellow-200/50`

---

## Typography

### Font Weights
- **Title:** `font-bold` (700)
- **Semibold:** `font-semibold` (600)
- **Medium:** `font-medium` (500)
- **Regular:** Default (400)

### Font Sizes
- **Main Stat:** `text-4xl sm:text-5xl` (2.25rem / 3rem)
- **Footer Stat:** `text-2xl` (1.5rem)
- **Title:** `text-sm sm:text-base` (0.875rem / 1rem)
- **Body:** `text-sm` (0.875rem)
- **Caption:** `text-xs` (0.75rem)
- **Micro:** `text-[10px]` (0.625rem)

### Text Colors
- **Primary:** `text-primary`
- **Foreground:** `text-foreground`
- **Muted:** `text-muted-foreground`
- **Muted Light:** `text-muted-foreground/70`

---

## Spacing & Layout

### Padding
- **Header:** `px-4 sm:px-6 pt-4 sm:pt-6 pb-3`
- **Content:** `px-4 sm:px-6 pb-4`
- **Footer:** `px-4 sm:px-6 pb-4 sm:pb-6 pt-3`

### Gaps
- **Header Items:** `gap-2`
- **Content Sections:** `gap-4`
- **List Items:** `gap-1.5` or `gap-2`
- **Decorative Dots:** `gap-1.5`

### Responsive Breakpoints
- **Mobile:** Default (< 640px)
- **Tablet:** `sm:` (≥ 640px)
- **Desktop:** `md:` (≥ 768px), `lg:` (≥ 1024px)

---

## Animation Guidelines

### Shimmer Effect
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}
```

### Pulse Animation
- **Built-in:** `animate-pulse`
- **Usage:** Loading icons, skeleton placeholders, decorative dots
- **Staggered:** Use `[animation-delay:0.2s]`, `[animation-delay:0.4s]`

### Bounce Animation
- **Built-in:** `animate-bounce`
- **Usage:** Loading text indicators
- **Staggered:** Use `[animation-delay:0.2s]`

### Hover Transitions
- **Duration:** `transition-all duration-200` or `duration-300`
- **Properties:** `shadow`, `background`, `border`, `transform`

---

## Implementation Checklist

When creating or updating a dashboard card component:

### ✅ Structure
- [ ] Implements all 4 states (Loading, Error, Empty, Default)
- [ ] Uses consistent Card, CardHeader, CardContent, CardFooter structure
- [ ] Fixed content height of `h-[180px]`
- [ ] Proper z-index layering for overlays

### ✅ Visual Design
- [ ] Correct color theme for each state
- [ ] Dashed border illustration in all non-default states
- [ ] Three decorative dots in all states
- [ ] Gradient backgrounds applied correctly
- [ ] Icons sized appropriately

### ✅ Typography
- [ ] Consistent font sizes and weights
- [ ] Proper text color hierarchy
- [ ] Responsive text sizing (mobile to desktop)

### ✅ Spacing
- [ ] Consistent padding (px-4 sm:px-6)
- [ ] Proper gaps between elements
- [ ] Border-top on footer

### ✅ Interactivity
- [ ] Hover effects on default state
- [ ] Retry button in error state (if applicable)
- [ ] Smooth transitions (200-300ms)

### ✅ Accessibility
- [ ] Semantic HTML structure
- [ ] Proper ARIA labels
- [ ] Keyboard navigation support
- [ ] Color contrast meets WCAG AA

### ✅ Responsiveness
- [ ] Mobile-first approach
- [ ] Breakpoint adjustments (sm:, md:, lg:)
- [ ] Text truncation for long content
- [ ] Touch-friendly tap targets (min 44x44px)

---

## Code Examples

### Example: Total Classes Card Props
```typescript
export interface TotalClassesCardProps {
  totalClasses: number;
  activeClasses?: number;
  averageStudentsPerClass?: number;
  gradeDistribution?: Array<{ grade: string; count: number }>;
  recentClasses?: Array<{
    id: string;
    name: string;
    grade: string | null;
    section: string | null;
    createdAt: string;
    activeStudents: number;
  }>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}
```

### Example: Conditional Rendering
```typescript
export function DashboardCard({ data, isLoading, error, onRetry }: Props) {
  // 1. Loading state
  if (isLoading) {
    return <LoadingState />
  }

  // 2. Error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  // 3. Empty state
  if (data === 0 || !data) {
    return <EmptyState />
  }

  // 4. Default state with data
  return <DefaultState data={data} />
}
```

### Example: Stat Card Component
```tsx
<div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
  <div className="flex items-center gap-2 mb-1">
    <div className="p-1 rounded-md bg-blue-200/50">
      <Icon className="h-3 w-3 text-blue-700" strokeWidth={2.5} />
    </div>
    <p className="text-[10px] font-semibold text-blue-900 uppercase tracking-wide">Label</p>
  </div>
  <p className="text-xl font-bold text-blue-900">{value}</p>
</div>
```

### Example: List Item Component
```tsx
<div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/item">
  <div className="flex items-center gap-2 flex-1 min-w-0">
    <div className="p-1 rounded-md bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
      <Icon className="h-3 w-3 text-primary" strokeWidth={2.5} />
    </div>
    <span className="text-xs font-medium text-slate-900 truncate">
      {item.name}
    </span>
  </div>
  <Badge>{item.value}</Badge>
</div>
```

---

## Accessibility

### Semantic HTML
- Use proper heading hierarchy (`<h1>`, `<h2>`, etc.)
- Use `<button>` for interactive elements
- Use `<nav>` for navigation components

### ARIA Labels
```tsx
<Button aria-label="Retry loading data" onClick={onRetry}>
  <RotateCw className="mr-2 h-4 w-4" />
  Retry Loading
</Button>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicators
- Logical tab order

### Color Contrast
- **Normal Text:** Minimum 4.5:1 contrast ratio
- **Large Text:** Minimum 3:1 contrast ratio
- **UI Components:** Minimum 3:1 contrast ratio

### Screen Reader Support
- Descriptive text for loading states
- Clear error messages
- Meaningful empty state guidance

---

## Best Practices

### Do's ✅
- Always implement all 4 states
- Use consistent spacing and sizing
- Follow the color palette strictly
- Add hover effects for interactivity
- Provide helpful error messages
- Include retry functionality for errors
- Use semantic HTML
- Test on multiple screen sizes
- Ensure keyboard accessibility

### Don'ts ❌
- Don't skip any of the 4 states
- Don't use custom colors outside the palette
- Don't hardcode sizes (use Tailwind classes)
- Don't forget responsive breakpoints
- Don't use inline styles (except for dynamic animations)
- Don't ignore accessibility requirements
- Don't create inconsistent layouts
- Don't use different icon sizes across states

---

## Version History

### v1.0 (November 25, 2025)
- Initial design guide created
- Established 4-state pattern
- Defined color palette and typography
- Added implementation checklist
- Included code examples

---

## Maintenance

This design guide should be updated when:
- New component patterns are established
- Color palette is modified
- Typography system changes
- New accessibility requirements emerge
- Framework or library updates affect implementation

**Maintained by:** Frontend Development Team  
**Review Cycle:** Quarterly  
**Last Review:** November 25, 2025

---

## Related Documentation
- [Dashboard Architecture](./DASHBOARD_ARCHITECTURE.md)
- [Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md)
- [Component Library](./src/components/README.md)
- [Tailwind Configuration](./tailwind.config.ts)

---

**End of Design Guide**
