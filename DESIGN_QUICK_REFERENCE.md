# 📚 Professional Design - Quick Reference

## 🎯 Quick Design Guide

### Color Usage
```
Primary Actions → Primary-600 (#0284c7)
Secondary Actions → Slate-100
Links → Primary-600
Success → Success-600 (#22c55e)
Warning → Warning-600 (#f59e0b)
Error → Error-600 (#ef4444)
Text → Slate-900 (dark: Slate-100)
Borders → Slate-200 (dark: Slate-700)
```

### Button Quick Reference
```tsx
// Primary CTA - Most common
<Button variant="default" size="lg">Apply Now</Button>

// Alternative action
<Button variant="outline">Learn More</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Minimal action
<Button variant="ghost">Skip</Button>

// With loading state
<Button isLoading>Submitting...</Button>

// Size variants
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Card Template
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### Badge Quick Reference
```tsx
<Badge variant="default">Primary</Badge>
<Badge variant="success">Approved</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Rejected</Badge>
<Badge variant="outline">Neutral</Badge>
```

### Form Example
```tsx
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="name@example.com" {...field} />
        </FormControl>
        <FormDescription>We'll never share your email.</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### Spacing Quick Reference
```
xs:  4px  (gap-1)
sm:  8px  (gap-2)
md:  12px (gap-3)
lg:  16px (gap-4)
xl:  20px (gap-5)
2xl: 24px (gap-6)
3xl: 32px (gap-8)
4xl: 40px (gap-10)
```

### Typography Quick Reference
```tsx
<h1>Page Title (60px)</h1>
<h2>Section Title (48px)</h2>
<h3>Subsection (30px)</h3>
<h4>Card Title (24px)</h4>
<p>Body Text (16px)</p>
<span className="text-sm">Small Text (14px)</span>
<span className="text-xs">Caption (12px)</span>
```

### Dark Mode Support
```tsx
// Auto-applied with className
className="bg-white dark:bg-slate-900"
className="text-slate-900 dark:text-slate-100"
className="border-slate-200 dark:border-slate-700"

// All components have built-in dark mode
// Just add to parent: <div className="dark">
```

### Common Tailwind Classes
```
Padding: p-4, px-4, py-2
Margin: m-4, mx-auto, mb-6
Gap: gap-4, gap-x-2, gap-y-4
Rounded: rounded-lg, rounded-xl, rounded-full
Shadow: shadow-sm, shadow-md, shadow-lg
Hover: hover:bg-primary-50, hover:shadow-md
Focus: focus:ring-2, focus:ring-primary-500
Responsive: md:grid md:grid-cols-2, lg:flex
```

### Animation Classes
```
Fade In: animate-fade-in
Slide Up: animate-slide-up
Slide Down: animate-slide-down
Pulse: animate-pulse-glow
Spin: animate-spin-slow
```

---

## ✅ Do's and Don'ts

### ✅ DO
- Use component variants (btn-primary, badge-success)
- Use color tokens (primary-600, success-600)
- Use spacing scale (p-4, gap-6, m-8)
- Test in dark mode
- Use Lucide icons
- Apply animations smoothly
- Check accessibility

### ❌ DON'T
- Hard-code colors (#0284c7)
- Create custom button styles
- Use random spacing values
- Forget dark mode
- Ignore focus states
- Over-animate elements
- Skip accessibility checks

---

## 🚀 Common Patterns

### Hero Section
```tsx
<section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
  <div className="max-w-7xl mx-auto px-4">
    <h1>Your Title Here</h1>
    <p className="text-lg opacity-90">Description</p>
    <Button className="mt-8" size="lg">Get Started</Button>
  </div>
</section>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id}>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>
```

### Feature List
```tsx
<div className="space-y-4">
  {features.map(feature => (
    <div key={feature} className="flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-success-600" />
      <span>{feature}</span>
    </div>
  ))}
</div>
```

### Status Badge
```tsx
{status === 'approved' && <Badge variant="success">Approved</Badge>}
{status === 'pending' && <Badge variant="warning">Pending</Badge>}
{status === 'rejected' && <Badge variant="error">Rejected</Badge>}
```

---

## 🎨 Professional Design Checklist

Before shipping any page/component:

- [ ] Colors match palette
- [ ] Typography follows scale
- [ ] Spacing is consistent
- [ ] Dark mode works
- [ ] Responsive on mobile/tablet/desktop
- [ ] Focus states are visible
- [ ] Animations are smooth
- [ ] Images are optimized
- [ ] Loading states exist
- [ ] Error states styled
- [ ] Success messages shown
- [ ] Icons are from Lucide
- [ ] Accessibility tested
- [ ] Lighthouse score 90+

---

## 📱 Responsive Grid System

```tsx
// Mobile First
<div className="grid grid-cols-1 gap-4">
  
// Tablet (640px)
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

// Desktop (1024px)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Large Desktop (1280px)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
```

---

## 🔗 Resource Links

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **Design System**: See `DESIGN_SYSTEM.md`
- **Improvements**: See `DESIGN_IMPROVEMENTS.md`
- **Colors**: Check `tailwind.config.js`

---

**Keep this guide handy for consistent, professional design!**

Last Updated: May 2, 2026
