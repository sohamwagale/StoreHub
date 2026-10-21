---
name: RateHub Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#41485e'
  on-tertiary: '#ffffff'
  tertiary-container: '#586076'
  on-tertiary-container: '#d4dbf5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a trustworthy, high-utility, and clear visual language for a modern store discovery, rating, and review SaaS platform. It bridges consumer discovery with enterprise-grade analytics, requiring an aesthetic that balances approachability with operational rigor.

### Personality & Tone
- **Authoritative & Objective:** Visual elements emphasize neutrality, uncompromised readability, and data integrity.
- **Polished & Modern:** Precision-engineered layouts with structural rhythm, subtle micro-interactions, and refined visual density.
- **Efficient & Frictionless:** High scannability, evident hierarchies, and low cognitive load across dense discovery feeds and review management views.

### Design Movement
- **Modern Clean SaaS / Refined Precision:** A synthesis of structured white-space minimalism, discrete border separation, crisp directional shadows, and tactile depth layers. Heavy gradients and saturated neon treatments are strictly prohibited in favor of clear slate surfaces, indigo semantic focal points, and warm amber rating cues.

## Colors

The palette relies on deliberate role separation to maintain WCAG AAA compliance for core typography and AA compliance for interactive controls.

### Palette Architecture
- **Primary (`#4F46E5` - Indigo):** The operational lead color. Used for key interactive targets, active states, verified badges, and primary action affordances.
- **Secondary (`#F59E0B` - Amber Rating):** Dedicated to scoring indicators, star ratings, satisfaction highlights, and caution accents.
- **Tertiary (`#0F172A` - Deep Slate):** Provides high-contrast anchor contrast for headers, primary typography, and dark contextual chrome.
- **Neutral (`#64748B` - Slate Core):** Anchors secondary body text, metadata, subtle borders (`#E2E8F0`), muted fills (`#F1F5F9`), and foundational app backgrounds (`#F8FAFC`).

### Surface Strategy
- **Canvas Base:** `#F8FAFC` provides a soft backdrop that prevents eye fatigue while keeping pure `#FFFFFF` available for elevated cards, inputs, and modals.
- **Interactive States:** Primary elements transition to `#4338CA` on hover and `#3730A3` on active press. Focus rings utilize `#4F46E5` with an alpha blend of 20% to prevent visual crowding while remaining distinct.

## Typography

The typography scale utilizes **Plus Jakarta Sans** across all roles to unify clarity, geometric precision, and human readability.

### Structural Hierarchy
- **Headlines:** Displayed in Bold (`700`) and SemiBold (`640`) with negative tracking (`-0.01em` to `-0.025em`) to compact vertical space and deliver clear scannability on desktop storefront feeds.
- **Body:** Retains a default regular weight (`400`) with spacious line heights (`1.5` to `1.625`) to ensure readability across multi-paragraph customer testimonials and detailed store profiles.
- **Labels & Micro-copy:** Rendered with SemiBold (`600`) and Bold (`700`) weights with slightly open tracking (`0.01em` to `0.04em`) to maintain legibility when set against status badges, rating counters, and metric headers.

## Layout & Spacing

The layout is built around an 8-point base grid system, operating within an adaptable 12-column fluid framework on larger displays and single-to-dual column layouts on handheld displays.

### Grid & Breakpoints
- **Desktop (1280px and above):** 12-column layout, max container width of 1280px, 32px (`gutter-lg`) gutters, and 48px (`margin-lg`) margin padding.
- **Tablet (768px – 1279px):** 8-column layout, fluid margins scaling from 24px (`margin`) to 32px, 24px (`gutter`) gutters.
- **Mobile (Below 768px):** 4-column layout, 16px (`margin-sm`) margins, 16px (`gutter-sm`) gutters. Side rails fold into drawer patterns, and filter ribbons transform into sticky bottom sheets.

### Spacing Application
- Component internal paddings strictly follow `space-*` tokens. 
- Form fields and utility buttons standardise on `space-sm` vertical and `space-md` horizontal breathing room.
- Grid listings for stores and review lists enforce consistent gaps using `space-lg` and `space-xl`.

## Elevation & Depth

Visual hierarchy uses a refined layered technique: precise, low-contrast border lines paired with ambient, tinted shadows. Pure black drop-shadows are excluded in favor of slate-tinted ambient occlusion (`rgba(15, 23, 42, ...)`).

### Elevation Hierarchy
- **Level 0 (Flat / Canvas):** Applied to the main application background (`#F8FAFC`). No shadow, no border.
- **Level 1 (Default Surface / Rest):** Base cards, data tables, and review cards. Surface: `#FFFFFF`. Border: `1px solid #E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Interactive / Hover):** Activated card states, store cards on mouseover, and search inputs on active state. Surface: `#FFFFFF`. Border: `1px solid #CBD5E1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Popovers & Dropdowns):** Navigation menus, filter dialogs, autocomplete suggestions. Surface: `#FFFFFF`. Border: `1px solid #E2E8F0`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Modals & Overlays):** Store claim dialogues, review creation overlays, image lightboxes. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`. Backdropped by `rgba(15, 23, 42, 0.45)`.

## Shapes

The interface embraces a structured curvature philosophy (Scale `2`) balancing the approachability of social discovery with enterprise visual order.

### Shape Radii
- **Standard Radius (`rounded-md` - 0.5rem / 8px):** Applied to form inputs, check inputs, dropdown items, compact buttons, and tags.
- **Prominent Radius (`rounded-lg` - 1rem / 16px):** Applied to action cards, modular dashboards, filter bars, and modal containers.
- **Featured Radius (`rounded-xl` - 1.5rem / 24px):** Dedicated to high-level store display cards, category tiles, and hero containers.
- **Pill (`rounded-full`):** Reserved exclusively for status indicators, rating chips, verification badges, and avatar frames.

## Components

### Buttons
- **Primary:** Background `#4F46E5`, text `#FFFFFF`, border `transparent`. Hover: `#4338CA`. Active: `#3730A3`. Height: 40px (desktop), padding: `0 1rem`. Radius: `0.5rem`.
- **Secondary / Outline:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`. Hover: `#F8FAFC` and border `#CBD5E1`. Focus ring: `0 0 0 3px rgba(79, 70, 229, 0.15)`.
- **Ghost:** Background `transparent`, text `#334155`. Hover: `#F1F5F9`, text `#0F172A`.

### Input Fields & Controls
- **Text Inputs & Selects:** Height 40px, background `#FFFFFF`, border `1px solid #E2E8F0`, corner radius `0.5rem`, padding `0 0.875rem`. Text: `#0F172A`, placeholder: `#94A3B8`. Focus state: border `#4F46E5`, box-shadow `0 0 0 3px rgba(79, 70, 229, 0.15)`.
- **Checkboxes & Radios:** Size 16px x 16px. Border `1px solid #CBD5E1`. Checked state: Background `#4F46E5`, check icon `#FFFFFF`, border-color `#4F46E5`.

### Chips & Badges
- **Status Badges:** Height 24px, padding `0 0.5rem`, corner radius `9999px`. 
  - *Verified:* Background `#EEF2FF`, text `#4F46E5`, border `1px solid #E0E7FF`.
  - *Success / High Rating:* Background `#ECFDF5`, text `#059669`, border `1px solid #D1FAE5`.
- **Category Filter Chips:** Interactive pills, default background `#FFFFFF`, border `1px solid #E2E8F0`, text `#334155`. Selected: Background `#0F172A`, text `#FFFFFF`, border `#0F172A`.

### Rating Stars & Score Indicators
- **Rating Stars:** Standard size 18px (card preview) and 24px (detail page). Color: `#F59E0B`. Inactive/empty star color: `#E2E8F0`. Half-fill supported via SVG offset masks.
- **Rating Score Badges:** Deep bold score font (`title-md`), text `#0F172A`, paired adjacent to an amber star icon.

### Cards
- **Store Discovery Card:** Background `#FFFFFF`, border `1px solid #E2E8F0`, radius `1rem` (`rounded-lg`) or `1.5rem` (`rounded-xl` for featured showcases). Shadow: Level 1 elevation transitioning to Level 2 on hover with a smooth 150ms ease transition. Padding: `1.5rem`.
- **Review Item Card:** Border-bottom `1px solid #F1F5F9`, flat background `#FFFFFF`, internal element spacing `0.75rem`. Features user metadata, verification badge, amber rating aggregate, text body, and helpfulness reaction controls.