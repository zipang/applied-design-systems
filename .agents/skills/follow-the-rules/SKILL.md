---
name: follow-the-rules
description: Review some code to check conformance against the project's internal quality requirements and rules.
---

# Skill: follow-the-rules

Review some code changes against the **project rules** before it lands.
This skill does not restate the rules — it points at them. The rules are:

- `AGENTS.md` (root) — project context, working rules, design system invariants,
  tooling, and commit conventions
- `skills/design-system-tokens/SKILL.md` — the fixed token list, the dual-file
  contract, and the validation rules in section 10
- The nearest `AGENTS.md` above the file under review. Read it before applying the
  defaults. For a demo, this is `demos/<name>/AGENTS.md`, then its `src/AGENTS.md` for
  TypeScript, then its `src/components/AGENTS.md` for components. Those files override
  these defaults.

## When to Use

- Before committing or merging any change (ask for review when asked to
  "review", "check rules", or before `/commit`)
- After any feature, refactor, rule-file change, or bug fix

## Proportionate Verification

Run only what the change can affect:

| Change | Verification |
|---|---|
| Docs only (`*.md`, comments) | Use the `technical-writing` skill and check the project's glossary for proposed updates |
| Config/tooling | Only the tools the config affects |
| Source code | Full gates: `bun test`, `bun --check`, `bun run check` |

Never re-run a command that passed on unchanged files.

## The Review Pass

Walk the diff once per axis. Cite file:line for every finding.

1. **Rules compliance** — Does the change follow root `AGENTS.md`? Fixed token
   list, dual-file values identical, focused commit? For a package with its own
   `AGENTS.md`, apply those rules too.
2. **Design System** — No raw colors, sizes, or radii in component CSS; token
   `var()` only; the stylesheet is the last import; no undocumented tokens; the
   derived `muted`/`active` variants are not listed in the front matter.
3. **Docs** — Markdown follows the `README.md` glossary and the
   `technical-writing` skill; it does not restate rules documented elsewhere.
4. **Efficiency** — No duplicated logic where a shared util exists
   (DRY); no over-memoization; no premature abstraction; no dead code left.
5. **Behavior** — Tests assert observable behavior that would catch a
   regression; build and suite green.

## Findings Format

Label each finding so the author knows what is required:

- *(no prefix)* — required fix before merge
- **Critical:** blocks merge (broken behavior, security)
- **Nit:** optional polish
- **FYI:** context only

Lead with correctness; a few high-conviction findings beat long lists.

## Verdict

End with exactly one of:
- **Approve** — commit may proceed
- **Request changes** — list what must change first
