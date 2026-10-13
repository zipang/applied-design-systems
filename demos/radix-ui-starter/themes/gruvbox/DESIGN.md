---
version: alpha
name: Gruvbox

# ============================================================================
# COLORS  —  every entry maps to a --color-* CSS variable
# ============================================================================
colors:
  brand:
    primary:   "#fabd2f"   # --color-brand-primary   (headings, contrast)
    accent:    "#fe8019"   # --color-brand-accent    (CTAs, highlights, selection)
    secondary: "#504945"   # --color-brand-secondary (optional, overridden)
    # tertiary: omitted → --color-brand-tertiary: var(--color-brand-primary)

  action:
    success: "#b8bb26"     # --color-action-success
    info:    "#83a598"     # --color-action-info
    warning: "#fabd2f"     # --color-action-warning
    danger:  "#fb4934"     # --color-action-danger

  # Text  (drop-.base rule: colors.text.base -> --color-text)
  text:
    base:    "#ebdbb2"     # --color-text
    accent:  "#fe8019"     # --color-text-accent (highlighted or selected text)
    muted:   "#928374"     # --color-text-muted
    ondark:  "#ebdbb2"     # --color-text-ondark

  # Surface  (drop-.base rule: colors.surface.base -> --color-surface)
  surface:
    base: "#282828"        # --color-surface
    alt:  "#3c3836"        # --color-surface-alt
    dark: "#1d2021"        # --color-surface-dark
    # card:  omitted → --color-surface-card: var(--color-surface)

# ============================================================================
# TYPOGRAPHY  —  entries are objects;
# fontFamily, fontWeight, lineHeight, letterSpacing values MUST use existing preset values from design-tokens.css (CSS variables)
# ============================================================================
typography:
  base: {
    fontFamily: 'ui-serif, "Palatino Linotype", Cambria, Georgia, serif',
    fontWeight: "var(--font-weight-regular)",
    lineHeight: "var(--line-height-regular)"
  }
  display: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Verdana, sans-serif',
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--line-height-tight)",
    letterSpacing: "var(--letter-spacing-tight)"
  }
  mono: {
    fontFamily: 'ui-monospace, "Courier New", monospace'
  }

# ============================================================================
# ROUNDED  —  corner radius presets (all five are required)
# ============================================================================
rounded:
  none: "0"
  sm:   "0.25rem"
  md:   "0.75rem"
  lg:   "1.125rem"
  full: "100%"

# ============================================================================
# SPACING  —  spatial rhythm scale, 4px linear (all required)
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
# ELEVATION  —  shadow presets (optional, default none)
# ============================================================================
elevation:
  sm: "none"
  md: "none"
  lg: "none"

# ============================================================================
# BORDER  —  border WIDTHS (all required)
# ============================================================================
border:
  sm: "1px"
  md: "2px"
  lg: "4px"
---

## Overview

Gruvbox, ported to the fixed Design Systems Applied token set. A warm, retro dark
theme with yellow and orange accents. Typography, spacing, radii, elevation, and
borders match the reference theme. Only the colors differ.

## Colors

- **Primary (`#fabd2f`)** — Gruvbox yellow. Headings and contrast.
- **Accent (`#fe8019`)** — Gruvbox orange. CTAs, highlights, and selection.
- **Secondary (`#504945`)** — Warm gray. Decorative surfaces.
- **Text base (`#ebdbb2`)** — Warm off-white body text.
- **Text accent (`#fe8019`)** — Highlighted or selected text.
- **Text muted (`#928374`)** — Subdued text.
- **Text ondark (`#ebdbb2`)** — Text on dark surfaces.
- **Surface base (`#282828`)** — Default background.
- **Surface alt (`#3c3836`)** — Aside panels and alternating sections.
- **Surface dark (`#1d2021`)** — Footer and deep sections.

### Resolved color contrast pairs

Every colored role above has a companion `--color-on-*` token: the foreground for text
drawn on that role's background. They are auto-calculated — the theme picks the text color
with the higher WCAG 2.1 contrast, or black/white when neither meets 4.5:1 — and never
appear in the front matter. UI components must use them for text on a surface: the
`primary`, `accent`, `success`, `warning`, `danger`, and `info` button variants
read their foreground from `--color-on-*`.

### Color variants

Brand and action colors carry derived `muted` and `active` variants in
`color-variants.css`, included after this stylesheet.

## Typography

Body uses a system serif stack. Headings use the system sans stack. Code and labels
use `ui-monospace`. Sizes come from the stylesheet, not the front matter.

## Layout

A 4px linear spacing scale with `base` at `1rem`.

## Elevation & Depth

Flat: all elevation tokens are `none`. Depth comes from surface contrast.

## DO's and DON'Ts

- Do reserve the accent orange for highlights, selection, and CTAs
- Do keep text on `colors.text.base`, never the accent
- Do not list the derived `muted` / `active` variants in the front matter
