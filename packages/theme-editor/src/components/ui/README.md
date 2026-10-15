# ui/

Radix UI wrappers and generic UI primitives. Each component adds token styling to an
unstyled Radix primitive or to a plain element. The rules for the tier are in
[`../AGENTS.md`](../AGENTS.md).

Examples use the package aliases declared in [`tsconfig.json`](../../tsconfig.json).

## Button

Token-styled button with an optional leading icon.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | `string` | — | Button text. Omit for an icon-only button. |
| `icon` | icon name | — | Leading icon. |
| `ariaLabel` | `string` | — | Required for an icon-only button. |
| `onClick` | `() => void` | — | Click handler. |
| `variant` | `primary`, `accent`, `secondary`, `ghost`, `success`, `warning`, `danger`, `info` | `primary` | Visual style. |
| `size` | `sm`, `default`, `lg` | `default` | Token height and padding. |
| `type` | `button`, `submit`, `reset` | `button` | Native button type. |
| `loading` | `boolean` | `false` | Shows the loading state. The button is disabled. |
| `disabled` | `boolean` | `false` | Disables the button. |
| `ref` | `Ref<HTMLButtonElement>` | — | Element ref. |

States: `is-loading`, `is-disabled`.

```tsx
import { Button } from "@components/ui/Button";

<Button label="Start over" icon="reset" variant="ghost" onClick={reset} />
<Button label="Send" type="submit" disabled={!canSend} />
<Button icon="add" ariaLabel="Attach a file" />
```

## TextField

Single-line text field with a label and an optional error message.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `id` | `string` | — | Links the label and the input. |
| `label` | `string` | — | Field label. |
| `value` | `string` | — | Controlled value. |
| `onChange` | `(value: string) => void` | — | Value change handler. |
| `placeholder` | `string` | — | Placeholder text. |
| `error` | `string` | — | Error message. Shows the invalid state. |
| `disabled` | `boolean` | `false` | Disables the input. |
| `readOnly` | `boolean` | `false` | Makes the input read-only. |

States: `is-invalid`, `is-disabled`, `is-readonly`.

```tsx
import { TextField } from "@components/ui/TextField";

<TextField id="name" label="Name" value={name} onChange={setName} />
<TextField id="email" label="Email" value={email} onChange={setEmail} error="A value is required" />
```

## DropdownMenu

Composable menu built on Radix UI. The menu content is portaled.

| Part | Key props | Notes |
|------|-----------|-------|
| `DropdownMenu` | `children` | Root. |
| `DropdownMenuTrigger` | `children`, `className` | Opens the menu. |
| `DropdownMenuContent` | `children`, `align`: `start`/`center`/`end` | The menu surface. |
| `DropdownMenuItem` | `children`, `onSelect`, `disabled` | A selectable entry. State: `is-disabled`. |
| `DropdownMenuSeparator` | — | A divider between groups. |
| `DropdownMenuLabel` | `children` | A non-interactive label. |

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@components/ui/DropdownMenu";

<DropdownMenu>
  <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={clear}>Clear</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Dialog

Composable modal built on Radix UI. The dialog content is portaled.

| Part | Key props | Notes |
|------|-----------|-------|
| `Dialog` | `children`, `open`, `onOpenChange` | Root. |
| `DialogTrigger` | `children`, `className` | Opens the dialog. |
| `DialogContent` | `title`, `description`, `children` | The modal surface, a title, and a close button. |

```tsx
import { Dialog, DialogContent, DialogTrigger } from "@components/ui/Dialog";

<Dialog>
  <DialogTrigger>Open dialog</DialogTrigger>
  <DialogContent title="Dialog title" description="A token-styled modal.">
    <Button label="Confirm" variant="accent" />
  </DialogContent>
</Dialog>
```

## Avatar

Avatar with a text fallback.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `fallback` | `string` | — | Text or initials. |
| `src` | `string` | — | Image source. |
| `alt` | `string` | `""` | Image alternative text. |
| `size` | `sm`, `md`, `lg` | `md` | Token size. |
| `shape` | `rounded`, `square` | `rounded` | `rounded` is a circle. |

```tsx
import { Avatar } from "@components/ui/Avatar";

<Avatar fallback="EZ" size="lg" />
<Avatar fallback="SQ" shape="square" />
```

## ScrollArea

A vertically scrollable region with a token-styled scrollbar. Use it for a nested
scroll region. `PageBody` owns the page scroll.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `children` | `ReactNode` | — | Scrollable content. |
| `className` | `string` | — | Extra classes. |

```tsx
import { ScrollArea } from "@components/ui/ScrollArea";

<ScrollArea className="panel__scroll">{children}</ScrollArea>
```

## ThemeSwitcher

A dropdown that selects the active theme from the registry. It reads and writes the
theme through `useTheme()`. The active theme is marked with a check icon.

| Prop | Type | Notes |
|------|------|-------|
| `className` | `string` | Extra classes. |

```tsx
import { ThemeSwitcher } from "@components/ui/ThemeSwitcher";

<ThemeSwitcher />
```
