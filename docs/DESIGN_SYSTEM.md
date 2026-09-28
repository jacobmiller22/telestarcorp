# Telestar Corporation Design System & Brand Specification

This document codifies the design tokens, visual hierarchy, layout architecture, and accessibility standards for the Telestar Corporation platform (`@telestarcorp/web`).

---

## 1. Brand Color Hierarchy & Tokens

The authentic Telestar brand identity is anchored by **Cerulean Cyan** and **Slate Charcoal**, extracted directly from historical brand assets (`logo.png`). The colors are codified as Tailwind CSS v4 `@theme` properties in `apps/web/src/styles/global.css`:

```css
@theme {
  --color-brand-cyan: #008cb8;
  --color-brand-cyan-dark: #006d91;
  --color-brand-cyan-light: #e6f4f8;
  --color-brand-charcoal: #505050;
  --color-brand-navy: #0f1c2e;
  --color-brand-accent: #00a4d6;
}
```

### Color Palette Specification

| Token | CSS Variable | Hex | Role & Usage | WCAG AA on White |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Cyan** | `--color-brand-cyan` | `#008CB8` | Primary logo accent, graphical icons, UI borders, pulse dots | 3.86:1 (UI / Graphics) |
| **Brand Cyan Dark** | `--color-brand-cyan-dark` | `#006D91` | Primary text links, interactive button backgrounds, accessible headings | **5.84:1 (Pass AA)** |
| **Brand Cyan Light** | `--color-brand-cyan-light` | `#E6F4F8` | Soft background pills, feature badge cards, tint fills | Decorative / Background |
| **Brand Charcoal** | `--color-brand-charcoal` | `#505050` | Authentic secondary brand neutral, dark typography | **8.06:1 (Pass AA)** |
| **Brand Navy** | `--color-brand-navy` | `#0F1C2E` | Deep hero gradients, footer cards, high-contrast dark surfaces | **17.13:1 (Pass AA)** |
| **Brand Accent** | `--color-brand-accent` | `#00A4D6` | Hover accents on dark backgrounds, active breadcrumbs | Decorative / Dark Mode |

---

## 2. Desktop Navigation Layout Architecture

### The Asymmetric Drift Problem
In earlier iterations, the desktop header used a 3-element `flex justify-between` layout:
1. Left: Logo (~150px)
2. Center: `<nav>`
3. Right: Contact Phone, Login & Consultation buttons (~380px)

Because the left and right containers had unequal widths (150px vs 380px), the center navigation links drifted visibly off-center by ~115px.

### The 2-Column Unified Navigation Solution
In `apps/web/src/layouts/Layout.astro`, the header is realigned to a clean 2-column layout:
- **Left Column**: Brand Logo (`/assets/logo.png`).
- **Right Column**: A unified flex cluster grouping primary navigation links (`Home`, `Solutions`, `Testimonials`, `Get Apps`, `Contact`), a vertical divider (`h-5 w-px bg-slate-200`), and primary action buttons (`(804) 930-8400`, `Customer Login`, `Schedule Consultation`).

```html
<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-20">
      <!-- Column 1: Logo -->
      <div class="flex-shrink-0 flex items-center">
        <a href="/"><img src="/assets/logo.png" alt="Telestar Corporation" class="h-10 w-auto" /></a>
      </div>

      <!-- Column 2: Unified Nav + Action Cluster -->
      <div class="hidden md:flex items-center gap-6 lg:gap-8">
        <nav class="flex items-center space-x-6 lg:space-x-8">
          <!-- Links -->
        </nav>
        <span class="hidden xl:inline-block h-5 w-px bg-slate-200"></span>
        <div class="flex items-center space-x-3 lg:space-x-4">
          <!-- Actions & CTAs -->
        </div>
      </div>
    </div>
  </div>
</header>
```

---

## 3. WCAG 2.1 Level AA Accessibility Standards

All interactive elements and body typography must meet WCAG 2.1 Level AA contrast requirements:
1. **Body Text & Text Links**: Minimum 4.5:1 contrast against background surface.
   - Text on white: Use `text-brand-cyan-dark` (`#006d91`, 5.84:1) or `text-slate-700` / `text-slate-900`.
   - Text on dark surfaces: Use `text-white` or `text-brand-accent` (`#00a4d6`).
2. **Interactive Buttons**:
   - Primary: `bg-brand-cyan-dark text-white` (5.84:1) or `bg-brand-cyan hover:bg-brand-cyan-dark`.
   - Secondary Outline: `border-brand-cyan/30 text-brand-cyan-dark hover:bg-brand-cyan-light`.
3. **Automated Verification**:
   - Run `pnpm run check:tokens` to execute `scripts/verify-design-tokens.ts` and validate contrast ratios and codebase hygiene.

---

## 4. Component Token Usage Matrix

| Component | Element | Semantic Utility Class | Token |
| :--- | :--- | :--- | :--- |
| `Layout.astro` | Nav link hover | `hover:text-brand-cyan-dark` | `--color-brand-cyan-dark` |
| `Layout.astro` | Login button | `text-brand-cyan-dark border-brand-cyan/30 hover:bg-brand-cyan-light` | Cyan dark / light |
| `Layout.astro` | Consultation button | `bg-brand-cyan hover:bg-brand-cyan-dark` | Brand Cyan / Dark |
| `Hero.astro` | Tagline pill | `bg-brand-cyan-light text-brand-cyan-dark` | Cyan light / dark |
| `Hero.astro` | Main CTA | `bg-brand-cyan hover:bg-brand-cyan-dark text-white` | Brand Cyan |
| `Features.astro` | Category badge | `bg-brand-cyan-light text-brand-cyan-dark` | Cyan light / dark |
| `Features.astro` | Subtitle | `text-brand-cyan-dark` | Cyan dark |
| `Testimonials.astro`| Proof point numbers | `text-brand-cyan-dark` | Cyan dark |
| `ContactCta.astro` | Section background | `bg-gradient-to-br from-brand-cyan-dark via-brand-navy to-slate-950` | Cyan dark / Navy |
| `contact.astro` | Channel icons | `bg-brand-cyan-light text-brand-cyan-dark` | Cyan light / dark |
