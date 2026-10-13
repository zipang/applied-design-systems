# Radix UI Starter

A themeable chat demo that applies the **Applied Design Systems** token contract on top of
Radix UI. Radix UI primitives have no styles. The demo wraps each primitive and styles
it with design tokens only. This is a reference, not a mockup. Copy its patterns.

## Structure

```
radix-ui-starter/
├── index.html               HTML entrypoint, loads src/main.tsx
├── package.json             standalone package with its own dependencies
├── tsconfig.json            standalone config; declares the import aliases
├── themes/<name>/           one complete Design System per theme
│   ├── DESIGN.md              the token values and the component rules
│   └── design-tokens.css      the same tokens as CSS variables
└── src/
    ├── server.tsx           Bun dev server (HTML import)
    ├── main.tsx             React entrypoint
    ├── App.tsx              page shell and page switch
    ├── components/          the component library, in five tiers
    │   ├── base/            primitives: Box, Heading, Text, Icon
    │   ├── ui/              Radix UI wrappers: Button, TextField, DropdownMenu,
    │   │                    Dialog, Avatar, ScrollArea, ThemeSwitcher
    │   ├── layout/          layout primitives and the page shell
    │   ├── chat/            chat demo components
    │   └── demo/            demo pages and their sections
    ├── lib/                 pure logic, each module with a colocated test
    │   ├── eliza/           reply generation for the chat
    │   ├── scroll/          scroll-direction hook
    │   ├── theme/           theme provider and the token contract test
    │   ├── clsx.ts          class-name composition
    │   ├── common-props.ts  the curated DOM prop surface
    │   └── format.ts        text formatting
    ├── styles/              shared, theme-agnostic stylesheets
    └── assets/icons/        SVG icons, rendered inline by base/Icon
```

## Notes

* [Components logic](src/components/README.md). 
* `tsconfig.json` declares the aliases `@components`, `@assets`, `@lib` and `@styles`.
