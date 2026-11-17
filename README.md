# patina

Shared React components for the owner's web apps, built on React, [React Aria Components](https://react-spectrum.adobe.com/react-aria/) and Tailwind CSS. Each app installs them as packages and uses its own theme, so a fix made here reaches every app.

| Path             | Package              | What it holds                                                                                                                                             |
| ---------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/aria`  | `@skonkwerks/patina` | Styled React Aria Components wrappers. No dependencies beyond React, React Aria, `cn` and `tailwind-variants`. See its [README](packages/aria/README.md). |
| `apps/storybook` | (not published)      | Storybook, for viewing every component's states in light and dark.                                                                                        |

Composite components (media strip, lightbox, image grid and so on) will go in sibling packages such as `@skonkwerks/patina-media`.

The naming spec is in [packages/aria/README.md](packages/aria/README.md#naming-spec).

## Commands

```sh
pnpm install
pnpm storybook         # Storybook at http://localhost:6006
pnpm check             # type-check every package
pnpm lint              # ESLint, including the aria dependency rule
pnpm format            # Prettier
```

## License

[MIT](LICENSE). The icon drawings in `packages/aria/src/icons.tsx` come from Tabler Icons, also MIT; see `packages/aria/THIRDPARTY.md`.
