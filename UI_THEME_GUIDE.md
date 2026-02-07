# 🎨 Bakingo UI Theme Refactoring Guide

## Overview
The PurblePalace website has been refactored to match a modern, clean design system. This guide explains the new theme and how to maintain consistency across the application.

## Color Palette

### Primary Colors
- **Pink/Magenta** - `#E91E63` (Main brand color)
  - Dark variant: `#C2185B` (hover states)
  - Light variant: `#F06292` (secondary elements)
  - Background: `#FFC0CB` (light pink backgrounds)

### Secondary Colors
- **Gold/Yellow** - `#FFC107` (Accents)
  - Dark variant: `#F57F17` (hover)
  - Light variant: `#FFD54F` (background)

### Status Colors
- **Success** - `#10B981` (Delivered, approved)
- **Warning** - `#F59E0B` (Pending, caution)
- **Danger** - `#EF4444` (Cancelled, rejected)
- **Info** - `#3B82F6` (Informational)

### Neutral Colors
- **Gray 900** - `#1F2937` (Primary text)
- **Gray 800** - `#2F3E4F` (Secondary text)
- **Gray 600** - `#4B5563` (Tertiary text)
- **Gray 400** - `#9CA3AF` (Disabled, muted)
- **Gray 200** - `#E5E7EB` (Borders)
- **Gray 100** - `#F3F4F6` (Light backgrounds)
- **White** - `#FFFFFF` (Card backgrounds)

## Design System

### Spacing
- Use Tailwind's default spacing scale
- Prefer larger gaps between sections (gap-6, gap-8)
- Use p-6 for card padding, p-4 for compact cards

### Border Radius
- **Small buttons/inputs** - `rounded-md` (8px)
- **Cards/Containers** - `rounded-lg` or `rounded-xl` (12px-16px)
- **Badges/Pills** - `rounded-full`

### Shadows
- **Cards at rest** - `shadow-sm`
- **Cards on hover** - `shadow-md` or `shadow-lg`
- **Elevated modals** - `shadow-xl`

### Typography
- **Headings** - Font weight 600 (semibold)
- **Body text** - Font weight 400 (regular)
- **UI labels** - Font weight 500-600 (medium/semibold)
- **Emphasized text** - Font weight 700 (bold)

## Component Patterns

### KPI Cards (Dashboard)
```tsx
<div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border-l-4 border-pink-600 hover:border-pink-700 group">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Label</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">Value</p>
      <p className="text-green-600 text-sm mt-3 font-semibold">↑ Trend</p>
    </div>
    <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
      <Icon className="w-6 h-6 text-pink-600" />
    </div>
  </div>
</div>
```

### Data Tables
```tsx
<table className="w-full border-collapse">
  <thead className="bg-gray-50 border-b-2 border-gray-200">
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Header</th>
  </thead>
  <tbody>
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">Cell</td>
    </tr>
  </tbody>
</table>
```

### Buttons
```tsx
// Primary Button
<button className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-pink-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0">
  Button Text
</button>

// Secondary Button
<button className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-600">
  Button Text
</button>

// Outline Button
<button className="border-2 border-pink-600 text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 hover:text-white transition-all">
  Button Text
</button>
```

### Badges
```tsx
<span className="inline-block px-4 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">
  Badge Text
</span>
```

### Form Inputs
```tsx
<input 
  type="text"
  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-pink-600 focus:ring-2 focus:ring-pink-200 focus:outline-none"
  placeholder="Enter text..."
/>
```

## Interactions

### Hover States
- Cards: Add shadow and slightly lift (`hover:-translate-y-1`)
- Buttons: Change background color and add shadow
- Links: Change text color to pink
- Icons in cards: Change background color

### Focus States
- Inputs: Pink border + pink ring with 20% opacity
- Buttons: Visible focus ring
- Links: Underline or color change

### Active/Loading States
- Buttons: Remove lift effect on click (`active:translate-y-0`)
- Loading spinners: Use pink color

## Responsive Design

### Breakpoints (Tailwind defaults)
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Grid Layouts
- **Dashboard Cards** - `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Product Grid** - `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- **Two Column** - `grid-cols-1 lg:grid-cols-2`

## Files Updated

1. **globals.css** - Added Bakingo theme variables and utilities
2. **tailwind.config.ts** - Added Bakingo colors to Tailwind config
3. **src/styles/bakingo-theme.css** - Comprehensive theme stylesheet
4. **Admin Dashboard** (admin/page.tsx) - Updated KPI cards and styling
5. **Vendor Dashboard** (vendor/page.tsx) - Updated stats cards and styling

## Implementation Steps

### For New Components
1. Use pink (`#E91E63`) as primary color
2. Use rounded corners (12px minimum)
3. Add subtle shadows (`shadow-sm`)
4. Add hover effects with transitions
5. Use proper spacing (gap-4, gap-6)
6. Follow typography guidelines

### For Existing Components
1. Replace old colors with Bakingo palette
2. Update border-radius to match design
3. Add transitions on interactive elements
4. Update text colors to match hierarchy
5. Ensure proper contrast ratios (WCAG AA)

## Usage in Components

### Tailwind Classes
```tsx
// Primary action
className="bg-pink-600 hover:bg-pink-700"

// Secondary action
className="bg-yellow-500 hover:bg-yellow-600"

// Status indicators
className="bg-green-100 text-green-700"  // Success
className="bg-yellow-100 text-yellow-700"  // Warning
className="bg-red-100 text-red-700"  // Error

// Text colors
className="text-gray-900"  // Primary text
className="text-gray-600"  // Secondary text
className="text-pink-600"  // Accent text
```

### CSS Variables
```css
var(--color-bakingo-primary)        /* #E91E63 */
var(--color-bakingo-primary-dark)   /* #C2185B */
var(--color-bakingo-primary-light)  /* #F06292 */
var(--color-bakingo-secondary)      /* #FFC107 */
var(--color-success)                /* #10B981 */
var(--color-warning)                /* #F59E0B */
var(--color-danger)                 /* #EF4444 */
```

## Animation Standards

### Transitions
- Default: `transition-all duration-300`
- Quick: `transition-all duration-150`
- Slow: `transition-all duration-500`

### Common Patterns
```tsx
// Hover lift effect
className="transition-all hover:-translate-y-1 hover:shadow-lg"

// Smooth color change
className="transition-colors hover:text-pink-600"

// Scale effect
className="transition-transform hover:scale-105"
```

## Accessibility Guidelines

1. **Color Contrast**
   - Pink text on white: ✓ WCAG AA
   - White text on pink: ✓ WCAG AA
   - Gray text on white: ✓ WCAG AA

2. **Focus Indicators**
   - Always visible
   - Use pink for consistency
   - Minimum 2px ring

3. **Icon Colors**
   - Never rely on color alone
   - Pair with text labels when possible

## Future Enhancements

- [ ] Dark mode theme
- [ ] Custom gradient backgrounds
- [ ] Animated background patterns
- [ ] Advanced micro-interactions
- [ ] AI-powered color suggestions

## Maintenance

- Update color palette in one place (globals.css)
- Test responsive design on multiple devices
- Ensure accessibility on all updates
- Keep animations performant (use transform, opacity)
- Document any custom utilities

---

**Theme Version**: 1.0  
**Last Updated**: January 2026
