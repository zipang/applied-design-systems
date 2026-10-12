---
version: alpha
name: Theme Editor Default

# ============================================================================
# COLORS — every entry maps to a --color-* CSS variable
# ============================================================================
colors:
  brand:
    primary:   "#0a0a0f"   # --color-brand-primary   (headings, logo, contrast)
    accent:    "#2d2dff"   # --color-brand-accent    (CTAs, highlights, selection)
    secondary: "#5b4fe9"   # --color-brand-secondary (supporting brand surface)
    tertiary:  "#e94f7e"   # --color-brand-tertiary  (accent surface)

  action:
    success: "#16a34a"     # --color-action-success
    info:    "#0ea5e9"     # --color-action-info
    warning: "#d97706"     # --color-action-warning
    danger:  "#dc2626"     # --color-action-danger

  text:
    base:    "#0c0c0a"     # --color-text            (drop-.base rule)
    accent:  "#000"        # --color-text-accent
    muted:   "#6b7280"     # --color-text-muted
    ondark:  "#f0efea"     # --color-text-ondark

  surface:
    base: "#f2f1ed"        # --color-surface         (drop-.base rule)
    alt:  "#e4e3de"        # --color-surface-alt
    dark: "#0c0c0a"        # --color-surface-dark
    card: "#ffffff"        # --color-surface-card

# ============================================================================
# TYPOGRAPHY — fontFamily values must match design-tokens.css exactly
# ============================================================================
typography:
  base: {
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    fontWeight: "var(--font-weight-regular)",
    lineHeight: "var(--line-height-regular)"
  }
  display: {
    fontFamily: '"DM Serif Display", Georgia, serif',
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--line-height-tight)",
    letterSpacing: "var(--letter-spacing-tight)"
  }
  mono: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontWeight: "var(--font-weight-thin)",
    lineHeight: "var(--line-height-regular)"
  }

# ============================================================================
# ROUNDED — corner radius presets (all five required)
# ============================================================================
rounded:
  none: "0"
  sm:   "0.25rem"
  md:   "0.5rem"
  lg:   "0.75rem"
  full: "9999px"

# ============================================================================
# SPACING — 4px linear scale, base is always 1rem
# ============================================================================
spacing:
  xs:   "0.25rem"
  sm:   "0.5rem"
  md:   "0.75rem"
  base: "1rem"
  lg:   "1.25rem"
  xl:   "2rem"
  xxl:  "3rem"

# ============================================================================
# ELEVATION — shadow presets (optional, default none)
# ============================================================================
elevation:
  sm: "0 1px 4px 0 rgb(0 0 0 / 6%)"
  md: "0 2px 8px -2px rgb(0 0 0 / 10%)"
  lg: "0 4px 16px -4px rgb(0 0 0 / 12%)"

# ============================================================================
# BORDER — border WIDTHS only (all required); border colors are not tokens
# ============================================================================
border:
  sm: "1px"
  md: "2px"
  lg: "4px"
---

## Overview

The default Design System for the Theme Editor. It matches the demo's
starting values so the two tools can be compared side by side.
It is a dual-file contract: the YAML front matter above is the source of truth
for token values, and `design-tokens.css` exposes every token as a CSS variable.

## Colors

- **Primary (`#0a0a0f`)** — Near-black. Headings, logo, and contrast.
- **Accent (`#2d2dff`)** — Electric blue. CTAs, highlights, and selection.
- **Secondary (`#5b4fe9`)** — Indigo. Supporting brand surfaces.
- **Tertiary (`#e94f7e`)** — Pink. Accent surfaces.
- **Success / Info / Warning / Danger** — Semantic feedback colors.
- **Text base (`#0c0c0a`)** — Body text. **Muted (`#6b7280`)** — captions and
  notes. **On-dark (`#f0efea`)** — text on dark surfaces.
- **Surface base (`#f2f1ed`)** — page background. **Alt (`#e4e3de`)** —
  alternating sections. **Dark (`#0c0c0a`)** — dark sections. **Card
  (`#ffffff`)** — cards and forms.

### Resolved color contrast pairs

Every colored role above has a companion `--color-on-*` token: the foreground for text
drawn on that role's background. They are auto-calculated — the tool picks the theme text
color with the higher WCAG 2.1 contrast, or black/white when neither meets 4.5:1 — and
never appear in the front matter. UI components must use them for text on a surface: the
`primary`, `accent`, `success`, `warning`, `danger`, and `info` button variants read their
foreground from `--color-on-*`.

### Color variants

Brand and action colors carry `muted` and `active` variants derived
automatically from the base color via CSS relative color syntax
(`hsl(from <base> h calc(s * 0.8) calc(l * 1.2))` and
`hsl(from <base> h calc(s * 1.2) calc(l * 1.1))`). These variants are **not
design tokens** — do not list them in the front matter. They live in
`color-variants.css`, included after the main stylesheet.

## Typography

Body text uses Plus Jakarta Sans; headings use DM Serif Display; code and
labels use JetBrains Mono. The size scale is geometric with ratio `1.333`
(Perfect Fourth) anchored at `1rem`: `xs` `0.5625rem` through `display`
`3.158rem`. Font sizes, weights, line heights, and letter spacing are
stylesheet-only tokens — they have no front-matter entry.

## Layout

A 4px linear spacing scale with `base` at `1rem`. Content is constrained to a
max width with generous section padding.

## Elevation & Depth

Three shadow presets (`sm`, `md`, `lg`) convey depth for cards, modals, and
dropdowns. Use them sparingly; color contrast and spacing carry most of the
hierarchy.

## Shapes

Corner radii run from `none` (`0`) to `full` (`9999px`). Inputs and small
badges use `sm`; cards and buttons use `md`; large panels use `lg`.

## Components

Components pick the color tokens they need for their states and variants. A
Button uses `--color-brand-primary` with `--color-on-primary` for its label;
a Card uses `--color-surface-card` with `--elevation-md`. Border colors are not
tokens — components choose the color token that fits.

## DO's and DON'Ts

- Do reserve the accent for highlights, selection, and CTAs.
- Do use `var()` fallbacks for optional tokens in the stylesheet.
- Do keep the front matter and `design-tokens.css` identical.
- Do not list derived `muted` / `active` variants as tokens.
- Do not write raw colors or sizes in component CSS.
