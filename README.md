# Design Systems Applied

## The problem

Vibe coding produces screens and applications fast. It also produces the problems that
make those applications hard to ship. The code becomes hard to maintain, the performance
drops, and the design drifts.

**Drift** is the slow loss of visual coherence across a product. Sizes, borders, colors,
and component behavior differ from page to page. Drift starts at the beginning, when a
project has no Design System and no vision. This is like building a house without a plan.

## The first proposal

Google Labs published a spec for a markdown file that describes a Design System to
coding agents: [`DESIGN.md`](https://github.com/google-labs-code/design.md). The file
combines machine-readable design tokens in YAML front matter with human-readable design
rationale in markdown prose.

This was a step in the right direction. The spec, however, enforces nothing. None of its
structures are mandatory. The same prompt can produce a different token set every time.
When the destination is already known, a new start on every project is not acceptable.

## Going one step further

This repository completes the spec with rules, guides, and skills. It started as the
`the-designer` recipe in the
[AI lab project](https://github.com/zipang/the-ai-lab/tree/master/recipes/the-designer)
and became its own foundation. Use it before every other recipe.

The key idea is a **fixed standard list** of design tokens. The list covers the frugal
needs of a Design System. The setup is minimalist by design. Each token lives in two
places:

- in the `DESIGN.md` front matter, the source of truth for token values;
- in a `design-tokens.css` stylesheet, which exposes every token as a CSS variable.

The front matter is a structured tree. CSS variables are flat. A fixed table maps one
notation to the other. For example, `colors.brand.primary` maps to
`--color-brand-primary`.

## Standard list of design tokens

The list is fixed and split into categories:

- **Colors**: `brand` (primary and accent, plus optional secondary and tertiary),
  `action` (success, info, warning, danger), `text` (base and optional variants), and
  `surface` (base, alt, and optional dark and card).
- **Typography**: `base`, `display`, and `mono` font families, a size scale from `xs`
  to `display`, font weights, line heights, and letter spacing.
- **Spacing**: an `xs` to `xxl` scale with `base` at `1rem`.
- **Shapes**: `rounded` corner radii and `border` widths.
- **Elevation**: `sm`, `md`, and `lg` shadow presets.

The full tables, the defaults, and the validation rules are in the skill:
[`skills/design-system-tokens/SKILL.md`](skills/design-system-tokens/SKILL.md). That file
is the source of truth. Do not restate it here.

## How to use it

1. Copy the full directory `skills/design-system-tokens/` 
   inside the `.agents/skills/` directory of your project. 
   Reload your session so that the agent discovers the skill there.
2. Ask the agent to create the `DESIGN.md` and `design-tokens.css` files in a documented the project location. The
   agent picks values from the fixed list and does not invent tokens.
3. Copy `references/color-variants.css` and `references/reset.css` into your project if
   you want the derived color variants and the base style reset.

## Repository layout

```
.agents/skills/       Agent skills, including the proxy for the core skill.
.opencode/commands/   Slash commands for the spec, plan, and review workflow.
skills/               The canonical, distributable design-system-tokens skill.
roadmap/TXXXX/        Tickets: a spec.md and a plan.md for each unit of work.
tools/                Token contract validator and sync CLI (planned).
demos/                Demonstration applications, starting with radix-ui-starter.
AGENTS.md             Rules for AI agents that work in this repository.
```

See `AGENTS.md` for the rules that agents must follow.

## Glossary

Entries are sorted alphabetically.

- **AI agent**: A program powered by an LLM (such as opencode) that reads this repository, follows its rules and skills, and writes code for us. Our rules and guides target AI agents first, humans second.
- **Design System**: The single source of truth for the visual language of a product. In this project, it is a dual-file contract: `DESIGN.md` (the rationale and rules) plus `design-tokens.css` (the tokens as CSS variables).
- **Design token**: A named visual value (a color, a font size, a spacing step) exposed as a CSS variable. The token list is fixed. Components must consume tokens with `var()` and never write raw values.
- **Design tokens stylesheet**: The `design-tokens.css` file. It defines every design token as a CSS variable inside one `:root` block. It is the executable half of the Design System contract.
- **DESIGN.md**: A markdown file at the root of a project, defined by the Google Labs spec. It holds the design tokens in YAML front matter and the component rules in prose.
- **Drift**: The slow loss of visual coherence across the pages of a product: inconsistent sizes, borders, colors, or component behavior. Also called "design derive". Drift is the main problem this project fights.
- **Recipe**: A self-contained procedure from our AI lab project (the-ai-lab) that combines prompts, rules, and tools to reach one goal. This project started as the "the-designer" recipe.
- **Skill**: A markdown file under `.agents/skills/` that gives an AI agent instructions for one task (for example: apply the Design System, write a spec, commit changes). The agent loads a skill when its task matches the skill description. The canonical `design-system-tokens` skill lives at `skills/` for distribution. A proxy under `.agents/skills/` points to it.
- **Ticket**: A unit of planned work under `roadmap/TXXXX/` that holds a `spec.md` (requirements) and a `plan.md` (ordered tasks). Ticket IDs run from `T0001` to `T9999`.
- **Vibe coding**: The practice of producing software by prompting an LLM without a plan or a specification. It is fast, but it causes the problems listed above.
