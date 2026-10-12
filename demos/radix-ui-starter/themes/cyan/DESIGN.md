---
version: alpha
name: Cyan

colors:
  brand:
    primary:   "#003f45"
    accent:    "#00FFFF"
    secondary: "#315e63"
    tertiary:  "#79a0a4"
  action:
    success: "#08783e"
    info:    "#00FFFF"
    warning: "#8a5700"
    danger:  "#b42318"
  text:
    base:    "#04282c"
    accent:  "#006c75"
    muted:   "#315e63"
    ondark:  "#04282c"
  surface:
    base: "color-mix( in srgb, var(--color-brand-accent) 3%, white )"
    alt:  "rgba(0, 255, 255, 0.12)"
    dark: "#00FFFF"
    card: "#ffffff"

typography:
  base: {
    fontFamily: '"Space Mono", monospace',
    fontWeight: "var(--font-weight-regular)",
    lineHeight: "var(--line-height-regular)"
  }
  display: {
    fontFamily: '"Space Mono", monospace',
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--line-height-tight)"
  }
  mono: {
    fontFamily: '"Space Mono", monospace',
    fontWeight: "var(--font-weight-thin)",
    lineHeight: "var(--line-height-regular)"
  }

rounded:
  none: "0"
  sm:   "0.25rem"
  md:   "0.75rem"
  lg:   "1.25rem"
  full: "9999px"

spacing:
  xs:   "0.25rem"
  sm:   "0.5rem"
  md:   "0.75rem"
  base: "1rem"
  lg:   "1.5rem"
  xl:   "2rem"
  xxl:  "3rem"

elevation:
  sm: "none"
  md: "none"
  lg: "none"

border:
  sm: "0.0625rem"
  md: "0.125rem"
  lg: "0.25rem"
---

## Overview

The **cyan** theme, ported from the applied-design-systems-eliza-chatbot-demo
reference. It uses the same token contract; only colors and fonts differ from the
paper theme.

## Colors

Brand, action, text, and surface roles follow the reference palette. The surface
tint is derived with `color-mix` over the accent.

### Resolved color contrast pairs

Every colored role above has a companion `--color-on-*` token: the foreground for text
drawn on that role's background. They are auto-calculated — the theme picks the text color
with the higher WCAG 2.1 contrast, or black/white when neither meets 4.5:1 — and never
appear in the front matter. UI components must use them for text on a surface: the
`primary`, `accent`, `success`, `warning`, `danger`, and `info` button variants
read their foreground from `--color-on-*`.

## Typography

Fonts are set per theme (DM Sans, IBM Plex Mono, Space Mono, or Azeret Mono).
