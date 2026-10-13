# AGENTS.md

Project context and rules for AI agents working in this repository.

## What this project is

**Design Systems Applied** documents an opinionated Design System approach on top of
the Google Labs `DESIGN.md` spec. It defines a fixed list of design tokens, a dual-file
contract (`DESIGN.md` + `design-tokens.css`), and the skills and commands that keep a
product visually coherent. It is primarily a reference and distribution repo, not an
application. Humans are the second audience; agents are the first.

See `README.md` for the full problem statement and glossary.

## Repository layout

```
.agents/skills/<name>/SKILL.md    Agent skills discovered by opencode.
.opencode/commands/*.md           Slash commands.
skills/design-system-tokens/      Canonical, distributable copy of the core skill.
  references/                     Example DESIGN.md, design-tokens.css, reset, utilities.
  presets/                        Elevation and border presets.
roadmap/TXXXX/{spec,plan}.md      Tickets (units of planned work).
tools/                            Token contract validator/sync CLI (planned).
demos/                            Demonstration applications (agent-first examples).
.tmp/                             Throwaway experiments. Never committed.
```

The canonical `design-system-tokens` skill stays at `skills/` so it can be copied into
other projects. `.agents/skills/design-system-tokens/SKILL.md` is a proxy that points
there; never duplicate token content into the proxy.

## Working rules

- **Do not ask for permission to work outside the project directory.** Use the local
  `.tmp/` directory for throwaway experiments, scratch files, and temporary clones.
  Nothing in `.tmp/` is committed.
- **Never commit secrets.** Keep credentials out of the repo and out of `.tmp/`.
- Keep the working tree focused: stage only the files a change concerns.

## Use the Applied Design System

- `DESIGN.md` front matter is the source of truth for token values; the `design-token.css` stylesheet 
  is the executable half of the contract.
- To change a token value, edit it in **both** `DESIGN.md` front matter and
  `design-tokens.css`, and keep them identical.
- The token list is **fixed**. Do not add undocumented tokens.
- Follow the token tables in `skills/design-system-tokens/SKILL.md` and its validation
  rules (section 10) for every edit.
- Components consume tokens with `var()`; never write raw colors, sizes, or radii in
  component CSS.

## Workflow

Work is tracked as Tickets under `roadmap/TXXXX/`: a `spec.md` (requirements) and a
`plan.md` (ordered tasks). Use the `/spec`, `/plan`, and `/implement` commands. Keep the
spec alive: update it before changing direction.

## Tooling

```
Install:    bun install
Check:      bun run check
Typecheck:  bun run typecheck
Test:       bun test
Format:     bun run format
```

Run `bun run check` before committing any change to source, config, or CSS. For docs-only
changes, use the `technical-writing` skill and the `follow-the-rules` skill instead.

## Commits

Use conventional commits with the emoji from the `git-commit` skill, imperative mood,
first line under 72 characters. Commit at the end of each completed phase or task.

## Documentation style

- Follow the glossary in `README.md`; use its terms consistently.
- Do not restate rules already documented elsewhere; link to them.
- Prefer short, direct prose.
