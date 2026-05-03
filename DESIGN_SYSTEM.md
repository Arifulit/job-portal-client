# 🎨 Job Portal - Professional Design System Guide

## Overview
This is a comprehensive design system guide for the Job Portal project ensuring consistency, accessibility, and professional aesthetics across all pages and components.

---

## 📋 Design Tokens

### Colors

#### Primary Colors (Blue)
- **Primary-50**: `#f0f9ff` - Lightest backgrounds
- **Primary-600**: `#0284c7` - Main CTAs and highlights
- **Primary-700**: `#0369a1` - Hover states
- **Primary-800**: `#075985` - Active states
- **Primary-900**: `#0c3d66` - Dark backgrounds

#### Accent Colors (Purple)
- Used for secondary highlights and gradient text
- Range: `#f5f3ff` to `#4c1d95`

#### Status Colors
- **Success**: `#22c55e` - Approved items
- **Warning**: `#f59e0b` - Pending items
- **Error**: `#ef4444` - Rejected/Error states
- **Info**: Primary colors

#### Neutral/Background
- **Light**: `#ffffff` (backgrounds)
- **Slate-50**: `#f0f7ff` (subtle backgrounds)
- **Slate-100**: `#f1f5f9` (cards, inputs)
- **Slate-900**: `#0f172a` (text)
- **Dark Mode**: `#0f172a` to `#1e293b`

---

## 🔤 Typography

### Font Families
- **Sans**: `Inter` (body text, UI)
- **Display**: `Poppins` (headings)

### Font Sizes & Weights
- **H1**: 3.75rem (60px) - Bold 700
- **H2**: 3rem (48px) - Bold 700
- **H3**: 1.875rem (30px) - Bold 700
- **H4**: 1.5rem (24px) - Bold 700
- **H5**: 1.25rem (20px) - Semibold 600
- **H6**: 1rem (16px) - Semibold 600

- **Body Large**: 1.125rem (18px) - Normal 400
- **Body**: 1rem (16px) - Normal 400
- **Body Small**: 0.875rem (14px) - Normal 400
- **Caption**: 0.75rem (12px) - Medium 500

### Line Heights
- Headings: Tight (1.1)
- Body: Comfortable (1.5)
- Small text: Compact (1.25)

---

## 🎯 Component Styling

### Buttons

#### Primary Button (Most Common)
```
Background: Primary-600
Text: White
Padding: 10px 24px (h-10 px-6)
Border Radius: 8px (rounded-lg)
Font Weight: Semibold
Shadow: md (hover)
Hover: Primary-700 + increased shadow
Active: Primary-800
```

#### Secondary Button
```
Background: Slate-100
Text: Slate-900
Hover: Slate-200
Dark Mode: Slate-800 text
```

#### Outline Button
```
Border: 2px Primary-600
Text: Primary-600
Background: Transparent/White
Hover: Primary-50
```

#### Ghost Button
```
No border, minimal styling
Text: Slate-700
Hover: Slate-100
Use for secondary actions
```

#### Button Sizes
- **SM**: 8px height, 12px padding
- **Default**: 10px height, 24px padding
- **LG**: 12px height, 32px padding
- **XL**: 14px height, 40px padding
- **Icon**: 10x10 square

### Cards

#### Professional Card Style
```
Border: 1px Slate-200
Background: White
Border Radius: 12px (rounded-xl)
Shadow: sm (0 1px 2px)
Hover Shadow: md
Transition: 200ms all ease-in-out
```

#### Card Header
```
Padding: 24px (p-6)
Border Bottom: 1px Slate-200
Typography: Title (bold, larger)
```

#### Card Body
```
Padding: 24px (p-6)
Gap: 16px (space-y-4)
```

### Input Fields

#### Professional Input
```
Height: 40px (h-10)
Padding: 16px (px-4) + 10px (py-2.5)
Border: 2px Slate-200
Border Radius: 8px (rounded-lg)
Font Weight: Medium
Focus: Primary-500 ring with offset
Transition: 200ms all ease-in-out
Dark Mode: Slate-900 background + offset
```

### Badges

#### Badge Styles
- **Default**: Primary-50 background + Primary-700 text + Primary-200 border
- **Success**: Success-50 background + Success-700 text
- **Warning**: Warning-50 background + Warning-700 text
- **Error**: Error-50 background + Error-700 text

```
Padding: 12px 12px (px-3 py-1.5)
Font Size: 12px (text-xs)
Font Weight: Semibold 600
Border Radius: 9999px (rounded-full)
Transition: 200ms all ease-in-out
```

---

## 🎨 Professional Design Patterns

### Job Card
✨ **Features:**
- Status badge + Job type tag (top left)
- Save button (top right)
- Title + Company name
- Location in highlighted chip
- Experience & Deadline in grid layout
- Salary display (if available) in accent box
- "View Details" CTA with arrow animation

### Layout
- **Sections**: Max-width 1280px (max-w-7xl)
- **Padding**: 16px mobile, 24px tablet, 32px desktop
- **Gap**: 24px between sections, 16px inside grids
- **Margins**: Consistent 40px-64px vertical between sections

### Spacing Scale
```
4px   (0.25rem) - xs
8px   (0.5rem)  - sm
12px  (0.75rem) - md
16px  (1rem)    - lg
20px  (1.25rem) - xl
24px  (1.5rem)  - 2xl
32px  (2rem)    - 3xl
40px  (2.5rem)  - 4xl
```

---

## ✨ Animations & Transitions

### Smooth Transitions (200ms)
```
Hover effects, color changes, background shifts
Use: `transition-all duration-200 ease-in-out`
```

### Lift Effect
```
Hover: -0.5rem (translate-y-0.5) upward
Used on: Cards, buttons, interactive elements
```

### Fade In (300ms)
```
Used on: Page loads, modal opens
Use: `animate-fade-in`
```

### Slide Up (300ms)
```
From: 10px down + transparent
To: 0px + visible
Used on: List items, card appearing
Use: `animate-slide-up`
```

### Pulse Glow (2s)
```
Used on: Loading states, pending items
Use: `animate-pulse-glow`
```

---

## 🌙 Dark Mode

### Dark Mode Color Mappings
- **White backgrounds** → `slate-900` (#0f172a)
- **Slate-100** → `slate-800` (#1e293b)
- **Text (slate-900)** → `slate-100` (#f1f5f9)
- **Borders** → `slate-700` (#334155)

### Dark Mode Classes
Use `.dark` prefix for dark mode styling:
```
dark:bg-slate-900
dark:text-slate-100
dark:border-slate-700
```

---

## 🔧 Best Practices

### 1. **Consistency**
- Use defined colors from the color palette
- Use spacing scale strictly (no random values)
- Use typography scale for all text
- Use component variants consistently

### 2. **Accessibility**
- Minimum contrast ratio: 4.5:1 for text
- Focus states: Always visible (ring + offset)
- Icon sizes: Minimum 16px (touch targets 40px+)
- Labels: Always associated with inputs
- Alt text: Descriptive for all images

### 3. **Responsiveness**
- Mobile First approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test on actual devices
- Avoid horizontal scrolling

### 4. **Performance**
- Use Tailwind utilities (pre-built, optimized)
- Optimize images (next/image, lazy loading)
- Minimize animations on mobile
- Use CSS variables for theme colors

### 5. **User Experience**
- Clear visual hierarchy
- Obvious interactive elements
- Meaningful feedback (loading, success, error)
- Consistent navigation
- Fast page loads

---

## 📱 Responsive Design

### Mobile (< 640px)
- Single column layouts
- Full-width cards
- Larger touch targets (40px minimum)
- Simplified navigation (hamburger menu)
- Reduced animations

### Tablet (640px - 1024px)
- Two-column layouts where applicable
- Balanced card sizing
- Standard spacing

### Desktop (> 1024px)
- Multi-column layouts
- Maximum content width 1280px
- Full interactive effects
- Enhanced spacing

---

## 🚀 Implementation Checklist

When creating new pages/components:
- [ ] Use professional card styling
- [ ] Apply correct button variant
- [ ] Use color palette only
- [ ] Follow typography scale
- [ ] Add proper spacing with scale
- [ ] Include hover/focus states
- [ ] Test dark mode
- [ ] Ensure accessibility
- [ ] Test responsiveness
- [ ] Optimize images
- [ ] Add meaningful animations
- [ ] Document custom styles

---

## 📚 Component Examples

### Job Card Component
Location: `src/components/JobCard.tsx`
- Professional layout with badges
- Smooth hover effects
- Salary display
- Save functionality
- Responsive grid

### Button Usage
```
import { Button } from '@/components/ui/button'

// Primary CTA
<Button variant="default" size="lg">Apply Now</Button>

// Secondary action
<Button variant="secondary">Skip</Button>

// Outline style
<Button variant="outline">Learn More</Button>

// Ghost for minimal UI
<Button variant="ghost">Cancel</Button>
```

### Card Usage
```
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Job Title</CardTitle>
    <CardDescription>Company Name</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

---

## 🎯 Design Metrics

- **Load Time**: Target < 3s on 4G
- **Lighthouse**: Target score 90+
- **Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Accessibility**: WCAG 2.1 AA minimum

---

## 📞 Support

For design system updates or clarifications, refer to:
1. Tailwind configuration: `tailwind.config.js`
2. Global styles: `src/index.css`
3. Component library: `src/components/ui/`
4. This guide: Keep updated as design evolves

---

**Last Updated**: 2026-05-02  
**Version**: 1.0  
**Status**: Production Ready ✅
