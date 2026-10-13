---
version: alpha
name: Monokai

# ============================================================================
# COLORS  —  every entry maps to a --color-* CSS variable
# ============================================================================
colors:
  brand:
    primary:   "#f92672"   # --color-brand-primary   (headings, contrast)
    accent:    "#a6e22e"   # --color-brand-accent    (CTAs, highlights, selection)
    secondary: "#75715e"   # --color-brand-secondary (optional, overridden)
    # tertiary: omitted → --color-brand-tertiary: var(--color-brand-primary)

  action:
    success: "#a6e22e"     # --color-action-success
    info:    "#66d9ef"     # --color-action-info
    warning: "#fd971f"     # --color-action-warning
    danger:  "#f92672"     # --color-action-danger

  # Text  (drop-.base rule: colors.text.base -> --color-text)
  text:
    base:    "#f8f8f2"     # --color-text
    accent:  "#a6e22e"     # --color-text-accent (highlighted or selected text)
    muted:   "#a6a69c"     # --color-text-muted
    ondark:  "#ffffff"     # --color-text-ondark

  # Surface  (drop-.base rule: colors.surface.base -> --color-surface)
  surface:
    base: "#272822"        # --color-surface
    alt:  "#2f2f2a"        # --color-surface-alt
    dark: "#1e1f1c"        # --color-surface-dark
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

Monokai, ported to the fixed Design Systems Applied token set. A dark theme with
warm gray surfaces and pink and green accents. The typography, spacing, radii,
elevation, and border widths match the reference theme. Only the colors differ.

## Colors

- **Primary (`#f92672`)** — Monokai pink. Headings and contrast.
- **Accent (`#a6e22e`)** — Monokai green. CTAs, highlights, and selection.
- **Secondary (`#75715e`)** — Warm gray. Decorative surfaces.
- **Text base (`#f8f8f2`)** — Off-white body text.
- **Text accent (`#a6e22e`)** — Highlighted or selected text.
- **Text muted (`#a6a69c`)** — Subdued text: captions, notes.
- **Text ondark (`#ffffff`)** — Text on dark surfaces.
- **Surface base (`#272822`)** — Default background.
- **Surface alt (`#2f2f2a`)** — Aside panels and alternating sections.
- **Surface dark (`#1e1f1c`)** — Footer and deep sections.

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

- Do reserve the accent green for highlights, selection, and CTAs
- Do keep text on `colors.text.base`, never the accent
- Do not list the derived `muted` / `active` variants in the front matter
