# assets/icons/

The demo's SVG icons. `base/Icon` renders these files inline, so the strokes follow
`currentColor`. The project does not use an external icon library.

## Files

| File | Name | Use |
|------|------|-----|
| `add.svg` | `add` | Attach a file. |
| `send.svg` | `send` | Send a message. |
| `reset.svg` | `reset` | Start over. |
| `check.svg` | `check` | The active theme. |
| `chevron-down.svg` | `chevron-down` | The theme dropdown. |
| `cross.svg` | `cross` | Remove an attachment. |
| `file.svg` | `file` | An attached file. |

## Conventions

Every icon follows the same rules, so one size and one color work for all of them:

- A `24` by `24` `viewBox`.
- `fill="none"` and `stroke="currentColor"`.
- `stroke-width="2"`, `stroke-linecap="round"`, and `stroke-linejoin="round"`.
- `aria-hidden="true"` on the `svg`. The `Icon` component sets the accessible name.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 5v14" />
  <path d="M5 12h14" />
</svg>
```

## Add an icon

1. Add the `.svg` file to this directory.
2. Import it in [`../../components/base/icons.ts`](../../components/base/icons.ts) with
   the text type: `import nameIcon from "@assets/icons/<name>.svg" with { type: "text" };`
3. Add the entry to the `icons` map.

The `IconName` type derives from the map. No other change is necessary.

```tsx
import { Icon } from "@components/base/Icon";

<Icon name="add" label="Attach a file" />
```
