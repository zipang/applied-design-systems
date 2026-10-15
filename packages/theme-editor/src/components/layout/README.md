# layout/

Layout primitives and the page shell. These components position content and consume
spacing tokens only. The rules for the tier are in [`../AGENTS.md`](../AGENTS.md).

## Primitives

| Component | Props | Notes |
|-----------|-------|-------|
| `Container` | `as`: `div`/`main`/`section`/`nav`, `width`: `fluid`/`lg`/`prose` | Centers content. `lg` is 52rem. `prose` is 70ch. |
| `VStack` | `gap`, `align`: `start`/`center`/`end`/`stretch` | Vertical stack. |
| `HStack` | `gap`, `align`, `justify`: `start`/`center`/`end`/`between`, `wrap` | Horizontal stack. |
| `Grid` | `columns`: `1`–`4`, `gap` | Fixed column grid. |

The `gap` props use the `Space` type from [`space.ts`](./space.ts): `xs`, `sm`, `md`,
`base`, `lg`, `xl`, `xxl`.

The primitives also accept the box aspects through `BoxProperties` (`p`, `px`, `py`,
`m`, `mx`, `my`, `border`, `borderColor`, `elevation`, `rounded`, `background`). They
merge `boxClassNames` into their root class. `Container` sets the `px` default to `lg`.

```tsx
import { Container } from "@components/layout/Container";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";

<Container width="prose">
  <VStack gap="lg">
    <HStack gap="sm" justify="between">
      <Heading level={2}>Title</Heading>
      <Button label="Action" />
    </HStack>
  </VStack>
</Container>
```

## Page shell

`PageLayout` is the application shell. It fills the viewport. The header and the footer
stay pinned, and the body scrolls. The shell is a CSS grid with the rows
`auto`, `minmax(0, 1fr)`, `auto`.

```
main.layout-page                 PageLayout
├── header.layout-page-header    PageHeader      grid row 1
├── article.layout-page-body     PageBody        grid row 2, the scroller
└── footer.layout-page-footer    PageFooter      grid row 3
```

Each region sets its own grid row, so the regions are optional and their order does not
matter. A page returns only the regions it needs.

| Component | Element | Props | Notes |
|-----------|---------|-------|-------|
| `PageLayout` | `main` | `children`, `className` | The shell. Holds the scroll context. |
| `PageHeader` | `header` | `children`, `className` | The fixed top region. |
| `PageBody` | `article` | `children`, `className` | The scroll region. Registers itself as the scroller. |
| `PageFooter` | `footer` | `children`, `className` | The fixed bottom region. |
| `SiteNavigationHeader` | `div` | `children`, `className` | The primary navigation. It collapses on scroll-down. |

```tsx
import { PageBody } from "@components/layout/PageBody";
import { PageHeader } from "@components/layout/PageHeader";
import { PageLayout } from "@components/layout/PageLayout";
import { SiteNavigationHeader } from "@components/layout/SiteNavigationHeader";

<PageLayout>
  <PageHeader>
    <SiteNavigationHeader>
      <AppNav />
    </SiteNavigationHeader>
  </PageHeader>
  <PageBody>{content}</PageBody>
</PageLayout>
```

### SiteNavigationHeader

The navigation collapses to zero height when the user scrolls down, and it returns when
the user scrolls up. The body gains the space. The collapse uses
`grid-template-rows: 1fr` to `0fr` on an inner element. While collapsed, the controls
are `inert` and hidden from assistive technology.

The component reads the scroll element from the page scroll context. Outside a
`PageLayout` it falls back to the window scroll.

### Landmarks

- `PageLayout` is the only `main`.
- `PageHeader` and `PageFooter` are inside `main`, so they are not `banner` or
  `contentinfo`. They are page-scoped.
- A page header block goes in `PageBody`. Do not nest a `header` inside another
  `header`. In the chat page, `ChatHeader` is the `article`'s `header`.

## Scroll logic

The shell shares the scrolling element through [`page-scroll.ts`](./page-scroll.ts).
The hooks live in `src/lib/scroll/`:

- `useScrollDirection(target, options)` returns `"up"` or `"down"`. The default
  threshold is 8 pixels. The value changes only on a reversal.
- `useHideOnScroll(target, options)` returns `true` while the navigation hides. It
  resets to `false` at the top and when the scroller changes.

Both hooks ignore the scroll clamp that follows the collapse, because that clamp is not
a user scroll. They process real downward scrolls during the collapse.
