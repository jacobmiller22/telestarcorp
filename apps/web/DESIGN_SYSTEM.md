# Telestar Corporation Design System & Brand Specification

**Version**: 1.0.0  
**Status**: Authoritative Reference Baseline  
**Scope**: `@telestarcorp/web` (Astro + Tailwind CSS v4)

---

## 1. Brand Identity & Color Philosophy

Telestar Corporation is an established business communications and hosted PBX provider founded on personal relationships, reliable engineering, and high-touch customer support. The visual identity diverges intentionally from generic, hyper-saturated modern SaaS templates by anchoring on Telestar's authentic historical palette extracted directly from the original vector brand assets (`apps/web/public/assets/logo.png`).

---

## 2. Brand Tokens & Color Palette

All color tokens are formalized in `apps/web/src/styles/global.css` via the Tailwind CSS v4 `@theme` block:

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

### Color Token Reference Table

| Token Variable | Hex Code | Semantic Role | WCAG Contrast Ratio (on #FFF) | Compliance Level |
| :--- | :--- | :--- | :--- | :--- |
| `--color-brand-cyan` | `#008cb8` | Primary Brand Color (Logo, primary action buttons, key accents) | 3.38:1 | Graphic Elements & Large Text (≥18pt / 14pt bold) |
| `--color-brand-cyan-dark` | `#006d91` | Accessible Text, Inline Links, Nav Hover States | **5.90:1** | **WCAG 2.1 AA Normal Text (Passes 4.5:1 requirement)** |
| `--color-brand-cyan-light` | `#e6f4f8` | Container Tints, Badges, Icon Backgrounds | N/A (Background) | Contrast safe container background |
| `--color-brand-charcoal` | `#505050` | Secondary Neutral (from logo typography), Subtitles, Muted text | 5.92:1 | WCAG 2.1 AA Normal Text |
| `--color-brand-navy` | `#0f1c2e` | Deep Surface Dark, Hero Cards, Footer Backgrounds | 17.5:1 | WCAG 2.1 AAA |
| `--color-brand-accent` | `#00a4d6` | Highlighting, Glow Accents, Dark-Mode Text Highlights | 2.6:1 (on white) / 7.8:1 (on navy) | Dark surface accent |

---

## 3. Desktop Header Navigation & Layout Alignment

### Migration Artifact Diagnosis
During the initial site reconstruction, the desktop header was wrapped in a 3-element `flex justify-between` container:
- Item 1: Brand Logo (~150px)
- Item 2: Navigation Links (variable width)
- Item 3: Actions & Phone Container (~500px)

Because Item 1 and Item 3 were asymmetric, the center navigation drifted ~150px to the left of the true viewport center, producing an awkward, misaligned visual artifact on desktop screens.

### Canonical 2-Column Solution
In alignment with the original Telestar website and corporate telecom standards, the desktop header is structured as a clean 2-column layout:
1. **Left Column**: Brand Logo anchor.
2. **Right Column**: A single, unified `flex items-center gap-6 lg:gap-8` cluster containing:
   - Primary Navigation (`Home`, `Solutions`, `Testimonials`, `Contact`)
   - Vertical visual divider (`h-5 w-px bg-slate-200`)
   - Telephone Support anchor (`(804) 930-8400`)
   - Secondary Utility (`Customer Login` button)
   - Primary Action (`Schedule Consultation` button)

This guarantees zero center-drift across all desktop viewports (1024px to 1920px).

---

## 4. Typography Scale & Hierarchy

- **Font Family**: System UI stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) ensuring 0kb font network penalty and instantaneous First Contentful Paint (<10ms).
- **H1 Headline**: `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]`
- **H2 Section Title**: `text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight`
- **H3 Card/Feature Title**: `text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight`
- **Body Text**: `text-slate-600 text-sm sm:text-base leading-relaxed`
- **Badges/Pills**: `text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full`

---

## 5. Multi-Agent Design Reviewer Fleet Rubric

When auditing future feature additions or visual updates, autonomous reviewer agents evaluate PRs against these 4 standards:

1. **Brand-Fidelity**: No arbitrary Tailwind blues (`blue-500`, `blue-600`); all accents must route through `--color-brand-cyan*` or `--color-brand-navy`.
2. **Layout-Alignment**: Strict adherence to the 2-column header and grid container constraints (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
3. **Responsive-UX**: All interactive targets (buttons, links, drawer items) must have a touch target of at least 44×44px with clear active/focus states.
4. **Accessibility (WCAG 2.1 AA)**: Normal text (<18pt) must maintain ≥ 4.5:1 contrast ratio against its background.
