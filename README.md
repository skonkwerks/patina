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
just setup            # link the shared guidelines, install Playwright's Chromium for the story tests
pnpm install
pnpm storybook        # Storybook at http://localhost:6006
pnpm check            # type-check every workspace and the root scripts
pnpm lint             # oxlint, the fast lint pass
pnpm lint:es          # ESLint, the full pass, including the aria dependency rule
pnpm format           # Prettier, on the project's file types
pnpm test             # unit specs, and every story in Chromium with the axe accessibility check
just ci-local         # all of the above, in order: the gate before every commit
```

## License

[MIT](LICENSE). The icon drawings in `packages/aria/src/icons.tsx` come from Tabler Icons, also MIT; see `packages/aria/THIRDPARTY.md`.
